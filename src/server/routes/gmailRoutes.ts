import { Hono } from 'hono';
import * as gmailController from '../controllers/gmailController';

const app = new Hono();

app.get('/auth', gmailController.auth);
app.get('/callback', gmailController.oauthCallback);
app.post('/send', gmailController.sendEmail);
app.post('/webhook', gmailController.webhook);
app.post('/sync', gmailController.syncEmails);

export default app;
