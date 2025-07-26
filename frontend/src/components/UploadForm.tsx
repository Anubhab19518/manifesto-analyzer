import { useState, FormEvent } from 'react';
import { ArrowPathIcon, DocumentArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface UploadFormProps {
    onAnalyze: (file: File) => void;
    isLoading: boolean;
    error: string | null;
}

export default function UploadForm({ onAnalyze, isLoading, error }: UploadFormProps) {
    const [file, setFile] = useState<File | null>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); };
    const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (file) { onAnalyze(file); setFile(null); } };
    
    return (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl shadow-2xl mb-16 transform hover:scale-[1.02] transition-all duration-300">
            <form onSubmit={handleSubmit}>
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-300/70 rounded-2xl cursor-pointer hover:bg-slate-50/50 transition-all duration-300 hover:border-indigo-400/70 hover:shadow-lg group">
                    <DocumentArrowUpIcon className="h-16 w-16 text-slate-500 mb-3 group-hover:text-indigo-500 transition-colors duration-300" />
                    <p className="font-semibold text-slate-700 text-lg group-hover:text-slate-900 transition-colors">
                        {file ? `Selected: ${file.name}` : 'Click to upload a Manifesto PDF'}
                    </p>
                    <p className="text-sm text-slate-500 mt-2 group-hover:text-slate-600 transition-colors">or drag and drop your document here</p>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
                <button 
                    type="submit" 
                    disabled={isLoading || !file} 
                    className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:scale-100 text-lg"
                >
                    {isLoading && <ArrowPathIcon className="animate-spin h-6 w-6 mr-3" />}
                    {isLoading ? 'AI is Analyzing...' : 'Analyze Now'}
                </button>
            </form>
            {error && (
                <div className="mt-6 text-center text-red-800 bg-red-50 p-6 rounded-xl border border-red-200 shadow-md">
                    <div className="flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-6 w-6 mr-2"/>
                        <p className="font-bold text-lg">Analysis Failed</p>
                    </div>
                    <p className="text-sm mt-2 leading-relaxed">{error}</p>
                </div>
            )}
        </div>
    );
}