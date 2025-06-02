import fileUpload from 'express-fileupload';
import fs from 'fs';
import path from 'path';

// Middleware to handle file uploads
export const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp/',
  createParentPath: true,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max file size for video uploads
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached',
  debug: true,
  parseNested: true,
  safeFileNames: true,
  preserveExtension: true,
  uploadTimeout: 120000, // 2 minutes timeout for large files
  // Busboy specific options to improve reliability
  defParamCharset: 'utf8',
  defCharset: 'utf8',
  // Increase buffer size for better handling of large files
  maxFileSize: 500 * 1024 * 1024, // 500MB max file size (redundant but explicit)
  // Add error handling
  abortOnError: false, // Don't abort on error, let the route handler deal with it
  // Add a custom error handler
  debug: process.env.NODE_ENV === 'development'
});

// Helper function to ensure upload directories exist
export const ensureUploadDirectories = () => {
  const dirs = [
    './tmp',
    './public',
    './public/uploads',
    './public/uploads/presentations'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
};

// Call this function when the server starts
ensureUploadDirectories();
