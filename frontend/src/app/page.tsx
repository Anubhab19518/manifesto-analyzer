'use client';

import { useState, useEffect, useRef } from 'react';
import UploadForm from '@/components/UploadForm';
import ReportCard from '@/components/ReportCard';
import ComparisonView from '@/components/ComparisonView';
import Loader from '@/components/Loader';
import Toast from '@/components/Toast';
import { ArrowPathIcon, ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import type { AnalysisResult, ComparisonResult } from '../types';
import API_CONFIG from '@/config/api';

export default function HomePage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [translatedTexts, setTranslatedTexts] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  
  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({ message: '', type: 'info', isVisible: false });

  const compareButtonRef = useRef<HTMLDivElement>(null);

  // Toast helper function
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const handleAnalyzeSubmit = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.ANALYZE, { method: 'POST', body: formData });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Analysis failed.');
      }
      const result = await response.json();
      const newAnalysis: AnalysisResult = { ...result, id: crypto.randomUUID() };
      setAnalyses(prev => [...prev, newAnalysis]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompare = (id: string) => {
    setComparisonSelection(prev => {
      if (prev.includes(id)) return prev.filter(item => item !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[0], id];
    });
  };

  const handleRunComparison = async () => {
    if (comparisonSelection.length !== 2) {
      setError("Please select exactly two manifestos to compare.");
      return;
    }
    setIsComparing(true);
    setError(null);
    const analysisA = analyses.find(a => a.id === comparisonSelection[0]);
    const analysisB = analyses.find(a => a.id === comparisonSelection[1]);
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.COMPARE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisA, analysisB })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Comparison failed.');
      }
      const result: ComparisonResult = await response.json();
      setComparisonResult(result);
      setTimeout(() => {
        document.getElementById('comparison-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsComparing(false);
    }
  };

  const handleToggleSpeech = (text: string, analysisId: string) => {
    if (speakingId === analysisId) {
      speechSynthesis.cancel();
      setSpeakingId(null);
    } else {
      if (speechSynthesis.speaking) speechSynthesis.cancel();
      if (!text) { setError("Cannot play audio for an empty summary."); return; }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.onend = () => setSpeakingId(null);
      speechSynthesis.speak(utterance);
      setSpeakingId(analysisId);
    }
  };

  const handleTranslate = async (text: string, language: string, analysisId: string) => {
    if (!text) {
      showToast("Cannot translate empty text.", 'error');
      return;
    }
    
    const translationKey = `${analysisId}-${language}`;
    
    // Check if already translated
    if (translatedTexts[translationKey]) {
      showToast(`Already translated to ${language}!`, 'info');
      return;
    }
    
    setIsTranslating(analysisId);
    setError(null);
    
    try {
      const response = await fetch(API_CONFIG.ENDPOINTS.TRANSLATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Translation failed.');
      }
      
      const result = await response.json();
      const translatedText = result.translated_text;
      
      // Store the translated text
      setTranslatedTexts(prev => ({
        ...prev,
        [translationKey]: translatedText
      }));
      
      // Update the analyses state to include translated text
      setAnalyses(prev => prev.map(analysis => 
        analysis.id === analysisId 
          ? { 
              ...analysis, 
              [`translated_summary_${language.toLowerCase()}`]: translatedText 
            }
          : analysis
      ));
      
      showToast(`Successfully translated to ${language}!`, 'success');
      
    } catch (err: any) {
      const errorMessage = `Translation failed: ${err.message}`;
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsTranslating(null);
    }
  };

  useEffect(() => {
    if (comparisonSelection.length === 2) {
      compareButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [comparisonSelection]);

  useEffect(() => { return () => { speechSynthesis.cancel(); }; }, []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans overflow-x-hidden relative">
      {/* Enhanced Background */}
      <div className="bg-enhancement"></div>
      
      {/* Loader Component */}
      <Loader isVisible={isLoading} />
      
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* Advanced Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {/* Large gradient orbs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-l from-blue-400/20 via-cyan-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-t from-emerald-400/20 via-green-400/20 to-lime-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
        
        {/* Medium floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 opacity-10">
          <div className="w-full h-full bg-gradient-to-br from-violet-500 to-purple-600 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 opacity-10">
          <div className="w-full h-full bg-gradient-to-bl from-rose-500 to-pink-600 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 opacity-10">
          <div className="w-full h-full bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 opacity-5 transform rotate-45 animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 blur-xl" style={{ animationDelay: '5s' }}></div>
        </div>
        <div className="absolute bottom-20 left-20 w-28 h-28 opacity-5 transform -rotate-12 animate-pulse">
          <div className="w-full h-full bg-gradient-to-tl from-indigo-400 to-purple-500 rounded-2xl blur-xl" style={{ animationDelay: '7s' }}></div>
        </div>
      </div>
      
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100/80 via-indigo-100/60 to-purple-100/80 -z-10" />
      <main className="container mx-auto p-4 md:p-8 relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent drop-shadow-lg">
            Political Manifesto Analyzer
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Get unbiased, AI-powered insights into political promises. Powered by Google Gemini.
          </p>
        </header>

        <UploadForm onAnalyze={handleAnalyzeSubmit} isLoading={isLoading} error={error} />

        {analyses.length > 0 && (
            <div className={`grid gap-8 ${analyses.length === 1 ? 'grid-cols-1 place-items-center' : 'grid-cols-1 md:grid-cols-2'}`}>
                {analyses.map((analysis, index) => (
                    <div key={analysis.id} className={`w-full ${analyses.length === 1 ? 'max-w-3xl' : ''} opacity-0 animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                        <ReportCard
                            analysis={analysis}
                            isSelectedForCompare={comparisonSelection.includes(analysis.id)}
                            isTranslating={isTranslating === analysis.id}
                            isSpeaking={speakingId === analysis.id}
                            onCompareToggle={handleToggleCompare}
                            onToggleSpeech={handleToggleSpeech}
                            onTranslate={handleTranslate}
                        />
                    </div>
                ))}
            </div>
        )}

        {analyses.length >= 2 && (
          <div ref={compareButtonRef} className="text-center my-16 opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <button
              onClick={handleRunComparison}
              disabled={isComparing || comparisonSelection.length !== 2}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-5 px-12 rounded-full hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-xl hover:shadow-2xl flex items-center justify-center mx-auto text-lg"
            >
              {isComparing ? <ArrowPathIcon className="animate-spin h-7 w-7 mr-3" /> : <ChevronDoubleDownIcon className="h-7 w-7 mr-3" />}
              {isComparing ? 'Generating Insight...' : `Compare (${comparisonSelection.length}/2 Selected)`}
            </button>
          </div>
        )}

        {comparisonResult && <ComparisonView result={comparisonResult} />}
        
        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </main>
    </div>
  );
}
