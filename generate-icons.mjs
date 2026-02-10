// Generate PWA Icons - ES Module version
import fs from 'fs';

function createSVG(size, outputPath) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#FF4500"/>
  <text x="50%" y="50%" font-size="${size * 0.4}" font-family="Arial, sans-serif" 
        font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">JS</text>
</svg>`;
  
  fs.writeFileSync(outputPath, svg);
  console.log(`✅ Created: ${outputPath}`);
}

console.log('Generating PWA icon SVGs...\n');

createSVG(192, 'public/pwa-192x192.svg');
createSVG(512, 'public/pwa-512x512.svg');

console.log('\n✅ SVG files created!');
console.log('\n📝 Convert to PNG:');
console.log('1. Go to: https://cloudconvert.com/svg-to-png');
console.log('2. Upload public/pwa-192x192.svg → Convert → Download');
console.log('3. Upload public/pwa-512x512.svg → Convert → Download');
console.log('4. Move PNG files to public/ folder');
console.log('\nOR use: https://www.pwabuilder.com/imageGenerator');
