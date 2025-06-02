import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public directory exists
const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Generate slide placeholder (16:9 aspect ratio)
function generateSlidePlaceholder() {
    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Border
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    
    // Text
    ctx.fillStyle = '#666';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Slide Placeholder', width / 2, height / 2);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, 'placeholder-slide.png'), buffer);
}

// Generate thumbnail placeholder (4:3 aspect ratio)
function generateThumbnailPlaceholder() {
    const width = 400;
    const height = 300;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, width, height);
    
    // Border
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 5;
    ctx.strokeRect(2, 2, width - 4, height - 4);
    
    // Text
    ctx.fillStyle = '#888';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Thumbnail', width / 2, height / 2);
    
    // Save to file
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(publicDir, 'placeholder-thumbnail.png'), buffer);
}

// Generate both placeholders
generateSlidePlaceholder();
generateThumbnailPlaceholder();

console.log('Generated placeholder images in', publicDir);
