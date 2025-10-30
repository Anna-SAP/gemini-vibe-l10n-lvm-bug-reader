
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ImageData } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        analysisA: {
            type: Type.OBJECT,
            properties: {
                bugId: { type: Type.STRING, description: "JIRA issue identifier (e.g., LVM-31313)." },
                vendorTask: { type: Type.STRING, description: "The 'RING_XXXX_PXXXX' value from the bug title." },
                parentID: { type: Type.STRING, description: "The 'LOC-XXXX' value from the bug title." },
                priority: { type: Type.STRING, description: "The JIRA issue priority." },
                xtmProject: { type: Type.STRING, description: "The value for 'XTM Project Number'." },
                language: { type: Type.STRING, description: "The value from the 'Language' field." },
                stringIds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of all identifiers starting with 'RingCentral.'." },
                sourceString: { type: Type.STRING, description: "The full value after the 'Source String' label, including any content on subsequent lines." },
                currentTranslation: { type: Type.STRING, description: "The full value after the 'Current Translation' label, including any content on subsequent lines." },
                finalTranslation: { type: Type.STRING, description: "The full value after the 'Final Translation' label, including any content on subsequent lines." },
                issueDescription: { type: Type.STRING, description: "The value after the 'Description' label in the yellow box, including any content on subsequent lines." },
            },
        },
        analysisB: {
            type: Type.OBJECT,
            properties: {
                impactAssessment: { type: Type.STRING, description: "HTML string evaluating the bug's impact with keywords tagged." },
                globalChecking: { type: Type.STRING, description: "A one-word judgment ('Yes' or 'No') on whether global checking for similar issues is needed." },
                rootCauseInference: { type: Type.STRING, description: "HTML string inferring the problem's source with keywords tagged." },
                enhancedTranslationDiff: { type: Type.STRING, description: "HTML string showing word-level diff between translations." },
                uniqueProjectName: { type: Type.STRING, description: "Project name from the first 'String ID'." },
                involvedProjects: { type: Type.STRING, description: "Project name from the first 'String ID'." },
                actionableRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of HTML strings with concrete steps to fix the issue." },
            },
        },
    },
};


const prompt = `
You are an expert Localization QA analyst specializing in identifying, analyzing, and providing actionable insights for translation bugs reported in JIRA. Your mission is to deliver not only extracted data but also deep, context-aware diagnoses.

You will be given a screenshot of a JIRA bug report. Your task is to perform two analyses (Analysis A and Analysis B) and return the result as a single, valid JSON object that strictly adheres to the provided schema.

**Analysis A: Structured Data Extraction**
Extract the following fields from the screenshot. If a field is missing or unreadable, its value must be the string literal "blank". Never use null.

- bugId: The JIRA issue identifier (e.g., LVM-31313).
- vendorTask: The "RING_XXXX_PXXXX" value from the bug title.
- parentID: The "LOC-XXXX" value from the bug title.
- priority: The JIRA issue priority (e.g., Critical).
- xtmProject: The value for 'XTM Project Number'.
- language: The value from the 'Language' field.
- stringIds: A list of all identifiers starting with 'RingCentral.' (including the dot).
- sourceString: The full value after the 'Source string' label. This may span multiple lines; capture all text until the 'Current Translation' label begins.
- currentTranslation: The full value after the 'Current Translation' label. This may span multiple lines; capture all text until the 'Final Translation' label begins.
- finalTranslation: The full value after the 'Final Translation' label. This may span multiple lines; capture all text until the next distinct section begins.
- issueDescription: The value after the 'Description' label within the yellow box. This may span multiple lines; capture all text until the 'Source String' label begins.

**Analysis B: Expert Diagnosis**
Based on the screenshot content, generate the following insights.

- impactAssessment: (HTML string) Evaluate how broadly the bug affects the product. Is it limited to a single string, or could it impact multiple interfaces or functions? Does it risk user misunderstanding?
- globalChecking: (string, 'Yes' or 'No') Based on the impact assessment and root cause, provide a one-word judgment on whether it is necessary to check for similar issues in other places. If the issue is likely systemic (e.g., inconsistent core terminology that is widely used, as indicated in the issue description), answer 'Yes'. If it appears to be an isolated mistake, answer 'No'.
- rootCauseInference: (HTML string) Infer the source of the problem.
- enhancedTranslationDiff: (HTML string) Generate a line-wise, word-level diff between 'Current Translation' and 'Final Translation'. Wrap added words in \`<span class="diff-added">...\</span>\` and removed words in \`<span class="diff-removed">...\</span>\`.
- uniqueProjectName: Extract the project name (the segment after the first dot) from the first 'String ID'. If none, use "blank".
- involvedProjects: Same as uniqueProjectName.
- actionableRecommendations: (Array of HTML strings) List concrete steps to fix and prevent this issue.

**Keyword Highlighting Rules for Analysis B:**
When generating the text for impactAssessment, rootCauseInference, and actionableRecommendations, you MUST identify and wrap critical keywords in \`<span>\` tags with specific CSS classes.

- Use \`<span class="kw-problem">...\</span>\` for words describing the problem, severity, or negative consequences (e.g., inconsistent, mistranslation, confusion).
- Use \`<span class="kw-entity">...\</span>\` for specific product terms or technical nouns (e.g., 'Contact Center', terminology, glossary, UI context).
- Use \`<span class="kw-action">...\</span>\` for verbs or nouns related to proposed solutions (e.g., update, standardize, add to termbase, enforce).
- Do not overuse highlighting. Focus on the most critical terms.

**Final Output Format:**
Return a single, valid JSON object that strictly adheres to the provided \`responseSchema\`. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
`;


export const analyzeBugReport = async (imageData: ImageData): Promise<AnalysisResult> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: imageData.mimeType,
                            data: imageData.base64,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('JSON')) {
             throw new Error("Failed to get a valid analysis from the AI. The response was not valid JSON.");
        }
        throw new Error("An error occurred while analyzing the bug report with Gemini.");
    }
};