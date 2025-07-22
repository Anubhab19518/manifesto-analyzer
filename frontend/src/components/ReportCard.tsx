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
    return (
        <div className={`glass-card rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${isSelectedForCompare ? 'ring-4 ring-indigo-400' : 'ring-1 ring-transparent'}`}>
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{partyName}</h2>
                        <p className="text-indigo-600 font-semibold capitalize">{analysis.sentiment || "N/A"} Tone</p>
                    </div>
                    <button onClick={() => onCompareToggle(analysis.id)} title="Select for comparison" className={`p-2 rounded-full transition-all ${isSelectedForCompare ? 'bg-indigo-600 text-white scale-110' : 'bg-slate-200/70 text-slate-600 hover:bg-indigo-100'}`}>
                        <CheckCircleIcon className="h-8 w-8" />
                    </button>
                </div>

                <div className="mt-4 space-y-3">
                    <h3 className="font-semibold text-lg text-slate-800">Summary</h3>
                    <div className="flex space-x-2">
                        <button onClick={() => onToggleSpeech(analysis.summary, analysis.id)} title={isSpeaking ? "Stop" : "Listen"} className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-200/70 hover:bg-slate-300/80 transition">
                            {isSpeaking ? <StopIcon className="h-5 w-5 text-red-600" /> : <PlayIcon className="h-5 w-5 text-slate-700" />}
                        </button>
                        <button onClick={() => onTranslate(analysis.summary, 'Bengali', analysis.id)} disabled={isTranslating} title="Translate" className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-200/70 hover:bg-slate-300/80 transition disabled:bg-slate-300">
                            {isTranslating ? <ArrowPathIcon className="h-5 w-5 animate-spin text-slate-700" /> : <LanguageIcon className="h-5 w-5 text-slate-700" />}
                        </button>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-100/70 p-4 rounded-lg">{analysis.summary || "No summary was generated."}</p>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-lg text-slate-800 mb-2">Key Themes</h3>
                    <div className="flex flex-wrap gap-2">
                        {analysis.key_themes?.length > 0 ? (
                            analysis.key_themes.map(theme => <span key={theme} className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">{theme}</span>)
                        ) : <p className="text-sm text-slate-500">No key themes identified.</p>}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-semibold text-lg text-slate-800 mb-3">Breakdown by Audience</h3>
                    <div className="space-y-4">
                        {analysis.analysis_for && Object.entries(analysis.analysis_for).length > 0 ? (
                            Object.entries(analysis.analysis_for).map(([group, details]) => <AudienceCard key={group} group={group} details={details} />)
                        ) : <p className="text-sm text-slate-500">No audience breakdown generated.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}