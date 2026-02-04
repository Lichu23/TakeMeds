import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function drawPillIcon(ctx, size) {
  const center = size / 2;

  // Background
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, size, size);

  // Pill capsule
  const pillWidth = size * 0.5;
  const pillHeight = size * 0.3;
  const pillX = center - pillWidth / 2;
  const pillY = center - pillHeight / 2;

  // Left half (lighter)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pillX + pillHeight / 2, center, pillHeight / 2, Math.PI / 2, -Math.PI / 2);
  ctx.lineTo(center, pillY);
  ctx.lineTo(center, pillY + pillHeight);
  ctx.closePath();
  ctx.fill();

  // Right half (darker)
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(pillX + pillWidth - pillHeight / 2, center, pillHeight / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(center, pillY + pillHeight);
  ctx.lineTo(center, pillY);
  ctx.closePath();
  ctx.fill();

  // Center line
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = size * 0.02;
  ctx.beginPath();
  ctx.moveTo(center, pillY);
  ctx.lineTo(center, pillY + pillHeight);
  ctx.stroke();

  // Small dots for detail
  ctx.fillStyle = '#0284c7';
  const dotRadius = size * 0.02;
  const dotY = center - pillHeight * 0.15;
  ctx.beginPath();
  ctx.arc(center - pillWidth * 0.15, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(center + pillWidth * 0.15, dotY, dotRadius, 0, Math.PI * 2);
  ctx.fill();
}

function drawMaskableIcon(ctx, size) {
  const center = size / 2;
  const safeZone = size * 0.8;

  // Full background for maskable
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, size, size);

  // Pill capsule (smaller to fit safe zone)
  const pillWidth = safeZone * 0.4;
  const pillHeight = safeZone * 0.24;
  const pillX = center - pillWidth / 2;
  const pillY = center - pillHeight / 2;

  // Left half
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pillX + pillHeight / 2, center, pillHeight / 2, Math.PI / 2, -Math.PI / 2);
  ctx.lineTo(center, pillY);
  ctx.lineTo(center, pillY + pillHeight);
  ctx.closePath();
  ctx.fill();

  // Right half
  ctx.fillStyle = '#e0f2fe';
  ctx.beginPath();
  ctx.arc(pillX + pillWidth - pillHeight / 2, center, pillHeight / 2, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(center, pillY + pillHeight);
  ctx.lineTo(center, pillY);
  ctx.closePath();
  ctx.fill();

  // Center line
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = size * 0.015;
  ctx.beginPath();
  ctx.moveTo(center, pillY);
  ctx.lineTo(center, pillY + pillHeight);
  ctx.stroke();
}

// Generate regular icons
sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawPillIcon(ctx, size);

  const filename = path.join(iconsDir, `icon-${size}x${size}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Created ${filename}`);
});

// Generate maskable icons
[192, 512].forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  drawMaskableIcon(ctx, size);

  const filename = path.join(iconsDir, `icon-${size}x${size}-maskable.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Created ${filename} (maskable)`);
});

console.log('\n🎉 All icons generated successfully!');
