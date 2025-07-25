'use client';

import { useState, useEffect, useRef } from 'react';
import UploadForm from '@/components/UploadForm';
import ReportCard from '@/components/ReportCard';
import ComparisonView from '@/components/ComparisonView';
import { ArrowPathIcon, ChevronDoubleDownIcon } from '@heroicons/react/24/outline';
import type { AnalysisResult, ComparisonResult } from '../types';

export default function HomePage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [comparisonSelection, setComparisonSelection] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const compareButtonRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeSubmit = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch('https://manifesto-analyzer-backend.onrender.com/analyze/', { method: 'POST', body: formData });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Analysis failed.');
      }
      const result: Omit<AnalysisResult, 'id'> = await response.json();
      setAnalyses(prev => [...prev, { ...result, id: crypto.randomUUID() }]);
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
      const response = await fetch('https://manifesto-analyzer-backend.onrender.com/compare/', {
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

  const handleTranslate = async (text: string, language: string, analysisId: string) => { /* Logic remains the same */ };

  useEffect(() => {
    if (comparisonSelection.length === 2) {
      compareButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [comparisonSelection]);

  useEffect(() => { return () => { speechSynthesis.cancel(); }; }, []);

  return (
    <div className="min-h-screen bg-slate-100 font-sans overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 -z-10" />
      <main className="container mx-auto p-4 md:p-8 relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Political Manifesto Analyzer
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
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
              className="bg-green-600 text-white font-bold py-4 px-10 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto"
            >
              {isComparing ? <ArrowPathIcon className="animate-spin h-6 w-6 mr-3" /> : <ChevronDoubleDownIcon className="h-6 w-6 mr-3" />}
              {isComparing ? 'Generating Insight...' : `Compare (${comparisonSelection.length}/2 Selected)`}
            </button>
          </div>
        )}

        {comparisonResult && <ComparisonView result={comparisonResult} />}
      </main>
    </div>
  );
}
