// This file is for testing Google Drive integration
// Environment variables are loaded from .env file by dotenv

// Required environment variables
const requiredVars = [
    'GOOGLE_TYPE',
    'GOOGLE_PROJECT_ID',
    'GOOGLE_CLIENT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID'
];

// Check if all required variables are set
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`- ${varName}`));
    console.error('\nPlease make sure to set all required variables in your .env file.');
    process.exit(1);
}

// Log which service account we're using (masking part of the email for security)
const maskedEmail = process.env.GOOGLE_CLIENT_EMAIL?.replace(
    /^(.)(.*)(@.*)$/, 
    (_, first, middle, last) => first + '*'.repeat(middle.length) + last
);

console.log('✅ Test configuration loaded');
console.log('🔑 Using service account:', maskedEmail);
console.log('📁 Target folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
