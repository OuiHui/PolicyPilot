import { Resend } from 'resend';

// Initialize Resend client
const getResendClient = () => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY environment variable is not set');
    }
    return new Resend(apiKey);
};

export interface SendEmailOptions {
    to: string;
    subject: string;
    body: string;
    from?: string;
}

export interface SendEmailResult {
    id: string;
    success: boolean;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const resend = getResendClient();

    // Default from address - you can customize this after adding a domain to Resend
    // In sandbox mode, this must be onboarding@resend.dev
    const fromAddress = options.from || 'PolicyPilot <onboarding@resend.dev>';

    try {
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: options.to,
            subject: options.subject,
            text: options.body,
        });

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
    async sendEmail(to: string, subject: string, body: string): Promise<SendEmailResult> {
        return sendEmail({ to, subject, body });
    }
}

export const emailClient = new EmailClient();
