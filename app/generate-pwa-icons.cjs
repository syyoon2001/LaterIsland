const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputImagePath = path.join(__dirname, 'public/assets/logo-book.png');
const outputDir = path.join(__dirname, 'public');

async function generateIcons() {
  try {
    // Generate 192x192 icon
    await sharp(inputImagePath)
      .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'pwa-192x192.png'));
    console.log('pwa-192x192.png generated');

    // Generate 512x512 icon
    await sharp(inputImagePath)
      .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(path.join(outputDir, 'pwa-512x512.png'));
    console.log('pwa-512x512.png generated');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
