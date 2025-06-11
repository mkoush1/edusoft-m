#!/usr/bin/env node

/**
 * EduSoft Deployment Helper Script
 * 
 * This script helps prepare the project for deployment to Cloudflare Pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('EduSoft Deployment Helper');
console.log('========================\n');

// Check if required directories exist
console.log('Checking project structure...');
const requiredDirs = ['frontend', 'functions'];
const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));

if (missingDirs.length > 0) {
  console.error(`Error: Missing required directories: ${missingDirs.join(', ')}`);
  process.exit(1);
}

// Check if required configuration files exist
console.log('Checking configuration files...');
const requiredFiles = ['wrangler.toml', '.cloudflare/pages.toml'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));

if (missingFiles.length > 0) {
  console.error(`Error: Missing required files: ${missingFiles.join(', ')}`);
  process.exit(1);
}

// Test frontend build
console.log('\nTesting frontend build process...');
try {
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  console.log('Frontend build successful!');
  
  // List files in the build directory
  const buildDir = path.join('frontend', 'dist');
  if (fs.existsSync(buildDir)) {
    console.log(`\nFiles in ${buildDir} directory:`);
    const files = fs.readdirSync(buildDir);
    console.log(files);
  }
} catch (error) {
  console.error('Frontend build failed:', error.message);
  process.exit(1);
}

// Check for environment variables
console.log('\nChecking for environment variables...');
const envFile = '.env';
if (fs.existsSync(envFile)) {
  console.log('Found .env file - remember this will not be uploaded to Cloudflare');
  console.log('You need to set these variables in the Cloudflare Pages dashboard');
} else {
  console.log('No .env file found. You will need to set environment variables in Cloudflare Pages dashboard');
}

// Create a deployment checklist
console.log('\nCreating deployment checklist...');
const checklistContent = `# Deployment Checklist

## Before Deployment
- [ ] Frontend builds successfully
- [ ] API endpoints are properly configured
- [ ] MongoDB connection string is ready
- [ ] JWT secret is generated

## Cloudflare Pages Setup
- [ ] Connect GitHub repository
- [ ] Set build command: \`cd frontend && npm install && npm run build\`
- [ ] Set build output directory: \`frontend/dist\`
- [ ] Enable Functions
- [ ] Set Functions directory to \`/functions\`

## Environment Variables
- [ ] MONGODB_URI
- [ ] JWT_SECRET

## After Deployment
- [ ] Test frontend loads correctly
- [ ] Test API endpoints using /api-test.html
- [ ] Check environment variables are properly set
`;

fs.writeFileSync('DEPLOYMENT_CHECKLIST.md', checklistContent);
console.log('Created DEPLOYMENT_CHECKLIST.md');

console.log('\nDeployment preparation complete!');
console.log('Next steps:');
console.log('1. Push your code to GitHub');
console.log('2. Connect your repository to Cloudflare Pages');
console.log('3. Configure build settings as specified in COMPLETE_DEPLOYMENT_STEPS.md');
console.log('4. Set environment variables in Cloudflare Pages dashboard');
console.log('5. Deploy your application');
console.log('\nGood luck!'); 