import React, { useState, useCallback } from 'react';
import { AnalysisResult, ImageData } from './types';
import { analyzeBugReport } from './services/geminiService';
import ImagePaster from './components/ImagePaster';
import AnalysisDisplay from './components/AnalysisDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
    const [imageData, setImageData] = useState<ImageData | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImagePaste = (data: ImageData) => {
        setImageData(data);
        setAnalysisResult(null);
        setError(null);
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageData) return;
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeBugReport(imageData);
            setAnalysisResult(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    }, [imageData]);

    const handleReset = () => {
        setImageData(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">🔎 L10n LVM Bug Reader</h1>
                    <p className="text-lg text-gray-600 mt-2">AI-Powered Localization Bug Analysis</p>
                    <p className="text-base text-gray-500 mt-2">Upload / Paste a JIRA bug report screenshot for expert analysis</p>
                </header>

                <main>
                    {!analysisResult && (
                        <ImagePaster 
                            onImagePaste={handleImagePaste} 
                            onAnalyze={handleAnalyze}
                            onReset={handleReset}
                            imageData={imageData}
                            isLoading={isLoading}
                        />
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-md border border-gray-200">
                           <LoadingSpinner />
                           <p className="mt-4 text-gray-600 animate-pulse">Analyzing bug report... this may take a moment.</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-4" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </button>
                        </div>
                    )}
                    
                    {analysisResult && (
                       <AnalysisDisplay result={analysisResult} onReset={handleReset} />
                    )}

                </main>
            </div>
        </div>
    );
};

export default App;