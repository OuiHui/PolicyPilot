import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client
const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return new GoogleGenAI({ apiKey });
};

/**
 * Extract denial information from document text
 */
export async function extractDenialInfo(documentText: string): Promise<{
    briefDescription: string;
    denialDate?: string;
    procedureName?: string;
}> {
    const ai = getGeminiClient();

    const prompt = `You are an insurance claim analyst. Analyze the following denial letter and extract:
1. A brief description of why the claim was denied (1-2 sentences)
2. The date of denial (if mentioned)
3. The procedure or treatment name that was denied (if mentioned)

Respond in JSON format only:
{
  "briefDescription": "string",
  "denialDate": "string or null",
  "procedureName": "string or null"
}

Document:
${documentText}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });

    const text = response.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('Failed to parse Gemini response:', text);
        return { briefDescription: 'Unable to extract denial information' };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error('Failed to parse JSON:', jsonMatch[0]);
        return { briefDescription: 'Unable to extract denial information' };
    }
}

/**
 * Analyze a case and generate appeal strategy
 */
export async function analyzeCase(
    denialReason: string,
    policyContext: string,
    existingAnalysis?: string
): Promise<{
    analysis: string;
    terms: { term: string; definition: string }[];
    contextUsed: string[];
}> {
    const ai = getGeminiClient();

    const prompt = `You are an expert insurance policy analyst helping consumers appeal denied claims.

Denial Reason: ${denialReason}

Policy Context:
${policyContext}

${existingAnalysis ? `Previous Analysis:\n${existingAnalysis}` : ''}

Analyze this denial and provide:
1. A detailed analysis of why this denial might be incorrect or appealable
2. Key insurance terms mentioned with their definitions
3. Which policy sections support the appeal

Respond in JSON format only:
{
  "analysis": "Detailed analysis text",
  "terms": [{"term": "string", "definition": "string"}],
  "contextUsed": ["Policy section 1", "Policy section 2"]
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });

    const text = response.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('Failed to parse Gemini response:', text);
        return {
            analysis: 'Unable to analyze case',
            terms: [],
            contextUsed: []
        };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error('Failed to parse JSON:', jsonMatch[0]);
        return {
            analysis: 'Unable to analyze case',
            terms: [],
            contextUsed: []
        };
    }
}

/**
 * Generate appeal email draft
 */
export async function generateEmailDraft(
    patientName: string,
    dob: string,
    policyNumber: string,
    insurerName: string,
    denialReason: string,
    analysisContext: string
): Promise<{
    subject: string;
    body: string;
}> {
    const ai = getGeminiClient();

    const prompt = `You are an expert at writing insurance appeal letters.

Patient: ${patientName}
DOB: ${dob}
Policy #: ${policyNumber}
Insurer: ${insurerName}

Denial Reason: ${denialReason}

Analysis/Context:
${analysisContext}

Write a professional, persuasive appeal letter. Include:
- Clear statement of what is being appealed
- Specific policy provisions that support coverage
- Medical necessity arguments
- Request for expedited review if applicable

Respond in JSON format only:
{
  "subject": "Email subject line",
  "body": "Full email body text"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });

    const text = response.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.error('Failed to parse Gemini response:', text);
        return {
            subject: `Appeal for Claim Denial - Policy #${policyNumber}`,
            body: 'Unable to generate email draft'
        };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error('Failed to parse JSON:', jsonMatch[0]);
        return {
            subject: `Appeal for Claim Denial - Policy #${policyNumber}`,
            body: 'Unable to generate email draft'
        };
    }
}

/**
 * Generate follow-up email based on email thread
 */
export async function generateFollowupEmail(
    emailThread: { from: string; body: string; date: string; type: string }[],
    caseContext: string
): Promise<{
    subject: string;
    body: string;
}> {
    const ai = getGeminiClient();

    const threadSummary = emailThread.map((e, i) =>
        `[${e.type.toUpperCase()}] ${e.date}\n${e.body}`
    ).join('\n\n---\n\n');

    const prompt = `You are an expert at writing insurance follow-up letters.

Email Thread:
${threadSummary}

Case Context:
${caseContext}

Write a professional follow-up email responding to the latest message. If the insurer:
- Requested more info: Acknowledge and provide it
- Denied again: Escalate the appeal with stronger arguments
- Partially approved: Thank them and push for full approval

Respond in JSON format only:
{
  "subject": "Re: [previous subject]",
  "body": "Full email body text"
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });

    const text = response.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return {
            subject: 'Re: Appeal Follow-up',
            body: 'Unable to generate follow-up draft'
        };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        return {
            subject: 'Re: Appeal Follow-up',
            body: 'Unable to generate follow-up draft'
        };
    }
}

/**
 * Analyze incoming email reply from insurance company
 */
export async function analyzeInsurerReply(
    emailBody: string
): Promise<{
    summary: string;
    weaknesses: string[];
    terms: { term: string; definition: string }[];
    actionItems: string[];
}> {
    const ai = getGeminiClient();

    const prompt = `You are an expert insurance claim analyst. Analyze this reply from an insurance company:

${emailBody}

Provide:
1. A brief summary of what the insurer is saying
2. Weaknesses in their argument that can be challenged
3. Key insurance terms used and their definitions
4. Recommended action items for the patient

Respond in JSON format only:
{
  "summary": "Brief summary",
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "terms": [{"term": "string", "definition": "string"}],
  "actionItems": ["Action 1", "Action 2"]
}`;

    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
    });

    const text = response.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return {
            summary: 'Unable to analyze reply',
            weaknesses: [],
            terms: [],
            actionItems: []
        };
    }

    try {
        return JSON.parse(jsonMatch[0]);
    } catch (e) {
        return {
            summary: 'Unable to analyze reply',
            weaknesses: [],
            terms: [],
            actionItems: []
        };
    }
}
