// Simple build script for Cloudflare Pages
console.log('Starting Cloudflare Pages build process...');

// We'll just use the direct command since we're having package-lock issues
const { execSync } = require('child_process');

try {
  console.log('Building frontend application...');
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

console.log('Build process completed successfully!'); 