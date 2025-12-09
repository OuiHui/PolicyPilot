/**
 * Modal API Client
 * 
 * Calls the Modal.com serverless Python endpoints for AI features.
 * 
 * Modal URL format: https://{username}--{app-name}-{function-name}.modal.run
 * MODAL_API_URL should be set to: https://huynguy127--policypilot-rag
 */

const MODAL_API_URL = process.env.MODAL_API_URL || '';

interface ModalResponse<T> {
    data?: T;
    error?: string;
}

/**
 * Build Modal function URL.
 * Modal uses subdomain format: {base}-{endpoint}.modal.run
 */
function buildModalUrl(endpoint: string): string {
    // MODAL_API_URL should be like: https://huynguy127--policypilot-rag
    // Endpoint is like: extract-denial
    // Result should be: https://huynguy127--policypilot-rag-extract-denial.modal.run
    return `${MODAL_API_URL}-${endpoint}.modal.run`;
}

async function callModal<T>(endpoint: string, body: object): Promise<ModalResponse<T>> {
    if (!MODAL_API_URL) {
        console.warn('MODAL_API_URL not configured');
        return { error: 'Modal API not configured. Please set MODAL_API_URL environment variable.' };
    }

    const url = buildModalUrl(endpoint);
    console.log(`Calling Modal: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`Modal API error: ${response.status} - ${text}`);
            return { error: `Modal API error: ${response.status}` };
        }

        const data = await response.json() as T;

        // Check if Modal returned an error in the response body
        if (data && typeof data === 'object' && 'error' in data) {
            return { error: (data as any).error };
        }

        return { data };
    } catch (error: any) {
        console.error('Error calling Modal:', error);
        return { error: error.message || 'Failed to call Modal API' };
    }
}

export interface ExtractDenialResult {
    briefDescription: string;
}

export async function extractDenialViaModal(caseId: string): Promise<ModalResponse<ExtractDenialResult>> {
    return callModal<ExtractDenialResult>('extract-denial', { caseId });
}

export interface AnalyzeCaseResult {
    analysis: string;
    terms: { term: string; definition: string }[];
}

export async function analyzeCaseViaModal(caseId: string, userId: string): Promise<ModalResponse<AnalyzeCaseResult>> {
    return callModal<AnalyzeCaseResult>('analyze-case', { caseId, userId });
}

export interface GenerateEmailResult {
    emailDraft: {
        subject?: string;
        body: string;
    };
}

export async function generateEmailViaModal(caseId: string, userId: string): Promise<ModalResponse<GenerateEmailResult>> {
    return callModal<GenerateEmailResult>('generate-email', { caseId, userId });
}

export interface EmailMessage {
    from: string;
    body: string;
    date: string;
    type: string;
}

export async function generateFollowupViaModal(caseId: string, emailThread: EmailMessage[]): Promise<ModalResponse<GenerateEmailResult>> {
    return callModal<GenerateEmailResult>('generate-followup', { caseId, emailThread });
}

export async function checkModalHealth(): Promise<boolean> {
    if (!MODAL_API_URL) return false;

    try {
        const response = await fetch(buildModalUrl('health'));
        return response.ok;
    } catch {
        return false;
    }
}

