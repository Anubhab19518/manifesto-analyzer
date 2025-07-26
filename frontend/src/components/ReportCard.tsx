import { PlayIcon, LanguageIcon, CheckCircleIcon, StopIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { AnalysisResult } from '../types';
import AudienceCard from './AudienceCard';

interface ReportCardProps {
    analysis: AnalysisResult;
    isSelectedForCompare: boolean;
    isTranslating: boolean;
    isSpeaking: boolean;
    onCompareToggle: (id: string) => void;
    onToggleSpeech: (text: string, analysisId: string) => void;
    onTranslate: (text: string, language: string, analysisId: string) => void;
}

export default function ReportCard({ analysis, isSelectedForCompare, onCompareToggle, onToggleSpeech, onTranslate, isTranslating, isSpeaking }: ReportCardProps) {
    const partyName = analysis.party_name || analysis.filename;
    const hasBengaliTranslation = analysis.translated_summary_bengali;
    
    return (
        <div className={`glass-card rounded-3xl shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl ${isSelectedForCompare ? 'ring-4 ring-indigo-500 ring-opacity-50 shadow-indigo-200/50' : 'ring-1 ring-transparent hover:ring-2 hover:ring-slate-200'}`}>
            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent">{partyName}</h2>
                        <p className="text-indigo-600 font-semibold capitalize text-lg mt-1">{analysis.sentiment || "N/A"} Tone</p>
                    </div>
                    <button onClick={() => onCompareToggle(analysis.id)} title="Select for comparison" className={`p-3 rounded-full transition-all duration-300 ${isSelectedForCompare ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110 shadow-lg' : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100 hover:scale-105'}`}>
                        <CheckCircleIcon className="h-8 w-8" />
                    </button>
                </div>

                <div className="mt-6 space-y-4">
                    <h3 className="font-semibold text-xl text-slate-800 flex items-center">
                        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></span>
                        Summary
                    </h3>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => onToggleSpeech(analysis.summary, analysis.id)} 
                            title={isSpeaking ? "Stop" : "Listen"} 
                            className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${isSpeaking ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200'}`}
                        >
                            {isSpeaking ? <StopIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                        </button>
                        <button 
                            onClick={() => onTranslate(analysis.summary, 'Bengali', analysis.id)} 
                            disabled={isTranslating} 
                            title={hasBengaliTranslation ? "Show Bengali translation" : "Translate to Bengali"} 
                            className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${isTranslating ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : hasBengaliTranslation ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                        >
                            {isTranslating ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <LanguageIcon className="h-6 w-6" />}
                        </button>
                    </div>
                    
                    {/* Original Summary */}
                    <div className="space-y-3">
                        <p className="text-slate-700 text-base leading-relaxed bg-gradient-to-r from-slate-50/80 to-blue-50/80 p-6 rounded-xl border border-slate-200/50">
                            {analysis.summary || "No summary was generated."}
                        </p>
                        
                        {/* Bengali Translation */}
                        {hasBengaliTranslation && (
                            <div className="bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-6 rounded-xl border border-green-200/50">
                                <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center">
                                    <LanguageIcon className="h-4 w-4 mr-2" />
                                    Bengali Translation
                                </h4>
                                <p className="text-slate-700 text-base leading-relaxed">
                                    {analysis.translated_summary_bengali}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-xl text-slate-800 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                        Key Themes
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {analysis.key_themes?.length > 0 ? (
                            analysis.key_themes.map(theme => <span key={theme} className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 text-sm font-semibold px-4 py-2 rounded-full border border-indigo-200 hover:shadow-md transition-shadow">{theme}</span>)
                        ) : <p className="text-sm text-slate-500">No key themes identified.</p>}
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-semibold text-xl text-slate-800 mb-5 flex items-center">
                        <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3"></span>
                        Breakdown by Audience
                    </h3>
                    <div className="space-y-5">
                        {analysis.analysis_for && Object.entries(analysis.analysis_for).length > 0 ? (
                            Object.entries(analysis.analysis_for).map(([group, details]) => <AudienceCard key={group} group={group} details={details} />)
                        ) : <p className="text-sm text-slate-500">No audience breakdown generated.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}