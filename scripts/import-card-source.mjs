#!/usr/bin/env node
/**
 * Converts assets/resource/*.webp (Wikimedia Hwatu names)
 * into assets/cards/master/*.png at 512×839, then runs size generation.
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SOURCE = join(ROOT, 'assets/resource');
const MASTER = join(ROOT, 'assets/cards/master');
const BACK = join(ROOT, 'assets/cards/back');

const WIDTH = 512;
const HEIGHT = 839;

/** [source filename, card id] — one source can map to multiple cards */
const SOURCE_ENTRIES = [
  ['500px-Hwatu_January_Hikari.svg.webp', 'jan-bright'],
  ['500px-Hwatu_January_Tanzaku.svg.webp', 'jan-ribbon'],
  ['500px-Hwatu_January_Kasu_1.svg.webp', 'jan-junk-1'],
  ['500px-Hwatu_January_Kasu_2.svg.webp', 'jan-junk-2'],

  ['500px-Hwatu_February_Tane.svg.webp', 'feb-animal'],
  ['500px-Hwatu_February_Tanzaku.svg.webp', 'feb-ribbon'],
  ['500px-Hwatu_February_Kasu_1.svg.webp', 'feb-junk-1'],
  ['500px-Hwatu_February_Kasu_2.svg.webp', 'feb-junk-2'],

  ['500px-Hwatu_March_Hikari.svg.webp', 'mar-bright'],
  ['500px-Hwatu_March_Tanzaku.svg.webp', 'mar-ribbon'],
  ['500px-Hwatu_March_Kasu_1.svg.webp', 'mar-junk-1'],
  ['500px-Hwatu_March_Kasu_2.svg.webp', 'mar-junk-2'],

  ['500px-Hwatu_April_Tane.svg.webp', 'apr-animal'],
  ['500px-Hwatu_April_Tanzaku.svg.webp', 'apr-ribbon'],
  ['500px-Hwatu_April_Kasu_1.svg.webp', 'apr-junk-1'],
  ['500px-Hwatu_April_Kasu_2.svg.webp', 'apr-junk-2'],

  ['500px-Hwatu_May_Tane.svg.webp', 'may-animal'],
  ['500px-Hwatu_May_Tanzaku.svg.webp', 'may-ribbon'],
  ['500px-Hwatu_May_Kasu_1.svg.webp', 'may-junk-1'],
  ['500px-Hwatu_May_Kasu_2.svg.webp', 'may-junk-2'],

  ['500px-Hwatu_June_Tane.svg.webp', 'jun-animal'],
  ['500px-Hwatu_June_Tanzaku.svg.webp', 'jun-ribbon'],
  ['500px-Hwatu_June_Kasu_1.svg.webp', 'jun-junk-1'],
  ['500px-Hwatu_June_Kasu_2.svg.webp', 'jun-junk-2'],

  ['500px-Hwatu_July_Tane.svg.webp', 'jul-animal'],
  ['500px-Hwatu_July_Tanzaku.svg.webp', 'jul-ribbon'],
  ['500px-Hwatu_July_Kasu_1.svg.webp', 'jul-junk-1'],
  ['500px-Hwatu_July_Kasu_2.svg.webp', 'jul-junk-2'],

  ['500px-Hwatu_August_Tane.svg.webp', 'aug-animal'],
  ['500px-Hwatu_August_Hikari.svg.webp', 'aug-bright'],
  // No August Tanzaku in Wikimedia Hwatu set — reuse July plain ribbon (same 초단 type)
  ['500px-Hwatu_July_Tanzaku.svg.webp', 'aug-ribbon'],
  ['500px-Hwatu_August_Kasu_1.svg.webp', 'aug-junk-1'],

  ['500px-Hwatu_September_Tane.svg.webp', 'sep-junk-double'],
  ['500px-Hwatu_September_Tanzaku.svg.webp', 'sep-ribbon'],
  ['500px-Hwatu_September_Kasu_1.svg.webp', 'sep-junk-1'],
  ['500px-Hwatu_September_Kasu_2.svg.webp', 'sep-junk-2'],

  ['500px-Hwatu_October_Tane.svg.webp', 'oct-animal'],
  ['500px-Hwatu_October_Kasu_1.svg.webp', 'oct-junk-1'],
  ['500px-Hwatu_October_Kasu_2.svg.webp', 'oct-junk-2'],
  // No October ribbon in Hwatu — Tanzaku used as 3rd junk
  ['500px-Hwatu_October_Tanzaku.svg.webp', 'oct-ribbon'],

  // November Hikari is the phoenix bright (봉황 광); three Kasu are 피 + 쌍피
  ['500px-Hwatu_November_Hikari.svg.webp', 'nov-bright'],
  ['500px-Hwatu_November_Kasu_1.svg.webp', 'nov-junk-1'],
  ['500px-Hwatu_November_Kasu_2.svg.webp', 'nov-junk-2'],
  ['500px-Hwatu_November_Kasu_3.svg.webp', 'nov-junk-double'],

  ['500px-Hwatu_December_Hikari.svg.webp', 'dec-bright'],
  ['500px-Hwatu_December_Kasu.svg.webp', 'dec-animal'],
  ['500px-Hwatu_December_Tane.svg.webp', 'dec-ribbon'],
  ['500px-Hwatu_December_Tanzaku.svg.webp', 'dec-junk-double'],
];

