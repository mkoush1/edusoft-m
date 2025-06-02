import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File to upload
const filePath = path.join(__dirname, 'test-files', 'test.txt');

async function uploadFile() {
    try {
        console.log('Authenticating with Google Drive...');
        
        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials: {
                type: process.env.GOOGLE_TYPE,
                project_id: process.env.GOOGLE_PROJECT_ID,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\\\n/g, '\\n'),
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
            },
            scopes: ['https://www.googleapis.com/auth/drive.file']
        });

        // Create Drive API client
        const drive = google.drive({ version: 'v3', auth });

        console.log('Uploading file to Google Drive...');
        
        // File metadata
        const fileMetadata = {
            name: `test-upload-${Date.now()}.txt`,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
        };

        // Upload file
        const media = {
            mimeType: 'text/plain',
            body: fs.createReadStream(filePath)
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink, mimeType, size'
        });

        console.log('File uploaded successfully!');
        console.log('File ID:', response.data.id);
        console.log('Name:', response.data.name);
        console.log('Web View Link:', response.data.webViewLink);
        console.log('Download Link:', `https://drive.google.com/uc?export=download&id=${response.data.id}`);
        
        return response.data;
    } catch (error) {
        console.error('Error uploading file:');
        console.error(error.message);
        if (error.errors) {
            error.errors.forEach(err => console.error(err.message));
        }
        throw error;
    }
}

// Run the upload
uploadFile().catch(console.error);
