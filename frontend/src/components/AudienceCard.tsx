import type { AudienceDetail } from '../types';

interface AudienceCardProps {
    group: string;
    details: AudienceDetail;
}

export default function AudienceCard({ group, details }: AudienceCardProps) {
    const score = parseInt(details.relevance_score?.toString().match(/\d+/)?.[0] || '0', 10);
    return (
        <div className="bg-slate-100/70 p-4 rounded-lg border border-slate-200/80">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold capitalize text-slate-800">{group.replace('_', ' ')}</h4>
                <span className="text-sm font-bold text-indigo-700">{score}/10</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${score * 10}%` }}></div>
            </div>
            <ul className="list-disc list-inside text-sm text-slate-700 my-2 pl-2 space-y-1">
                {details.policies?.map(policy => <li key={policy}>{policy}</li>)}
            </ul>
            <p className="text-sm italic text-indigo-900 bg-indigo-100 p-3 rounded-md">"{details.example}"</p>
        </div>
    );
}