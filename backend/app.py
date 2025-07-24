import os
import json
import re
from fastapi import FastAPI, File, UploadFile, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
import fitz  # PyMuPDF
import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
from dotenv import load_dotenv
import hashlib
from openai import OpenAI

# --- Setup ---
load_dotenv()
app = FastAPI()

# --- Caching Mechanism ---
ANALYSIS_CACHE = {}

# --- API Client Configuration ---
try:
    gemini_api_key = os.getenv("GOOGLE_API_KEY")
    if not gemini_api_key: raise ValueError("Google API key not found.")
    genai.configure(api_key=gemini_api_key)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")

try:
    deepseek_api_key = os.getenv("DEEPSEEK_API_KEY")
    if not deepseek_api_key: raise ValueError("DeepSeek API key not found.")
    deepseek_client = OpenAI(api_key=deepseek_api_key, base_url="https://api.deepseek.com/v1")
except Exception as e:
    print(f"Error configuring DeepSeek client: {e}")
    deepseek_client = None

# --- CORS Middleware ---
# We will set the live URL later using an environment variable on Render
ALLOWED_ORIGINS = [
    "http://localhost:3000", # For local development
]

# Get the production URL from an environment variable if it exists
RENDER_FRONTEND_URL = os.getenv("RENDER_FRONTEND_URL")
if RENDER_FRONTEND_URL:
    ALLOWED_ORIGINS.append(RENDER_FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- PROMPT ENGINEERING ---
ANALYSIS_PROMPT_TEMPLATE = """
You are an expert, unbiased political analyst AI based in India. Your task is to analyze the following political manifesto text.
Provide a neutral, factual, and easy-to-understand breakdown. The analysis should be relevant to the Indian context.
The manifesto text is:
---
{text}
---
Based on the text, provide ONLY a single, valid JSON object with the following structure and nothing else. Do not wrap it in markdown.
{{
  "party_name": "The full name of the political party that published this manifesto. Extract this from the text.",
  "summary": "A concise, neutral summary of the manifesto's main goals (around 150 words).",
  "key_themes": ["A list of 5-7 main policy areas or themes mentioned, e.g., 'Economic Growth', 'Healthcare Reform', 'Agricultural Support', 'National Security', 'Environmental Policy', 'Education', 'Social Welfare'"],
  "sentiment": "A single descriptive word for the overall tone (e.g., 'Optimistic', 'Pragmatic', 'Nationalistic', 'Populist', 'Aggressive', 'Welfare-focused').",
  "analysis_for": {{
    "youth": {{ "relevance_score": "A score from 0 to 10 for youth.", "policies": ["Key policies affecting youth."], "example": "A day-to-day example for one policy." }},
    "seniors": {{ "relevance_score": "A score from 0 to 10 for seniors.", "policies": ["Policies for seniors."], "example": "A day-to-day example for one policy." }},
    "farmers": {{ "relevance_score": "A score from 0 to 10 for farmers.", "policies": ["Policies for farmers."], "example": "A day-to-day example for one policy." }},
    "corporate_sector": {{ "relevance_score": "A score from 0 to 10 for the corporate sector.", "policies": ["Policies for businesses."], "example": "A day-to-day example for one policy." }}
  }}
}}
"""

COMPARISON_PROMPT_TEMPLATE = """
You are an expert, unbiased political analyst AI. Your task is to create a deep, insightful, and neutral side-by-side comparison of two political manifestos.
Instead of using "Manifesto A" and "Manifesto B", you MUST use their actual party names: '{party_a_name}' and '{party_b_name}'.
**Analysis for {party_a_name}:**
{analysis_a}
**Analysis for {party_b_name}:**
{analysis_b}
Generate ONLY a single, valid JSON object with the following structure. Do not wrap it in markdown.
{{
  "party_names": {{ "party_a": "{party_a_name}", "party_b": "{party_b_name}" }},
  "head_to_head": {{ "economy": "Directly compare their economic policies...", "welfare_and_social_justice": "Compare their approaches to social welfare...", "agriculture": "Contrast their promises to farmers...", "governance_and_democracy": "Compare their stances on key governance issues..." }},
  "key_differentiators": ["A list of 2-3 of the most significant policy differences."],
  "voter_appeal_analysis": "Provide a neutral analysis of which voter demographics each manifesto might appeal to most, and why."
}}
"""

def get_gemini_response(prompt: str):
    print("Attempting to generate response with Gemini API...")
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    safety_settings = [{"category": c, "threshold": "BLOCK_NONE"} for c in ["HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_DANGEROUS_CONTENT"]]
    response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.3, response_mime_type="application/json"), safety_settings=safety_settings)
    return json.loads(response.text)

