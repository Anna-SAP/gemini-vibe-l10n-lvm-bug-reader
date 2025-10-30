
import React, { useState } from 'react';
import type { AnalysisResult } from '../types';

interface AnalysisDisplayProps {
    result: AnalysisResult;
    onReset: () => void;
}

const Card: React.FC<{ title: React.ReactNode; children: React.ReactNode, className?: string }> = ({ title, children, className }) => (
    <div className={`card bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6 ${className}`}>
        <div className="border-b border-gray-200 pb-2 mb-4">
            {typeof title === 'string' ? <h2 className="text-xl font-semibold text-gray-800">{title}</h2> : title}
        </div>
        {children}
    </div>
);

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="mb-3">
        <dt className="text-sm font-semibold text-gray-500">{label}</dt>
        <dd className="text-md text-gray-800 mt-1">{children}</dd>
    </div>
);


const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ result, onReset }) => {
    const { analysisA, analysisB } = result;
    const [copyStatus, setCopyStatus] = useState('Copy');

    const handleCopyStringIds = () => {
        if (!navigator.clipboard || analysisA.stringIds.length === 0) return;
        
        const textToCopy = analysisA.stringIds.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }).catch(() => {
            setCopyStatus('Failed!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        });
    };

    const stringIdsTitle = (
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">String IDs</h2>
            {analysisA.stringIds.length > 0 && (
                 <button
                    onClick={handleCopyStringIds}
                    className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={copyStatus !== 'Copy'}
                >
                    {copyStatus}
                </button>
            )}
        </div>
    );

    return (
        <div className="animate-fade-in">
             <div className="text-center mb-8">
                <button 
                    onClick={onReset} 
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                >
                    Analyze Another Report
                </button>
            </div>
            <div className="container grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto p-0">
                {/* Left Column */}
                <div className="details-column">
                    <Card title="Bug Report Details">
                        <dl>
                            <DetailItem label="Bug ID">{analysisA.bugId}</DetailItem>
                            <DetailItem label="Parent ID">{analysisA.parentID}</DetailItem>
                            <DetailItem label="Vendor Task">{analysisA.vendorTask}</DetailItem>
                            <DetailItem label="Priority">{analysisA.priority}</DetailItem>
                            <DetailItem label="XTM Project">{analysisA.xtmProject}</DetailItem>
                            <DetailItem label="Language">{analysisA.language}</DetailItem>
                            <DetailItem label="Unique Project Name">{analysisB.uniqueProjectName}</DetailItem>
                            <DetailItem label="Involved Projects">{analysisB.involvedProjects}</DetailItem>
                        </dl>
                    </Card>
                    <Card title={stringIdsTitle}>
                        <pre className="bg-gray-100 p-3 border border-gray-200 rounded-md text-sm max-h-40 overflow-y-auto">
                            {analysisA.stringIds.length > 0 ? analysisA.stringIds.join('\n') : 'No String IDs found.'}
                        </pre>
                    </Card>
                    <Card title="Strings">
                         <DetailItem label="Source String">
                             <p className="text-gray-700 p-2 rounded">{analysisA.sourceString}</p>
                         </DetailItem>
                         <DetailItem label="Current Translation">
                             <p className="text-gray-700 p-2 rounded">{analysisA.currentTranslation}</p>
                         </DetailItem>
                         <DetailItem label="Final Translation">
                             <p className="text-gray-700 p-2 rounded">{analysisA.finalTranslation}</p>
                         </DetailItem>
                    </Card>
                     <Card title="Issue Description">
                        <p>{analysisA.issueDescription}</p>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="insights-column">
                    <Card title="Expert Diagnosis">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Impact Assessment</h3>
                        <p className="mb-4 text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisB.impactAssessment }} />

                        <div className="mb-6">
                            <span className="font-semibold text-gray-700">Global checking: </span>
                            <span className={`font-medium ${analysisB.globalChecking === 'Yes' ? 'text-red-600' : 'text-green-700'}`}>{analysisB.globalChecking}</span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Root Cause Inference</h3>
                        <p className="mb-4 text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisB.rootCauseInference }} />

                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Enhanced Translation Diff</h3>
                        <div className="p-3 bg-gray-50 border rounded-md text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: analysisB.enhancedTranslationDiff }} />
                    </Card>
                    <Card title="Actionable Recommendations">
                        <ol className="list-decimal list-inside space-y-3 text-gray-600">
                            {analysisB.actionableRecommendations.map((rec, index) => (
                                <li key={index} dangerouslySetInnerHTML={{ __html: rec }} />
                            ))}
                        </ol>
                    </Card>
                </div>
            </div>
            <script type="application/json" id="bug-report-data">
                {JSON.stringify(result, null, 2)}
            </script>
        </div>
    );
};

export default AnalysisDisplay;