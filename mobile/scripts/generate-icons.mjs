/**
 * Generates all required app icon PNGs from an SVG source.
 * Run once with: node scripts/generate-icons.mjs
 *
 * Requires: npm install --save-dev sharp
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, '..', 'assets');

/* ── Icon SVG — 1024×1024 square, green shield mark ─────────────────────
 * Used for: icon.png, android-icon-foreground.png, splash-icon.png
 * The adaptive icon background (android-icon-background.png) is a flat
 * green square — defined separately below.
 * ---------------------------------------------------------------------- */
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <!-- background -->
  <rect width="1024" height="1024" rx="224" fill="#146b45"/>
  <!-- shield path -->
  <path
    d="M512 180 L780 290 L780 530 C780 680 660 790 512 844 C364 790 244 680 244 530 L244 290 Z"
    fill="none"
    stroke="white"
    stroke-width="48"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <!-- road lines inside shield -->
  <line x1="512" y1="390" x2="512" y2="680" stroke="white" stroke-width="44" stroke-linecap="round"/>
  <line x1="390" y1="512" x2="634" y2="512" stroke="white" stroke-width="44" stroke-linecap="round"/>
  <!-- Ghana flag stripe accent -->
  <rect x="244" y="752" width="536" height="18" rx="9" fill="#D92D20" opacity="0.85"/>
  <rect x="244" y="778" width="536" height="18" rx="9" fill="#F5B335" opacity="0.85"/>
  <rect x="244" y="804" width="536" height="18" rx="9" fill="#5cbe8a" opacity="0.85"/>
</svg>
`;

/* ── Splash SVG — icon centred on white, for splash screen ──────────────── */
const SPLASH_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#0a1a0f"/>
  <!-- shield -->
  <path
    d="M512 280 L730 370 L730 540 C730 650 636 738 512 780 C388 738 294 650 294 540 L294 370 Z"
    fill="none"
    stroke="#5cbe8a"
    stroke-width="36"
    stroke-linejoin="round"
    stroke-linecap="round"
  />
  <line x1="512" y1="420" x2="512" y2="660" stroke="#5cbe8a" stroke-width="32" stroke-linecap="round"/>
  <line x1="402" y1="530" x2="622" y2="530" stroke="#5cbe8a" stroke-width="32" stroke-linecap="round"/>
</svg>
`;

async function generate() {
    console.log('Generating app icons...');

    // icon.png — 1024×1024, rounded square (Expo applies the mask)
    await sharp(Buffer.from(ICON_SVG))
        .resize(1024, 1024)
        .png()
        .toFile(join(assetsDir, 'icon.png'));
    console.log('✓ icon.png');

    // android-icon-foreground.png — 1024×1024 foreground layer (no bg, adaptive icon)
    const FOREGROUND_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <path
      d="M512 180 L780 290 L780 530 C780 680 660 790 512 844 C364 790 244 680 244 530 L244 290 Z"
      fill="none"
      stroke="white"
      stroke-width="48"
      stroke-linejoin="round"
      stroke-linecap="round"
    />
    <line x1="512" y1="390" x2="512" y2="680" stroke="white" stroke-width="44" stroke-linecap="round"/>
    <line x1="390" y1="512" x2="634" y2="512" stroke="white" stroke-width="44" stroke-linecap="round"/>
  </svg>`;

    await sharp(Buffer.from(FOREGROUND_SVG))
        .resize(1024, 1024)
        .png()
        .toFile(join(assetsDir, 'android-icon-foreground.png'));
    console.log('✓ android-icon-foreground.png');

    // android-icon-background.png — solid green
    await sharp({
        create: { width: 1024, height: 1024, channels: 4, background: { r: 20, g: 107, b: 69, alpha: 1 } },
    })
        .png()
        .toFile(join(assetsDir, 'android-icon-background.png'));
    console.log('✓ android-icon-background.png');

    // android-icon-monochrome.png — white on transparent
    const MONO_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <path
      d="M512 180 L780 290 L780 530 C780 680 660 790 512 844 C364 790 244 680 244 530 L244 290 Z"
      fill="none" stroke="white" stroke-width="48" stroke-linejoin="round" stroke-linecap="round"
    />
    <line x1="512" y1="390" x2="512" y2="680" stroke="white" stroke-width="44" stroke-linecap="round"/>
    <line x1="390" y1="512" x2="634" y2="512" stroke="white" stroke-width="44" stroke-linecap="round"/>
  </svg>`;

    await sharp(Buffer.from(MONO_SVG))
        .resize(1024, 1024)
        .png()
        .toFile(join(assetsDir, 'android-icon-monochrome.png'));
    console.log('✓ android-icon-monochrome.png');

    // splash-icon.png — dark bg with green shield
    await sharp(Buffer.from(SPLASH_SVG))
        .resize(1024, 1024)
        .png()
        .toFile(join(assetsDir, 'splash-icon.png'));
    console.log('✓ splash-icon.png');

    // favicon.png — 48×48
    await sharp(Buffer.from(ICON_SVG))
        .resize(48, 48)
        .png()
        .toFile(join(assetsDir, 'favicon.png'));
    console.log('✓ favicon.png');

    console.log('\nAll icons generated successfully.');
}

generate().catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
});
