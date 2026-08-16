#!/usr/bin/env node
/**
 * Generates illustrated Hwatu card PNGs (48 cards + back).
 * Output: assets/cards/master/ → resized to 1x/2x/3x via generate-card-sizes.sh
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { CARD_ART } from './card-art/cardArt.mjs';
import { WIDTH, HEIGHT, COLORS } from './card-art/svgHelpers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const CARD_IDS = Object.keys(CARD_ART);

function cardBackSvg() {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="floral" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
      <circle cx="40" cy="40" r="12" fill="${COLORS.gold}" opacity="0.15"/>
      <circle cx="0" cy="0" r="8" fill="${COLORS.gold}" opacity="0.1"/>
      <circle cx="80" cy="80" r="8" fill="${COLORS.gold}" opacity="0.1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${COLORS.redDark}" rx="18"/>
  <rect width="100%" height="100%" fill="url(#floral)" rx="18"/>
  <rect x="20" y="20" width="${WIDTH - 40}" height="${HEIGHT - 40}" fill="none" stroke="${COLORS.gold}" stroke-width="5" rx="12"/>
  <rect x="36" y="36" width="${WIDTH - 72}" height="${HEIGHT - 72}" fill="none" stroke="${COLORS.gold}" stroke-width="2" rx="8" opacity="0.6"/>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 - 20}" text-anchor="middle" font-family="serif" font-size="140" font-weight="bold" fill="${COLORS.gold}">花</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 80}" text-anchor="middle" font-family="sans-serif" font-size="42" fill="${COLORS.cream}" opacity="0.85">Hwatu</text>
  <text x="${WIDTH / 2}" y="${HEIGHT / 2 + 130}" text-anchor="middle" font-family="serif" font-size="28" fill="${COLORS.gold}" opacity="0.5">화투</text>
</svg>`;
}

async function writePng(svg, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

async function main() {
  const masterDir = join(ROOT, 'assets/cards/master');
  const backDir = join(ROOT, 'assets/cards/back');

  for (const id of CARD_IDS) {
    const svg = CARD_ART[id]();
    const out = join(masterDir, `${id}.png`);
    await writePng(svg, out);
    console.log(`✓ ${id}.png`);
  }

  const backSvg = cardBackSvg();
  await writePng(backSvg, join(backDir, 'card-back.png'));
  await writePng(backSvg, join(backDir, 'card-back@2x.png'));
  await writePng(backSvg, join(backDir, 'card-back@3x.png'));
  console.log('✓ card-back.png');

  console.log(`\nGenerated ${CARD_IDS.length} cards. Run ./scripts/generate-card-sizes.sh next.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
