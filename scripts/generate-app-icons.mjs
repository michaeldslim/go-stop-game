#!/usr/bin/env node
/**
 * Generates app icons from a Hwatu card PNG (default: feb-animal).
 * Outputs: icon.png, splash-icon.png, android-icon-foreground.png,
 *          android-icon-monochrome.png, favicon.png, icon-preview/source/*
 */
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CARD_SRC = join(ROOT, 'assets/cards/master/feb-animal.png');
const ASSETS = join(ROOT, 'assets');
const PREVIEW = join(ASSETS, 'icon-preview/source');

const BG = '#8B1A1A';
const CREAM = '#F5E6C8';
const CARD_W = 512;
const CARD_H = 839;
const CARD_RATIO = CARD_W / CARD_H;

async function loadCard(width, height) {
  return sharp(CARD_SRC).resize(width, height, { fit: 'fill' }).png().toBuffer();
}

async function makeAppIcon() {
  const size = 1024;
  const cardHeight = Math.round(size * 0.62);
  const cardWidth = Math.round(cardHeight * CARD_RATIO);
  const cardTop = Math.round(size * 0.08);
  const cardLeft = Math.round((size - cardWidth) / 2);
  const card = await loadCard(cardWidth, cardHeight);

  const textSvg = Buffer.from(`<svg width="${size}" height="${size}">
  <text x="512" y="940" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="96" font-weight="700" fill="${CREAM}">Hwatu</text>
</svg>`);

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([
      { input: card, top: cardTop, left: cardLeft },
      { input: textSvg, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
}

async function makeSplashIcon() {
  const size = 200;
  const cardHeight = Math.round(size * 0.92);
  const cardWidth = Math.round(cardHeight * CARD_RATIO);
  const card = await loadCard(cardWidth, cardHeight);
  const left = Math.round((size - cardWidth) / 2);
  const top = Math.round((size - cardHeight) / 2);

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: card, top, left }])
    .png()
    .toBuffer();
}

async function makeAndroidForeground() {
  const size = 1024;
  const cardHeight = Math.round(size * 0.62);
  const cardWidth = Math.round(cardHeight * CARD_RATIO);
  const card = await loadCard(cardWidth, cardHeight);
  const left = Math.round((size - cardWidth) / 2);
  const top = Math.round((size - cardHeight) / 2);

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: card, top, left }])
    .png()
    .toBuffer();
}

async function makeAndroidMonochrome() {
  const size = 1024;
  const cardHeight = Math.round(size * 0.62);
  const cardWidth = Math.round(cardHeight * CARD_RATIO);

  const { data, info } = await sharp(CARD_SRC)
    .resize(cardWidth, cardHeight, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < info.width * info.height; i += 1) {
    const o = i * 4;
    const a = data[o + 3];
    if (a > 32) {
      out[o] = 255;
      out[o + 1] = 255;
      out[o + 2] = 255;
      out[o + 3] = a;
    }
  }

  const card = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
  const left = Math.round((size - cardWidth) / 2);
  const top = Math.round((size - cardHeight) / 2);

  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: card, top, left }])
    .png()
    .toBuffer();
}

async function makeFavicon() {
  const size = 48;
  const cardHeight = Math.round(size * 0.92);
  const cardWidth = Math.round(cardHeight * CARD_RATIO);
  const card = await loadCard(cardWidth, cardHeight);
  const left = Math.round((size - cardWidth) / 2);
  const top = Math.round((size - cardHeight) / 2);

  return sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: card, top, left }])
    .png()
    .toBuffer();
}

async function write(buf, dest) {
  await sharp(buf).toFile(dest);
  console.log(`✓ ${dest.replace(`${ROOT}/`, '')}`);
}

async function main() {
  await mkdir(PREVIEW, { recursive: true });

  const [appIcon, splash, foreground, monochrome, favicon] = await Promise.all([
    makeAppIcon(),
    makeSplashIcon(),
    makeAndroidForeground(),
    makeAndroidMonochrome(),
    makeFavicon(),
  ]);

  await write(appIcon, join(ASSETS, 'icon.png'));
  await write(splash, join(ASSETS, 'splash-icon.png'));
  await write(foreground, join(ASSETS, 'android-icon-foreground.png'));
  await write(monochrome, join(ASSETS, 'android-icon-monochrome.png'));
  await write(favicon, join(ASSETS, 'favicon.png'));

  await write(appIcon, join(PREVIEW, '01-app-icon.png'));
  await write(foreground, join(PREVIEW, '02-android-foreground.png'));
  await write(monochrome, join(PREVIEW, '03-android-monochrome.png'));
  await write(splash, join(PREVIEW, '04-splash.png'));
  await write(favicon, join(PREVIEW, '05-favicon.png'));

  console.log('\nDone. Run `npx expo prebuild --platform android` to refresh native launcher assets.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
