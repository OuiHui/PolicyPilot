import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';

// Load client secret from file

const TOKEN_PATH = path.join(process.cwd(), 'token.json');

// Scopes for the agent
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.labels'
];

/**
 * Create an OAuth2 client with the given credentials.
 */
export async function getOAuthClient(): Promise<OAuth2Client> {
  const client_id = process.env.GMAIL_CLIENT_ID;
  const client_secret = process.env.GMAIL_CLIENT_SECRET;
  const redirect_uri = process.env.GMAIL_REDIRECT_URI;

  if (!client_id || !client_secret || !redirect_uri) {
    throw new Error("Missing Gmail OAuth credentials in .env file");
  }
  
  const oAuth2Client = new google.auth.OAuth2(
    client_id, 
    client_secret, 
    redirect_uri
  );

  // Check if we have a stored token
  try {
    const token = await fs.promises.readFile(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch (err) {
    // Token not found or invalid, caller needs to handle auth flow
    console.log('No token found, authentication required.');
  }

  return oAuth2Client;
}

/**
 * Generate the URL for the user to authorize the app.
 */
export function getAuthUrl(oAuth2Client: OAuth2Client): string {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force refresh token generation
  });
}

export async function getAndSaveTokens(oAuth2Client: OAuth2Client, code: string): Promise<void> {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  await fs.promises.writeFile(TOKEN_PATH, JSON.stringify(tokens));
  console.log('Token stored to', TOKEN_PATH);
}

/**
 * Generate the URL for user login (profile + email only).
 */
export function getLoginAuthUrl(oAuth2Client: OAuth2Client): string {
  return oAuth2Client.generateAuthUrl({
    access_type: 'online', // We don't need refresh token for simple login
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state: 'login', // Identify this as a login flow
    prompt: 'select_account'
  });
}

/**
 * Fetch user profile using the OAuth client.
 */
export async function getUserProfile(oAuth2Client: OAuth2Client): Promise<any> {
  const res = await oAuth2Client.request({ url: 'https://www.googleapis.com/oauth2/v1/userinfo' });
  return res.data;
}
