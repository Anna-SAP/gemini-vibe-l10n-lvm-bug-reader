
import React, { useRef, useCallback, DragEvent } from 'react';
import type { ImageData } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface ImagePasterProps {
    onImagePaste: (data: ImageData) => void;
    onAnalyze: () => void;
    onReset: () => void;
    imageData: ImageData | null;
    isLoading: boolean;
}

const fileToImageData = (file: File): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({
                base64,
                mimeType: file.type,
                url: URL.createObjectURL(file),
            });
        };
        reader.onerror = error => reject(error);
    });
};


const ImagePaster: React.FC<ImagePasterProps> = ({ onImagePaste, onAnalyze, onReset, imageData, isLoading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(async (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            try {
                const data = await fileToImageData(file);
                onImagePaste(data);
            } catch (error) {
                console.error("Error processing file:", error);
                alert("Could not process the image file.");
            }
        }
    }, [onImagePaste]);

    const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
        const items = event.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    processFile(file);
                    break;
                }
            }
        }
    }, [processFile]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if(file) processFile(file);
    };
    
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            processFile(event.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };


    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-300">
            {imageData ? (
                 <div className="flex flex-col items-center">
                    <img src={imageData.url} alt="Pasted Bug Report" className="max-w-full max-h-[400px] object-contain rounded-md border-2 border-indigo-200" />
                    <div className="mt-6 flex space-x-4">
                        <button 
                            onClick={onReset} 
                            disabled={isLoading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors">
                            Clear
                        </button>
                        <button 
                            onClick={onAnalyze} 
                            disabled={isLoading}
                            className="px-8 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center transition-colors">
                            {isLoading && <LoadingSpinner simple={true} />}
                            {isLoading ? 'Analyzing...' : 'Analyze Bug Report'}
                        </button>
                    </div>
                </div>
            ) : (
                <div 
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                    onClick={triggerFileInput}
                    tabIndex={0}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div className="flex flex-col items-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        <p className="font-semibold">Paste screenshot here</p>
                        <p className="text-sm">or click to upload, or drag & drop</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImagePaster;
