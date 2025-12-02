const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local first, then .env, just like the server
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const redirectUri = process.env.GMAIL_REDIRECT_URI;

console.log('--- Credential Inspection ---');

if (clientId) {
    console.log(`Client ID Length: ${clientId.length}`);
    console.log(`Client ID First Char: ${clientId.charCodeAt(0)} (${clientId[0]})`);
    console.log(`Client ID Last Char: ${clientId.charCodeAt(clientId.length - 1)} (${clientId[clientId.length - 1]})`);
    console.log(`Client ID Value: "${clientId}"`);
} else {
    console.log('Client ID is MISSING');
}

if (clientSecret) {
    console.log(`Client Secret Length: ${clientSecret.length}`);
    const hasPrefix = clientSecret.startsWith('GOCSPX-');
    console.log(`Has 'GOCSPX-' prefix: ${hasPrefix}`);
    console.log(`Client Secret First Char: ${clientSecret.charCodeAt(0)} (${clientSecret[0]})`);
    console.log(`Client Secret Last Char: ${clientSecret.charCodeAt(clientSecret.length - 1)} (${clientSecret[clientSecret.length - 1]})`);
} else {
    console.log('Client Secret is MISSING');
}

if (redirectUri) {
    console.log(`Redirect URI Length: ${redirectUri.length}`);
    console.log(`Redirect URI Value: "${redirectUri}"`);
} else {
    console.log('Redirect URI is MISSING');
}
