import { PlayIcon, LanguageIcon, CheckCircleIcon, StopIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { AnalysisResult } from '../types';
import AudienceCard from './AudienceCard';

interface ReportCardProps {
    analysis: AnalysisResult;
    isSelectedForCompare: boolean;
    isTranslating: boolean;
    translatingLanguage?: string;
    isSpeaking: boolean;
    onCompareToggle: (id: string) => void;
    onToggleSpeech: (text: string, analysisId: string) => void;
    onTranslate: (text: string, language: string, analysisId: string) => void;
    onResetTranslation: (analysisId: string) => void;
    onSwitchLanguage: (analysisId: string, language: 'English' | 'Bengali' | 'Hindi') => void;
}

export default function ReportCard({ analysis, isSelectedForCompare, onCompareToggle, onToggleSpeech, onTranslate, onResetTranslation, onSwitchLanguage, isTranslating, translatingLanguage, isSpeaking }: ReportCardProps) {
    const partyName = analysis.party_name || analysis.filename;
    const hasBengaliTranslation = analysis.translated_summary_bengali;
    const hasHindiTranslation = analysis.translated_summary_hindi;
    
    // Determine which text to show based on currentLanguage setting
    const getCurrentText = () => {
        if (analysis.currentLanguage === 'Hindi' && hasHindiTranslation) {
            return { text: analysis.translated_summary_hindi, language: 'Hindi', flag: 'हिं' };
        } else if (analysis.currentLanguage === 'Bengali' && hasBengaliTranslation) {
            return { text: analysis.translated_summary_bengali, language: 'Bengali', flag: 'বাং' };
        } else {
            return { text: analysis.summary, language: 'English', flag: 'EN' };
        }
    };
    
    const currentDisplay = getCurrentText();
    
    return (
        <div className={`glass-card rounded-3xl shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:shadow-3xl ${isSelectedForCompare ? 'ring-4 ring-indigo-500 ring-opacity-50 shadow-indigo-200/50' : 'ring-1 ring-transparent hover:ring-2 hover:ring-slate-200'}`}>
            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-indigo-800 bg-clip-text text-transparent">{partyName}</h2>
                        <p className="text-indigo-600 font-semibold capitalize text-lg mt-1 text-content">{analysis.sentiment || "N/A"} Tone</p>
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
                    <div className="flex space-x-3 mb-4">
                        <button 
                            onClick={() => onToggleSpeech(currentDisplay.text, analysis.id)} 
                            title={isSpeaking ? "Stop" : "Listen"} 
                            className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg ${isSpeaking ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200'}`}
                        >
                            {isSpeaking ? <StopIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                        </button>
                        
                        {/* Bengali Translation Button */}
                        <button 
                            onClick={() => {
                                if (hasBengaliTranslation) {
                                    // If translation exists, just switch to it
                                    onSwitchLanguage(analysis.id, 'Bengali');
                                } else {
                                    // If no translation, translate it
                                    onTranslate(analysis.summary, 'Bengali', analysis.id);
                                }
                            }}
                            disabled={isTranslating} 
                            title={hasBengaliTranslation ? "Show Bengali translation" : "Translate to Bengali"} 
                            className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg button-text ${
                                isTranslating && translatingLanguage === 'Bengali' 
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                                    : currentDisplay.language === 'Bengali'
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white ring-2 ring-green-300'
                                    : hasBengaliTranslation 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                                    : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 hover:from-green-200 hover:to-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            {isTranslating && translatingLanguage === 'Bengali' ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <span className="text-xs font-bold">বাং</span>}
                        </button>
                        
                        {/* Hindi Translation Button */}
                        <button 
                            onClick={() => {
                                if (hasHindiTranslation) {
                                    // If translation exists, just switch to it
                                    onSwitchLanguage(analysis.id, 'Hindi');
                                } else {
                                    // If no translation, translate it
                                    onTranslate(analysis.summary, 'Hindi', analysis.id);
                                }
                            }}
                            disabled={isTranslating} 
                            title={hasHindiTranslation ? "Show Hindi translation" : "Translate to Hindi"} 
                            className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg button-text ${
                                isTranslating && translatingLanguage === 'Hindi' 
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                                    : currentDisplay.language === 'Hindi'
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white ring-2 ring-orange-300'
                                    : hasHindiTranslation 
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                                    : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 hover:from-orange-200 hover:to-red-200 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                        >
                            {isTranslating && translatingLanguage === 'Hindi' ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : <span className="text-xs font-bold">हिं</span>}
                        </button>
                        
                        {/* Reset to English Button */}
                        {(hasBengaliTranslation || hasHindiTranslation) && (
                            <button 
                                onClick={() => onSwitchLanguage(analysis.id, 'English')} 
                                title="Show original English text" 
                                className={`flex items-center justify-center h-12 w-12 rounded-full transition-all duration-300 shadow-md hover:shadow-lg button-text ${
                                    currentDisplay.language === 'English'
                                        ? 'bg-gradient-to-r from-slate-600 to-gray-600 text-white ring-2 ring-slate-300'
                                        : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 hover:from-slate-200 hover:to-gray-200'
                                }`}
                            >
                                <span className="text-xs font-bold">EN</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Current Text Display */}
                    <div className="space-y-4">
                        <div className={`p-6 rounded-xl border transition-all duration-300 ${
                            currentDisplay.language === 'Bengali' 
                                ? 'bg-gradient-to-r from-green-50/90 to-emerald-50/90 border-green-200/50'
                                : currentDisplay.language === 'Hindi'
                                ? 'bg-gradient-to-r from-orange-50/90 to-red-50/90 border-orange-200/50'
                                : 'bg-gradient-to-r from-slate-50/90 to-blue-50/90 border-slate-200/50'
                        }`}>
                            <h4 className={`text-sm font-semibold mb-3 flex items-center ${
                                currentDisplay.language === 'Bengali' 
                                    ? 'text-green-800'
                                    : currentDisplay.language === 'Hindi'
                                    ? 'text-orange-800'
                                    : 'text-slate-600'
                            }`}>
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                    currentDisplay.language === 'Bengali' 
                                        ? 'bg-green-500'
                                        : currentDisplay.language === 'Hindi'
                                        ? 'bg-orange-500'
                                        : 'bg-blue-500'
                                }`}></span>
                                {currentDisplay.language === 'Bengali' && 'Bengali Translation (বাংলা অনুবাদ)'}
                                {currentDisplay.language === 'Hindi' && 'Hindi Translation (हिंदी अनुवाद)'}
                                {currentDisplay.language === 'English' && 'Summary (English)'}
                            </h4>
                            <p className="text-slate-700 text-base leading-relaxed text-content">
                                {currentDisplay.text || "No summary was generated."}
                            </p>
                        </div>
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