import type { AudienceDetail } from '../types';

interface AudienceCardProps {
    group: string;
    details: AudienceDetail;
}

export default function AudienceCard({ group, details }: AudienceCardProps) {
    const score = parseInt(details.relevance_score?.toString().match(/\d+/)?.[0] || '0', 10);
    return (
        <div className="bg-gradient-to-br from-slate-50/90 to-white/90 p-6 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold capitalize text-slate-800 text-lg">{group.replace('_', ' ')}</h4>
                <span className="text-lg font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full">{score}/10</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${score * 10}%` }}
                ></div>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-700 my-4 pl-2 space-y-2">
                {details.policies?.map(policy => <li key={policy} className="leading-relaxed">{policy}</li>)}
            </ul>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-400">
                <p className="text-sm italic text-indigo-900 font-medium">"{details.example}"</p>
            </div>
        </div>
    );
}