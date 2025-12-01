import { Context } from 'hono';
import { getOAuthClient, getAuthUrl, getAndSaveTokens } from '../utils/gmail_auth';
import { gmailClient } from '../utils/gmail_client';
import { orchestrator } from '../agent/orchestrator';

export const auth = async (c: Context) => {
  const oAuth2Client = await getOAuthClient();
  const authUrl = getAuthUrl(oAuth2Client);
  return c.redirect(authUrl);
};

export const oauthCallback = async (c: Context) => {
  const code = c.req.query('code');
  if (!code) {
    return c.json({ error: 'Missing code' }, 400);
  }

  try {
    const oAuth2Client = await getOAuthClient();
    await getAndSaveTokens(oAuth2Client, code);
    
    // Set up Gmail Watch
    try {
        await gmailClient.watchInbox('projects/hazel-tome-479901-n9/topics/gmail-notifications'); // Replace with actual topic if different
        console.log('Gmail watch set up successfully');
    } catch (watchError) {
        console.error('Failed to set up Gmail watch:', watchError);
    }

    return c.json({ message: 'Authentication successful! You can now close this window.' });
  } catch (error) {
    console.error('Error retrieving access token', error);
    return c.json({ error: 'Authentication failed' }, 500);
  }
};

export const sendEmail = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { to, subject, message, userEmail, threadId, inReplyTo } = body; // Expect userEmail in body

    if (!to || !subject || !message) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // 1. Send the email
    const result = await gmailClient.sendEmail(to, subject, message, threadId, inReplyTo);
    
    // 2. Apply label if userEmail is provided
    if (userEmail && result.id) {
        try {
            // Create or get label for this user
            const label = await gmailClient.createLabel(userEmail);
            if (label && label.id) {
                // Apply label to the sent message (and thus the thread)
                await gmailClient.addLabel(result.id, label.id);
                console.log(`Applied label ${userEmail} to message ${result.id}`);
            }
        } catch (labelError) {
            console.error('Error applying label:', labelError);
            // Don't fail the request if labeling fails, but log it
        }
    }

    // 3. Save sent email to DB for thread tracking
    // We need caseId to associate it. It's not passed in body currently.
    // But we can try to find it via policy number in subject if available, or pass it.
    // Ideally pass caseId in body.
    // Let's check if we can pass caseId from frontend.
    // For now, let's try to match policy number again or just save it without caseId (but then we can't link back easily unless we search).
    // Actually, if we save it with threadId, and then the reply comes with same threadId, we can find this email.
    // But this email needs to have caseId.
    // So we MUST pass caseId from frontend.
    
    // Let's assume we will update frontend to pass caseId.
    const { caseId } = body; 
    
    if (result.id && result.threadId) {
        const { Email } = require('../models/Email'); // Lazy load to avoid circular deps if any
        const emailDoc = new Email({
            messageId: result.id,
            threadId: result.threadId,
            from: 'policypilotco@gmail.com', // Agent email
            to,
            subject,
            body: message,
            labelIds: result.labelIds,
            internalDate: new Date(),
            caseId: caseId // Save caseId if provided
        });
        await emailDoc.save();
        console.log(`Saved sent email ${result.id} to DB with caseId ${caseId}`);
    }

    return c.json({ success: true, result });
  } catch (error) {
    console.error('Error sending email:', error);
    return c.json({ error: 'Failed to send email' }, 500);
  }
};

export const webhook = async (c: Context) => {
  try {
    const body = await c.req.json();
    // Google Cloud Pub/Sub pushes messages in a specific format
    // { "message": { "data": "base64-encoded-json", "messageId": "..." } }
    
    if (!body.message || !body.message.data) {
      return c.json({ error: 'Invalid payload' }, 400);
    }

    const data = Buffer.from(body.message.data, 'base64').toString('utf-8');
    const notification = JSON.parse(data);
    
    // Notification format: { "emailAddress": "...", "historyId": 12345 }
    console.log('Received Pub/Sub notification:', notification);

    // In a real app, we would use historyId to sync changes incrementally.
    // For this agent, we'll just check for recent messages or specific logic.
    // Since the prompt asked to "track received email", we should fetch the latest message?
    // Or maybe the notification doesn't contain the message ID.
    // Gmail push notifications only tell you *something* changed.
    // We need to list history or messages to find what's new.
    
    // Simplified approach for this task:
    // List messages from the last minute (or just latest) to find the new one.
    // Ideally we use history.list(startHistoryId=...).
    
    // Let's just trigger a sync/check.
    // We'll list unread messages or just the very latest message.
    
    const messages = await gmailClient.listMessages('label:INBOX is:unread');
    if (messages && messages.length > 0) {
        // Process the latest one (or all unread)
        // For demo purposes, let's just process the first one found
        await orchestrator.processIncomingEmail(messages[0].id!);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
};

export const syncEmails = async (c: Context) => {
    try {
        console.log('Manual sync triggered');
        // List unread messages in INBOX
        const messages = await gmailClient.listMessages('label:INBOX is:unread');
        
        let processedCount = 0;
        if (messages && messages.length > 0) {
            // Process all unread messages
            for (const message of messages) {
                if (message.id) {
                    await orchestrator.processIncomingEmail(message.id);
                    processedCount++;
                }
            }
        }
        
        return c.json({ success: true, processed: processedCount });
    } catch (error) {
        console.error('Error syncing emails:', error);
        return c.json({ error: 'Sync failed' }, 500);
    }
};
