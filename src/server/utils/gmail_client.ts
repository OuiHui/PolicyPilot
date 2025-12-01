import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { getOAuthClient } from './gmail_auth';

export class GmailClient {
  private auth: OAuth2Client | null = null;
  private gmail: gmail_v1.Gmail | null = null;

  async init() {
    this.auth = await getOAuthClient();
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  async sendEmail(to: string, subject: string, body: string, threadId?: string, inReplyTo?: string) {
    if (!this.gmail) await this.init();
    
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
    ];

    if (inReplyTo) {
        messageParts.push(`In-Reply-To: ${inReplyTo}`);
        messageParts.push(`References: ${inReplyTo}`);
    }

    messageParts.push('');
    messageParts.push(body);

    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const requestBody: any = {
        raw: encodedMessage,
    };

    if (threadId) {
        requestBody.threadId = threadId;
    }

    const res = await this.gmail!.users.messages.send({
      userId: 'me',
      requestBody,
    });

    return res.data;
  }

  async listMessages(query: string) {
    if (!this.gmail) await this.init();
    const res = await this.gmail!.users.messages.list({
      userId: 'me',
      q: query,
    });
    return res.data.messages || [];
  }

  async getMessage(id: string) {
    if (!this.gmail) await this.init();
    const res = await this.gmail!.users.messages.get({
      userId: 'me',
      id: id,
    });
    return res.data;
  }

  async modifyLabels(id: string, addLabelIds: string[], removeLabelIds: string[]) {
    if (!this.gmail) await this.init();
    await this.gmail!.users.messages.modify({
      userId: 'me',
      id: id,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });
  }

  async watchInbox(topicName: string) {
    if (!this.gmail) await this.init();
    const res = await this.gmail!.users.watch({
      userId: 'me',
      requestBody: {
        labelIds: ['INBOX'],
        topicName: topicName,
      },
    });
    return res.data;
  }
  
  async getProfile() {
      if (!this.gmail) await this.init();
      const res = await this.gmail!.users.getProfile({
          userId: 'me'
      });
      return res.data;
  }
  async createLabel(name: string) {
    if (!this.gmail) await this.init();
    try {
      const res = await this.gmail!.users.labels.create({
        userId: 'me',
        requestBody: {
          name: name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      return res.data;
    } catch (error: any) {
      if (error.code === 409) {
        // Label already exists, fetch it
        const labels = await this.gmail!.users.labels.list({ userId: 'me' });
        return labels.data.labels?.find(l => l.name === name);
      }
      throw error;
    }
  }

  async addLabel(messageId: string, labelId: string) {
    if (!this.gmail) await this.init();
    await this.gmail!.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId],
      },
    });
  }

  async listLabels() {
    if (!this.gmail) await this.init();
    const res = await this.gmail!.users.labels.list({ userId: 'me' });
    return res.data.labels || [];
  }

  async getThread(threadId: string) {
    if (!this.gmail) await this.init();
    const res = await this.gmail!.users.threads.get({
      userId: 'me',
      id: threadId,
    });
    return res.data;
  }
}

export const gmailClient = new GmailClient();
