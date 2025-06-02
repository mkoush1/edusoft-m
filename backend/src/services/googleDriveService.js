import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import stream from 'stream';

// Configure Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Create auth client with service account credentials
const auth = new google.auth.GoogleAuth({
    credentials: {
        type: process.env.GOOGLE_TYPE,
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
    scopes: SCOPES
});

// Initialize Google Drive API client
const drive = google.drive({ version: 'v3', auth });

// Folder ID in Google Drive where files will be stored
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root';

/**
 * Uploads a file to Google Drive
 * @param {Object} file - Multer file object
 * @param {string} folderId - Google Drive folder ID
 * @returns {Promise<Object>} - Uploaded file metadata
 */
const uploadFile = async (file, folderId = FOLDER_ID) => {
    try {
        const fileMetadata = {
            name: `${Date.now()}_${file.originalname}`,
            parents: [folderId]
        };

        const media = {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.tempFilePath)
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink, mimeType, size',
        });

        // Make the file public
        await drive.permissions.create({
            fileId: response.data.id,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Get the file with updated permissions
        const fileDetails = await drive.files.get({
            fileId: response.data.id,
            fields: 'id, name, webViewLink, webContentLink, mimeType, size, createdTime, modifiedTime',
        });

        return {
            fileId: fileDetails.data.id,
            name: fileDetails.data.name,
            webViewLink: fileDetails.data.webViewLink,
            downloadLink: `https://drive.google.com/uc?export=download&id=${fileDetails.data.id}`,
            mimeType: fileDetails.data.mimeType,
            size: fileDetails.data.size,
            createdTime: fileDetails.data.createdTime,
            modifiedTime: fileDetails.data.modifiedTime
        };
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        throw error;
    }
};

/**
 * Deletes a file from Google Drive
 * @param {string} fileId - Google Drive file ID
 * @returns {Promise<boolean>} - True if deletion was successful
 */
const deleteFile = async (fileId) => {
    try {
        await drive.files.delete({
            fileId: fileId
        });
        return true;
    } catch (error) {
        console.error('Error deleting file from Google Drive:', error);
        throw error;
    }
};

export { uploadFile, deleteFile };
