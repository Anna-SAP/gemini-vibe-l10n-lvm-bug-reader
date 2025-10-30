
export interface AnalysisA {
    bugId: string;
    vendorTask: string;
    parentID: string;
    priority: string;
    xtmProject: string;
    language: string;
    stringIds: string[];
    sourceString: string;
    currentTranslation: string;
    finalTranslation: string;
    issueDescription: string;
}

export interface AnalysisB {
    impactAssessment: string;
    globalChecking: string;
    rootCauseInference: string;
    enhancedTranslationDiff: string;
    uniqueProjectName: string;
    involvedProjects: string;
    actionableRecommendations: string[];
}

export interface AnalysisResult {
    analysisA: AnalysisA;
    analysisB: AnalysisB;
}

export interface ImageData {
    base64: string;
    mimeType: string;
    url: string;
}