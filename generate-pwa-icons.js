// Generate PWA Icons
// Run: node generate-pwa-icons.js

const fs = require('fs');

// Simple PNG generator using base64
function createSimplePNG(size, outputPath) {
  // Create a simple SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#FF4500"/>
      <text x="50%" y="50%" font-size="${size * 0.4}" font-family="Arial, sans-serif" 
            font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
        JS
      </text>
    </svg>
  `;
  
  console.log(`Created SVG for ${size}x${size}`);
  console.log(`Save this as ${outputPath}.svg and convert to PNG online`);
  console.log(`Or use: https://cloudconvert.com/svg-to-png`);
  console.log(svg);
  console.log('\n---\n');
  
  // Save SVG
  fs.writeFileSync(outputPath.replace('.png', '.svg'), svg);
}

// Generate icons
console.log('Generating PWA icons...\n');

createSimplePNG(192, 'public/pwa-192x192.png');
createSimplePNG(512, 'public/pwa-512x512.png');

console.log('\nSVG files created in public/ folder');
console.log('\nNext steps:');
console.log('1. Go to https://cloudconvert.com/svg-to-png');
console.log('2. Upload public/pwa-192x192.svg');
console.log('3. Convert and download as pwa-192x192.png');
console.log('4. Repeat for pwa-512x512.svg');
console.log('5. Place both PNG files in public/ folder');
console.log('\nOR use online PWA icon generator:');
console.log('https://www.pwabuilder.com/imageGenerator');
