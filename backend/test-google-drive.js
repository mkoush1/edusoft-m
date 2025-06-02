import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

async function testGoogleDrive() {
    try {
        console.log('Starting Google Drive test...');
        
        // Get environment variables
        const credentials = {
            type: process.env.GOOGLE_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\\\n/g, '\\n'),
            client_email: process.env.GOOGLE_CLIENT_EMAIL
        };

        console.log('Using service account:', credentials.client_email);
        
        // Create auth client
        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        // Create Drive API client
        const drive = google.drive({ version: 'v3', auth });
        
        // Test authentication by listing files in the folder
        console.log('Listing files in folder:', process.env.GOOGLE_DRIVE_FOLDER_ID);
        const res = await drive.files.list({
            q: `'${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
            pageSize: 10,
            fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
        });
        
        const files = res.data.files;
        if (files.length) {
            console.log('Files found:');
            files.forEach(file => {
                console.log(`${file.name} (${file.mimeType}) - ${file.webViewLink}`);
            });
        } else {
            console.log('No files found in the specified folder.');
        }
        
        console.log('\n✅ Google Drive test completed successfully!');
    } catch (error) {
        console.error('❌ Error testing Google Drive:');
        console.error('Message:', error.message);
        
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.code) {
            console.error('Code:', error.code);
        }
        
        if (error.stack) {
            console.error('\nStack trace:');
            console.error(error.stack.split('\n').slice(0, 3).join('\n'));
        }
    }
}

// Run the test
testGoogleDrive();