def get_deepseek_response(prompt: str):
    if not deepseek_client: raise HTTPException(status_code=500, detail="DeepSeek client not configured.")
    print("Attempting to generate response with DeepSeek API...")
    response = deepseek_client.chat.completions.create(model="deepseek-chat", messages=[{"role": "user", "content": prompt}], temperature=0.3, response_format={"type": "json_object"})
    return json.loads(response.choices[0].message.content)

def generate_llm_response_with_fallback(prompt: str):
    try:
        return get_gemini_response(prompt)
    except google_exceptions.ResourceExhausted as e:
        print(f"Gemini API rate limit reached: {e}. Falling back to DeepSeek API.")
        try:
            return get_deepseek_response(prompt)
        except Exception as deepseek_e:
            raise HTTPException(status_code=500, detail=f"Primary and fallback APIs failed. DeepSeek error: {deepseek_e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred with the primary AI model: {e}")

def extract_party_name_from_filename(filename: str) -> str:
    name = os.path.splitext(filename)[0].lower()
    if 'bjp' in name: return 'BJP'
    if 'congress' in name: return 'Congress'
    if 'cpim' in name: return 'CPI(M)'
    if 'tmc' in name: return 'TMC'
    return name.replace('_', ' ').replace('-', ' ').title()

@app.post("/analyze/")
async def analyze_manifesto(file: UploadFile = File(...)):
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Please upload a PDF.")

    try:
        pdf_bytes = await file.read()
        file_hash = hashlib.sha256(pdf_bytes).hexdigest()

        if file_hash in ANALYSIS_CACHE:
            print(f"CACHE HIT: Returning cached result for file: {file.filename}")
            return ANALYSIS_CACHE[file_hash].copy()
        
        print(f"CACHE MISS: Analyzing new file: {file.filename}")

        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        # --- SIMPLIFIED TEXT EXTRACTION ---
        full_text = ""
        for page in doc:
            full_text += page.get_text()
        doc.close()

        # Check for sufficient text. If not, raise a specific error for the frontend to handle.
        if len(full_text.strip()) < 500:
            raise HTTPException(
                status_code=400, 
                detail="This PDF could not be processed. It may be an image-based file or have an unsupported format. Please try a different, text-based PDF."
            )

        # Truncate text to send to the API to save tokens
        final_text = full_text[:40000]
        
        prompt = ANALYSIS_PROMPT_TEMPLATE.format(text=final_text)
        analysis_data = generate_llm_response_with_fallback(prompt)
        
        analysis_data['filename'] = file.filename
        
        ANALYSIS_CACHE[file_hash] = analysis_data.copy()
        
        return analysis_data

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred in /analyze/: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/compare/")
async def compare_manifestos(analyses: dict = Body(...)):
    try:
        analysis_a = analyses.get('analysisA')
        analysis_b = analyses.get('analysisB')
        if not analysis_a or not analysis_b:
            raise HTTPException(status_code=400, detail="Both Manifesto A and Manifesto B analyses are required.")

        party_a_name = analysis_a.get('party_name', extract_party_name_from_filename(analysis_a.get('filename', 'Party A')))
        party_b_name = analysis_b.get('party_name', extract_party_name_from_filename(analysis_b.get('filename', 'Party B')))

        prompt = COMPARISON_PROMPT_TEMPLATE.format(
            party_a_name=party_a_name,
            party_b_name=party_b_name,
            analysis_a=json.dumps(analysis_a, indent=2),
            analysis_b=json.dumps(analysis_b, indent=2)
        )
        comparison_data = generate_llm_response_with_fallback(prompt)
        return comparison_data
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred in /compare/: {e}")
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/translate/")
async def translate_text(data: dict = Body(...)):
    text = data.get('text')
    language = data.get('language')
    if not text or not language:
        raise HTTPException(status_code=400, detail="Text and target language are required.")

    prompt = f"Translate the following text to {language}. Provide only the translated text, nothing else:\n\n{text}"
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash-latest')
        response = model.generate_content(prompt, generation_config=genai.types.GenerationConfig(temperature=0.0))
        translated_text = response.text
        return {"translated_text": translated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {e}")