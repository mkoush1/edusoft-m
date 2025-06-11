#!/usr/bin/env node

/**
 * EduSoft Build Script
 * 
 * This script builds the frontend application for Cloudflare Pages deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('EduSoft Build Script');
console.log('===================');

// Check if frontend directory exists
const frontendDir = path.join(__dirname, 'frontend');
if (!fs.existsSync(frontendDir)) {
  console.error('Error: frontend directory not found');
  process.exit(1);
}

// Build frontend
console.log('\nBuilding frontend...');
try {
  execSync('cd frontend && npm install && npm run build', { stdio: 'inherit' });
  console.log('Frontend build successful!');
} catch (error) {
  console.error('Frontend build failed:', error.message);
  process.exit(1);
}

// Check if dist directory was created
const distDir = path.join(frontendDir, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not created');
  process.exit(1);
}

// List files in the dist directory
console.log('\nFiles in dist directory:');
const distFiles = fs.readdirSync(distDir);
console.log(distFiles);

console.log('\nBuild completed successfully!'); 