import { useState, FormEvent } from 'react';
import { ArrowPathIcon, DocumentArrowUpIcon } from '@heroicons/react/24/solid';

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
        <div className="max-w-2xl mx-auto glass-card p-6 rounded-2xl shadow-lg mb-16">
            <form onSubmit={handleSubmit}>
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300/70 rounded-lg cursor-pointer hover:bg-slate-50/50 transition-colors">
                    <DocumentArrowUpIcon className="h-12 w-12 text-slate-500 mb-2" />
                    <p className="font-semibold text-slate-700">{file ? `Selected: ${file.name}` : 'Click to upload a Manifesto PDF'}</p>
                    <p className="text-sm text-slate-500 mt-1">or drag and drop</p>
                    <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                </label>
                <button type="submit" disabled={isLoading || !file} className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 transition-all flex items-center justify-center shadow-md">
                    {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />}
                    {isLoading ? 'AI is Analyzing...' : 'Analyze Now'}
                </button>
            </form>
            {error && <p className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
        </div>
    );
}
