const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test the build process
console.log('Testing build process...');
try {
  // Navigate to frontend and run build
  console.log('Building frontend...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  
  // Check if dist directory was created
  const distPath = path.join(__dirname, 'frontend', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('Build successful! Dist directory created at:', distPath);
    console.log('Files in dist directory:');
    const files = fs.readdirSync(distPath);
    console.log(files);
  } else {
    console.error('Build failed! Dist directory not created.');
  }
} catch (error) {
  console.error('Build process failed:', error.message);
} 