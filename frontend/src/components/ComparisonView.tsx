import { ScaleIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import type { ComparisonResult } from '../types';

interface ComparisonViewProps {
    result: ComparisonResult;
}

export default function ComparisonView({ result }: ComparisonViewProps) {
    if (!result) return null;
    const { party_a, party_b } = result.party_names;
    return (
        <div id="comparison-view" className="mt-16 lg:col-span-2 opacity-0 animate-fade-in-up">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900">Manifesto Face-Off</h2>
                <p className="mt-2 text-4xl font-bold tracking-tight">
                    <span className="text-blue-600">{party_a}</span>
                    <span className="text-slate-400 mx-4">vs</span>
                    <span className="text-orange-600">{party_b}</span>
                </p>
            </div>
            <div className="space-y-12">
                <div className="glass-card p-8 rounded-2xl shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><ScaleIcon className="h-7 w-7 mr-3 text-indigo-600"/>Head-to-Head Analysis</h3>
                    <div className="space-y-6">
                        {Object.entries(result.head_to_head).map(([key, value]) => (
                            <div key={key}>
                                <h4 className="text-lg font-semibold capitalize text-slate-900 border-b-2 border-slate-200 pb-2 mb-3">{key.replace(/_/g, ' ')}</h4>
                                <p className="text-slate-700 leading-relaxed">{value as string}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass-card p-8 rounded-2xl shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><SparklesIcon className="h-7 w-7 mr-3 text-amber-500"/>Key Differentiators</h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                        {result.key_differentiators.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
                <div className="glass-card p-8 rounded-2xl shadow-lg opacity-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
                    <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><UserGroupIcon className="h-7 w-7 mr-3 text-teal-600"/>Voter Appeal Analysis</h3>
                    <p className="text-slate-700 leading-relaxed">{result.voter_appeal_analysis}</p>
                </div>
            </div>
        </div>
    );
}