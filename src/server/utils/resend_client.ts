import { Resend } from 'resend';

// Initialize Resend client
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }
    return new Resend(apiKey);
};

/**
 * Generate a reply-to address for a specific case.
 * This enables insurance companies to reply directly to the email.
 */
export function getReplyToAddress(caseId: string): string {
    const inboundDomain = process.env.RESEND_INBOUND_DOMAIN;
    if (!inboundDomain) {
        // Fallback: no inbound domain configured, replies won't work automatically
        console.warn('RESEND_INBOUND_DOMAIN not set - email replies will not work automatically');
        return '';
    }
    return `case-${caseId}@${inboundDomain}`;
}

export interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
    from?: string;
    caseId?: string; // If provided, sets up reply-to for inbound tracking
    replyTo?: string; // Custom reply-to address
    inReplyTo?: string; // For email threading
}

export interface SendEmailResult {
    id: string;
    success: boolean;
}

/**
 * Send an email using Resend with optional reply-to for case tracking
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const resend = getResendClient();

    // Default from address - customize via RESEND_FROM_EMAIL env var
    const fromAddress = options.from || process.env.RESEND_FROM_EMAIL || 'PolicyPilot <onboarding@resend.dev>';

    // Set up reply-to address for case tracking
    let replyToAddress = options.replyTo;
    if (!replyToAddress && options.caseId) {
        replyToAddress = getReplyToAddress(options.caseId);
    }

    try {
        const emailPayload: any = {
            from: fromAddress,
            to: options.to,
            subject: options.subject,
            text: options.body,
        };

        // Add reply-to if available
        if (replyToAddress) {
            emailPayload.reply_to = replyToAddress;
            console.log(`Setting reply-to: ${replyToAddress}`);
        }

        // Add headers for email threading
        if (options.inReplyTo) {
            emailPayload.headers = {
                'In-Reply-To': options.inReplyTo,
                'References': options.inReplyTo,
            };
        }

        const { data, error } = await resend.emails.send(emailPayload);

        if (error) {
            console.error('Resend API error:', error);
            throw new Error(error.message);
        }

        console.log('Email sent successfully:', data?.id);

        return {
            id: data?.id || '',
            success: true,
        };
    } catch (error) {
        console.error('Error sending email via Resend:', error);
        throw error;
    }
}

// Export a client class for compatibility with existing code patterns
export class EmailClient {
    async sendEmail(to: string, subject: string, body: string, caseId?: string): Promise<SendEmailResult> {
        return sendEmail({ to, subject, body, caseId });
    }
}

export const emailClient = new EmailClient();

