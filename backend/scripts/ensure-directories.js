/**
 * Script to ensure all required directories exist for file uploads
 */

const fs = require('fs');
const path = require('path');

// Define the base directory
const baseDir = path.join(process.cwd(), '..');

// Define the directories to create
const directories = [
  path.join(baseDir, 'public'),
  path.join(baseDir, 'public', 'uploads'),
  path.join(baseDir, 'public', 'uploads', 'presentations'),
  path.join(baseDir, 'tmp')
];

// Create each directory if it doesn't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory already exists: ${dir}`);
  }
});

console.log('All required directories have been created.');
