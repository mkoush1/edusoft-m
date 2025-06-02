import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = 'http://localhost:5000/api/presentation-assessment';
const JWT_TOKEN = 'YOUR_JWT_TOKEN'; // Replace with a valid JWT token

// Sample files (create these in your project directory or update paths)
const VIDEO_FILE = path.join(__dirname, 'test-video.mp4');
const PRESENTATION_FILE = path.join(__dirname, 'test-presentation.pdf');

async function testFileUpload() {
    try {
        // Check if test files exist
        if (!fs.existsSync(VIDEO_FILE) || !fs.existsSync(PRESENTATION_FILE)) {
            console.error('Test files not found. Please create sample files first.');
            console.log('Required files:');
            console.log(`- ${VIDEO_FILE}`);
            console.log(`- ${PRESENTATION_FILE}`);
            return;
        }

        console.log('Starting file upload test...');
        
        // Create form data
        const formData = new FormData();
        formData.append('video', fs.createReadStream(VIDEO_FILE));
        formData.append('presentation', fs.createReadStream(PRESENTATION_FILE));
        formData.append('questionId', '1'); // Example question ID

        // Make the request
        const response = await axios.post(
            `${API_URL}/submit`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${JWT_TOKEN}`,
                    'Content-Type': 'multipart/form-data'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        );

        console.log('Upload successful!');
        console.log('Response:', response.data);
        
        if (response.data.data) {
            console.log('\nFile URLs:');
            console.log(`Video URL: ${response.data.data.videoUrl}`);
            console.log(`Presentation URL: ${response.data.data.presentationFile.webViewLink}`);
        }
    } catch (error) {
        console.error('Error during file upload test:');
        
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
            console.error('Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testFileUpload();
