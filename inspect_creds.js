const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load .env.local manually to mimic server behavior
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const clientId = envConfig.GMAIL_CLIENT_ID;
const clientSecret = envConfig.GMAIL_CLIENT_SECRET;

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
    console.log(`Client Secret First Char: ${clientSecret.charCodeAt(0)} (${clientSecret[0]})`);
    console.log(`Client Secret Last Char: ${clientSecret.charCodeAt(clientSecret.length - 1)} (${clientSecret[clientSecret.length - 1]})`);
    console.log(`Client Secret Value: "${clientSecret}"`);
} else {
    console.log('Client Secret is MISSING');
}
