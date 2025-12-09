import { Hono } from 'hono';
import { Context } from 'hono';
import { CaseModel } from '../models/Case';

const app = new Hono();

/**
 * Resend Inbound Email Webhook
 * 
 * This endpoint receives emails from Resend when someone replies to a PolicyPilot email.
 * The reply-to address format is: case-{caseId}@{RESEND_INBOUND_DOMAIN}
 * 
 * Resend sends a POST request with the email data in JSON format.
 */
app.post('/inbound', async (c: Context) => {
    try {
        const body = await c.req.json();

        console.log('Received inbound email webhook:', JSON.stringify(body, null, 2));

        // Resend inbound webhook payload structure:
        // {
        //   "from": "sender@example.com",
        //   "to": "case-123@inbound.yourdomain.com",
        //   "subject": "Re: Appeal for Claim Denial",
        //   "text": "Plain text body",
        //   "html": "<p>HTML body</p>",
        //   "headers": {...}
        // }

        const { from, to, subject, text, html } = body;

        if (!to) {
            console.error('Missing "to" field in inbound email');
            return c.json({ error: 'Missing recipient' }, 400);
        }

        // Extract case ID from the reply-to address
        // Format: case-{caseId}@inbound.domain.com
        const toAddress = Array.isArray(to) ? to[0] : to;
        const caseIdMatch = toAddress.match(/case-([a-zA-Z0-9]+)@/);

        if (!caseIdMatch) {
            console.log('Could not extract case ID from address:', toAddress);
            return c.json({ error: 'Invalid reply address format' }, 400);
        }

        const caseId = caseIdMatch[1];
        console.log(`Extracted case ID: ${caseId}`);

        // Find the case in the database
        const caseDoc = await CaseModel.findOne({ id: caseId });

        if (!caseDoc) {
            console.error(`Case not found: ${caseId}`);
            return c.json({ error: 'Case not found' }, 404);
        }

        // Create email message object
        const emailMessage = {
            id: `inbound-${Date.now()}`,
            from: from || 'unknown@sender.com',
            to: toAddress,
            subject: subject || 'No Subject',
            body: text || html?.replace(/<[^>]*>/g, '') || '', // Prefer plain text, fallback to stripped HTML
            date: new Date().toISOString(),
            type: 'received' as const,
        };

        // Add email to the case's email thread
        const updatedEmailThread = [...(caseDoc.emailThread || []), emailMessage];

        // Update case in database
        await CaseModel.findOneAndUpdate(
            { id: caseId },
            {
                emailThread: updatedEmailThread,
                status: 'reply-received',
                currentStep: 'reply-received',
                hasNewEmail: true,
            }
        );

        console.log(`Added inbound email to case ${caseId}. Thread now has ${updatedEmailThread.length} messages.`);

        // TODO: Trigger RAG analysis on the received email
        // This could be done asynchronously or via a queue

        return c.json({
            success: true,
            caseId,
            messageId: emailMessage.id,
        });
    } catch (error: any) {
        console.error('Error processing inbound email:', error);
        return c.json({
            error: 'Failed to process inbound email',
            details: error.message,
        }, 500);
    }
});

// Health check for inbound webhook
app.get('/health', (c: Context) => {
    return c.json({
        status: 'ok',
        service: 'resend-inbound',
        inboundDomain: process.env.RESEND_INBOUND_DOMAIN || 'not configured',
    });
});

export default app;