const BACK_SOURCE = '500px-Hanafuda_card_back.svg.webp';

const EXPECTED_IDS = [
  'jan-bright', 'jan-ribbon', 'jan-junk-1', 'jan-junk-2',
  'feb-animal', 'feb-ribbon', 'feb-junk-1', 'feb-junk-2',
  'mar-bright', 'mar-ribbon', 'mar-junk-1', 'mar-junk-2',
  'apr-animal', 'apr-ribbon', 'apr-junk-1', 'apr-junk-2',
  'may-animal', 'may-ribbon', 'may-junk-1', 'may-junk-2',
  'jun-animal', 'jun-ribbon', 'jun-junk-1', 'jun-junk-2',
  'jul-animal', 'jul-ribbon', 'jul-junk-1', 'jul-junk-2',
  'aug-animal', 'aug-bright', 'aug-ribbon', 'aug-junk-1',
  'sep-junk-double', 'sep-ribbon', 'sep-junk-1', 'sep-junk-2',
  'oct-animal', 'oct-junk-1', 'oct-junk-2', 'oct-ribbon',
  'nov-bright', 'nov-junk-1', 'nov-junk-2', 'nov-junk-double',
  'dec-bright', 'dec-animal', 'dec-ribbon', 'dec-junk-double',
];

async function convertWebpToPng(srcPath, destPath) {
  await sharp(srcPath)
    .resize(WIDTH, HEIGHT, { fit: 'contain', background: { r: 245, g: 230, b: 200 } })
    .png()
    .toFile(destPath);
}

async function main() {
  await mkdir(MASTER, { recursive: true });
  await mkdir(BACK, { recursive: true });

  const produced = new Set();

  for (const [sourceName, cardId] of SOURCE_ENTRIES) {
    const src = join(SOURCE, sourceName);
    const dest = join(MASTER, `${cardId}.png`);
    try {
      await convertWebpToPng(src, dest);
      produced.add(cardId);
      console.log(`✓ ${sourceName} → ${cardId}.png`);
    } catch (err) {
      console.error(`✗ missing or failed: ${sourceName} (${cardId})`);
      console.error(err.message);
    }
  }

  const backSrc = join(SOURCE, BACK_SOURCE);
  const backDest = join(BACK, 'card-back.png');
  await convertWebpToPng(backSrc, backDest);
  await sharp(backSrc).resize(WIDTH, HEIGHT).png().toFile(join(BACK, 'card-back@2x.png'));
  await sharp(backSrc).resize(WIDTH, HEIGHT).png().toFile(join(BACK, 'card-back@3x.png'));
  console.log(`✓ ${BACK_SOURCE} → card-back.png`);

  const missing = EXPECTED_IDS.filter((id) => !produced.has(id));
  if (missing.length) {
    console.error('\nMissing cards:', missing.join(', '));
    process.exit(1);
  }

  console.log(`\nImported ${produced.size} cards at ${WIDTH}×${HEIGHT}.`);
  execSync('./scripts/generate-card-sizes.sh', { cwd: ROOT, stdio: 'inherit' });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
