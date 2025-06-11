const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build frontend
console.log('Building frontend...');
try {
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  console.log('Frontend build successful!');
} catch (error) {
  console.error('Frontend build failed:', error.message);
  process.exit(1);
}

// Check if dist directory was created
const distPath = path.join(__dirname, 'frontend', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('Frontend build failed! Dist directory not created.');
  process.exit(1);
}

// Copy functions directory to dist
const functionsPath = path.join(__dirname, 'functions');
const distFunctionsPath = path.join(distPath, 'functions');

if (fs.existsSync(functionsPath)) {
  console.log('Copying functions directory to dist...');
  
  // Create functions directory in dist if it doesn't exist
  if (!fs.existsSync(distFunctionsPath)) {
    fs.mkdirSync(distFunctionsPath, { recursive: true });
  }
  
  // Copy functions files
  const copyDir = (src, dest) => {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath, { recursive: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };
  
  copyDir(functionsPath, distFunctionsPath);
  console.log('Functions copied successfully!');
}

console.log('Deployment preparation complete!');
console.log('To deploy to Cloudflare Pages:');
console.log('1. Push your changes to GitHub');
console.log('2. Configure Cloudflare Pages to use the following settings:');
console.log('   - Build command: cd frontend && npm install && npm run build');
console.log('   - Build output directory: frontend/dist');
console.log('3. Add the following environment variables in Cloudflare Pages:');
console.log('   - MONGODB_URI: your MongoDB connection string');
console.log('   - JWT_SECRET: your JWT secret');
console.log('   - NODE_ENV: production'); 