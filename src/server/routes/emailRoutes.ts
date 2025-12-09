import { Hono } from 'hono';
import { Context } from 'hono';
import { sendEmail } from '../utils/resend_client';

const app = new Hono();

/**
 * POST /send - Send an email via Resend
 * Body: { to, subject, message, userEmail?, caseId? }
 */
app.post('/send', async (c: Context) => {
    try {
        const body = await c.req.json();
        const { to, subject, message, userEmail, caseId } = body;

        if (!to || !subject || !message) {
            return c.json({ error: 'Missing required fields: to, subject, message' }, 400);
        }

        console.log(`Sending email to ${to} with subject: ${subject}`);

        // Send the email via Resend
        const result = await sendEmail({
            to,
            subject,
            body: message,
        });

        console.log(`Email sent successfully, ID: ${result.id}`);

        // Log for tracking purposes (we can add DB logging later if needed)
        if (userEmail) {
            console.log(`Email sent on behalf of user: ${userEmail}`);
        }
        if (caseId) {
            console.log(`Email associated with case: ${caseId}`);
        }

        return c.json({
            success: true,
            result: {
                id: result.id,
                // Include these for frontend compatibility
                threadId: null, // Resend doesn't have threading like Gmail
                labelIds: [],
            }
        });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return c.json({
            error: 'Failed to send email',
            details: error.message
        }, 500);
    }
});

// Health check for the email service
app.get('/health', (c: Context) => {
    const hasApiKey = !!process.env.RESEND_API_KEY;
    return c.json({
        status: hasApiKey ? 'ok' : 'missing_api_key',
        service: 'resend',
    });
});

export default app;
