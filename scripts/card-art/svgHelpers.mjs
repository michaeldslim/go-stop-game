/** Shared SVG building blocks for traditional Korean Hwatu card art */

export const WIDTH = 600;
export const HEIGHT = 960;

export const COLORS = {
  cream: '#F5E6C8',
  paper: '#EDE0C8',
  ink: '#1A1410',
  red: '#C41E3A',
  redDark: '#8B1A1A',
  blue: '#1E5AA8',
  gold: '#C9A227',
  green: '#2D5A27',
  greenLight: '#4A7C3F',
  brown: '#6B4423',
  brownDark: '#4A2C17',
  white: '#F8F4EC',
  moon: '#E8E0D0',
  orange: '#D35400',
  mapleRed: '#C0392B',
  mapleOrange: '#E67E22',
  purple: '#7B4F9E',
  yellow: '#F1C40F',
  black: '#1A1410',
  gray: '#7A7068',
};

export function baseCard(inner = '') {
  return `
  <rect width="100%" height="100%" fill="${COLORS.cream}" rx="18"/>
  <rect x="14" y="14" width="${WIDTH - 28}" height="${HEIGHT - 28}" fill="${COLORS.paper}" rx="10"/>
  <rect x="14" y="14" width="${WIDTH - 28}" height="${HEIGHT - 28}" fill="none" stroke="${COLORS.ink}" stroke-width="5" rx="10"/>
  ${inner}`;
}

/** Traditional red sun disc with 光 (gwang) */
export function brightDisc(cx, cy, r = 72) {
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLORS.red}" stroke="${COLORS.redDark}" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="none" stroke="${COLORS.gold}" stroke-width="2" opacity="0.5"/>
  <text x="${cx}" y="${cy + 28}" text-anchor="middle" font-family="serif" font-size="${r * 0.9}" font-weight="bold" fill="${COLORS.gold}">光</text>`;
}

/** Hongdan — red ribbon with poetry stripes */
export function ribbonHongdan() {
  return `
  <path d="M 80 540 Q 300 400 520 540 Q 300 720 80 540 Z" fill="${COLORS.red}" stroke="${COLORS.ink}" stroke-width="4"/>
  <path d="M 130 520 Q 300 440 470 520" fill="none" stroke="${COLORS.ink}" stroke-width="2.5"/>
  <path d="M 140 560 Q 300 490 460 560" fill="none" stroke="${COLORS.ink}" stroke-width="2.5"/>
  <path d="M 150 600 Q 300 530 450 600" fill="none" stroke="${COLORS.ink}" stroke-width="2.5"/>
  <text x="300" y="575" text-anchor="middle" font-family="serif" font-size="36" fill="${COLORS.ink}" opacity="0.6">紅</text>`;
}

/** Cheongdan — blue ribbon */
export function ribbonCheongdan() {
  return `
  <path d="M 70 530 Q 300 380 530 530 Q 300 720 70 530 Z" fill="${COLORS.blue}" stroke="${COLORS.ink}" stroke-width="4"/>
  <path d="M 130 515 Q 300 420 470 515" fill="none" stroke="${COLORS.white}" stroke-width="2.5" opacity="0.4"/>
  <path d="M 140 560 Q 300 470 460 560" fill="none" stroke="${COLORS.white}" stroke-width="2.5" opacity="0.3"/>
  <text x="300" y="570" text-anchor="middle" font-family="serif" font-size="40" fill="${COLORS.white}" opacity="0.6">靑</text>`;
}

/** Chodan — plain red ribbon */
export function ribbonChodan() {
  return `
  <path d="M 80 535 Q 300 410 520 535 Q 300 710 80 535 Z" fill="${COLORS.red}" stroke="${COLORS.ink}" stroke-width="4"/>
  <path d="M 140 520 Q 300 450 460 520" fill="none" stroke="${COLORS.redDark}" stroke-width="2.5" opacity="0.5"/>`;
}

export function pineBranch(x, y, scale = 1) {
  const s = scale;
  return `
  <path d="M ${x} ${y + 200 * s} Q ${x - 30 * s} ${y + 100 * s} ${x + 20 * s} ${y} L ${x + 40 * s} ${y + 200 * s} Z" fill="${COLORS.green}" stroke="${COLORS.ink}" stroke-width="2"/>
  <g stroke="${COLORS.greenLight}" stroke-width="${3 * s}" stroke-linecap="round">
    <line x1="${x + 10 * s}" y1="${y + 180 * s}" x2="${x - 40 * s}" y2="${y + 140 * s}"/>
    <line x1="${x + 15 * s}" y1="${y + 150 * s}" x2="${x - 50 * s}" y2="${y + 110 * s}"/>
    <line x1="${x + 20 * s}" y1="${y + 120 * s}" x2="${x - 35 * s}" y2="${y + 80 * s}"/>
    <line x1="${x + 25 * s}" y1="${y + 90 * s}" x2="${x - 30 * s}" y2="${y + 50 * s}"/>
    <line x1="${x + 30 * s}" y1="${y + 60 * s}" x2="${x + 70 * s}" y2="${y + 30 * s}"/>
    <line x1="${x + 35 * s}" y1="${y + 100 * s}" x2="${x + 80 * s}" y2="${y + 70 * s}"/>
    <line x1="${x + 40 * s}" y1="${y + 140 * s}" x2="${x + 85 * s}" y2="${y + 110 * s}"/>
  </g>`;
}

export function crane(x, y, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="30" rx="35" ry="25" fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="2"/>
    <path d="M 25 -10 Q 50 -30 60 -5 Q 55 10 30 5 Z" fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="2"/>
    <circle cx="55" cy="-8" r="8" fill="${COLORS.red}" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <path d="M 60 -5 L 75 0" stroke="${COLORS.ink}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="-15" cy="50" rx="12" ry="8" fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="1.5" transform="rotate(-20)"/>
    <ellipse cx="15" cy="50" rx="12" ry="8" fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="1.5" transform="rotate(20)"/>
    <line x1="-10" y1="50" x2="-10" y2="80" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round"/>
    <line x1="10" y1="50" x2="10" y2="80" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round"/>
    <line x1="-5" y1="80" x2="-15" y2="85" stroke="${COLORS.ink}" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="5" y1="80" x2="15" y2="85" stroke="${COLORS.ink}" stroke-width="2.5" stroke-linecap="round"/>
  </g>`;
}

export function plumBlossoms(cx, cy, count = 5, scale = 1) {
  const s = scale;
  let svg = '';
  const positions = [
    [0, 0], [-40 * s, -30 * s], [40 * s, -20 * s], [-20 * s, 40 * s], [30 * s, 35 * s],
    [-50 * s, 20 * s], [50 * s, 30 * s],
  ];
  for (let i = 0; i < Math.min(count, positions.length); i++) {
    const [dx, dy] = positions[i];
    svg += blossom(cx + dx, cy + dy, 14 * s);
  }
  return svg;
}

export function blossom(cx, cy, r = 14) {
  const petals = 5;
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r * 0.35}" fill="${COLORS.yellow}"/>`;
  for (let i = 0; i < petals; i++) {
    const angle = (i * 2 * Math.PI) / petals - Math.PI / 2;
    const px = cx + Math.cos(angle) * r * 0.7;
    const py = cy + Math.sin(angle) * r * 0.7;
    svg += `<circle cx="${px}" cy="${py}" r="${r * 0.55}" fill="${COLORS.red}" opacity="0.9"/>`;
  }
  return svg;
}

export function cherryBlossoms(cx, cy, count = 6, scale = 1) {
  const s = scale;
  let svg = '';
  const positions = [
    [0, 0], [-35 * s, -25 * s], [35 * s, -15 * s], [-25 * s, 35 * s], [30 * s, 30 * s], [0, -40 * s],
  ];
  for (let i = 0; i < Math.min(count, positions.length); i++) {
    const [dx, dy] = positions[i];
    svg += cherryBlossom(cx + dx, cy + dy, 12 * s);
  }
  return svg;
}

export function cherryBlossom(cx, cy, r = 12) {
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${COLORS.redDark}"/>`;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(angle) * r * 0.65;
    const py = cy + Math.sin(angle) * r * 0.65;
    svg += `<circle cx="${px}" cy="${py}" r="${r * 0.5}" fill="#FFB7C5"/>`;
  }
  return svg;
}

export function smallBird(x, y, scale = 1, color = COLORS.brown) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="0" rx="18" ry="12" fill="${color}" stroke="${COLORS.ink}" stroke-width="2"/>
    <ellipse cx="15" cy="-5" rx="10" ry="8" fill="${color}" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <circle cx="20" cy="-8" r="3" fill="${COLORS.ink}"/>
    <path d="M 22 -6 L 30 -4" stroke="${COLORS.ink}" stroke-width="2" stroke-linecap="round"/>
    <path d="M -5 0 Q -20 -15 -15 -25 Q -5 -20 0 -5" fill="${color}" stroke="${COLORS.ink}" stroke-width="1.5"/>
  </g>`;
}

export function cuckoo(x, y, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="10" rx="30" ry="22" fill="#5D4E37" stroke="${COLORS.ink}" stroke-width="2"/>
    <ellipse cx="25" cy="0" rx="15" ry="12" fill="#5D4E37" stroke="${COLORS.ink}" stroke-width="2"/>
    <circle cx="32" cy="-3" r="4" fill="${COLORS.ink}"/>
    <path d="M 35 0 L 45 2" stroke="${COLORS.ink}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M -10 5 Q -25 -10 -20 -25" fill="none" stroke="#5D4E37" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="-5" cy="15" rx="8" ry="5" fill="#8B7355" stroke="${COLORS.ink}" stroke-width="1"/>
  </g>`;
}

export function wisteria(cx, cy, scale = 1) {
  const s = scale;
  let svg = '';
  for (let i = 0; i < 4; i++) {
    const ox = (i - 1.5) * 35 * s;
    for (let j = 0; j < 5; j++) {
      svg += `<circle cx="${cx + ox + j * 3}" cy="${cy + j * 22 * s}" r="${10 * s}" fill="${COLORS.purple}" opacity="0.85"/>`;
    }
  }
  return svg;
}

export function iris(cx, cy, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${cx},${cy}) scale(${s})">
    <path d="M 0 -60 L -15 20 L 0 40 L 15 20 Z" fill="${COLORS.purple}" stroke="${COLORS.ink}" stroke-width="2"/>
    <path d="M -30 -20 L -40 30 L -10 20 Z" fill="${COLORS.blue}" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <path d="M 30 -20 L 40 30 L 10 20 Z" fill="${COLORS.blue}" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <line x1="0" y1="40" x2="0" y2="80" stroke="${COLORS.green}" stroke-width="4"/>
  </g>`;
}

export function sparrows(x, y, scale = 1) {
  const s = scale;
  return `
  ${smallBird(x - 30 * s, y, s * 0.9, '#8B6914')}
  ${smallBird(x + 25 * s, y + 15 * s, s * 0.85, '#A0782C')}
  ${smallBird(x + 5 * s, y - 20 * s, s * 0.75, '#7A5C1E')}`;
}

export function butterfly(x, y, scale = 1, flip = false) {
  const s = scale;
  const flipX = flip ? -1 : 1;
  return `
  <g transform="translate(${x},${y}) scale(${flipX * s},${s})">
    <ellipse cx="0" cy="0" rx="5" ry="12" fill="${COLORS.brownDark}" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <ellipse cx="-18" cy="-8" rx="22" ry="16" fill="${COLORS.orange}" stroke="${COLORS.ink}" stroke-width="2" transform="rotate(-20)"/>
    <ellipse cx="18" cy="-8" rx="22" ry="16" fill="${COLORS.orange}" stroke="${COLORS.ink}" stroke-width="2" transform="rotate(20)"/>
    <ellipse cx="-15" cy="10" rx="16" ry="12" fill="#E8A838" stroke="${COLORS.ink}" stroke-width="1.5" transform="rotate(15)"/>
    <ellipse cx="15" cy="10" rx="16" ry="12" fill="#E8A838" stroke="${COLORS.ink}" stroke-width="1.5" transform="rotate(-15)"/>
    <circle cx="-12" cy="-5" r="4" fill="${COLORS.white}" opacity="0.6"/>
    <circle cx="12" cy="-5" r="4" fill="${COLORS.white}" opacity="0.6"/>
  </g>`;
}

export function peony(cx, cy, scale = 1) {
  const s = scale;
  let svg = `<circle cx="${cx}" cy="${cy}" r="${18 * s}" fill="${COLORS.red}" stroke="${COLORS.ink}" stroke-width="2"/>`;
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const px = cx + Math.cos(angle) * 28 * s;
    const py = cy + Math.sin(angle) * 28 * s;
    svg += `<circle cx="${px}" cy="${py}" r="${14 * s}" fill="${COLORS.red}" opacity="0.8"/>`;
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="${8 * s}" fill="${COLORS.yellow}"/>`;
  return svg;
}

export function boar(x, y, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="10" rx="45" ry="30" fill="#6B5344" stroke="${COLORS.ink}" stroke-width="2.5"/>
    <ellipse cx="40" cy="5" rx="18" ry="15" fill="#6B5344" stroke="${COLORS.ink}" stroke-width="2"/>
    <circle cx="50" cy="0" r="4" fill="${COLORS.ink}"/>
    <ellipse cx="48" cy="8" rx="6" ry="4" fill="#8B7355"/>
    <path d="M -30 -5 Q -40 -20 -25 -25" fill="none" stroke="#6B5344" stroke-width="6" stroke-linecap="round"/>
    <path d="M -35 15 L -45 25 M -30 20 L -40 30" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round"/>
    <path d="M 15 30 L 15 45 M 25 30 L 25 45" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

export function bushClover(cx, cy, scale = 1) {
  const s = scale;
  let svg = '';
  for (let i = 0; i < 6; i++) {
    const ox = (i % 3 - 1) * 30 * s;
    const oy = Math.floor(i / 3) * 35 * s;
    svg += `<circle cx="${cx + ox}" cy="${cy + oy}" r="${10 * s}" fill="${COLORS.purple}" opacity="0.7"/>`;
    svg += `<circle cx="${cx + ox - 8 * s}" cy="${cy + oy + 5 * s}" r="${8 * s}" fill="${COLORS.purple}" opacity="0.6"/>`;
    svg += `<circle cx="${cx + ox + 8 * s}" cy="${cy + oy + 5 * s}" r="${8 * s}" fill="${COLORS.purple}" opacity="0.6"/>`;
  }
  return svg;
}

export function geese(scale = 1) {
  const s = scale;
  return `
  <g fill="${COLORS.white}" stroke="${COLORS.ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M ${150 * s} ${320 * s} Q ${180 * s} ${290 * s} ${210 * s} ${320 * s} L ${230 * s} ${310 * s} Q ${250 * s} ${280 * s} ${280 * s} ${310 * s}" transform="translate(50, 50)"/>
    <path d="M ${280 * s} ${360 * s} Q ${310 * s} ${330 * s} ${340 * s} ${360 * s} L ${360 * s} ${350 * s} Q ${380 * s} ${300 * s} ${410 * s} ${350 * s}" transform="translate(50, 50)"/>
    <path d="M ${200 * s} ${400 * s} Q ${230 * s} ${370 * s} ${260 * s} ${400 * s} L ${280 * s} ${390 * s} Q ${300 * s} ${350 * s} ${330 * s} ${390 * s}" transform="translate(50, 50)"/>
  </g>
  <g fill="${COLORS.ink}">
    <circle cx="${260 * s}" cy="${375 * s}" r="5"/><circle cx="${390 * s}" cy="${405 * s}" r="5"/><circle cx="${310 * s}" cy="${455 * s}" r="5"/>
  </g>`;
}

export function moon(cx, cy, r = 80) {
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${COLORS.moon}" stroke="${COLORS.ink}" stroke-width="3"/>
  <circle cx="${cx - 15}" cy="${cy - 10}" r="${r * 0.15}" fill="${COLORS.gray}" opacity="0.3"/>
  <circle cx="${cx + 20}" cy="${cy + 15}" r="${r * 0.1}" fill="${COLORS.gray}" opacity="0.2"/>`;
}

export function pampasGrass(cx, cy, scale = 1) {
  const s = scale;
  let svg = '';
  for (let i = -2; i <= 2; i++) {
    const ox = i * 25 * s;
    svg += `<line x1="${cx + ox}" y1="${cy + 100 * s}" x2="${cx + ox}" y2="${cy - 40 * s}" stroke="${COLORS.green}" stroke-width="3"/>`;
    for (let j = 0; j < 4; j++) {
      svg += `<ellipse cx="${cx + ox + (j % 2 ? 8 : -8) * s}" cy="${cy - 30 * s + j * 20 * s}" rx="${12 * s}" ry="${6 * s}" fill="${COLORS.cream}" stroke="${COLORS.ink}" stroke-width="1" transform="rotate(${j * 15})"/>`;
    }
  }
  return svg;
}

export function chrysanthemum(cx, cy, scale = 1) {
  const s = scale;
  let svg = '';
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const px = cx + Math.cos(angle) * 30 * s;
    const py = cy + Math.sin(angle) * 30 * s;
    svg += `<ellipse cx="${px}" cy="${py}" rx="${8 * s}" ry="${18 * s}" fill="${COLORS.yellow}" stroke="${COLORS.ink}" stroke-width="1" transform="rotate(${angle * 180 / Math.PI} ${px} ${py})"/>`;
  }
  svg += `<circle cx="${cx}" cy="${cy}" r="${10 * s}" fill="${COLORS.orange}"/>`;
  return svg;
}

export function sakeCup(x, y, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <path d="M -25 0 L -35 40 Q -35 55 0 55 Q 35 55 35 40 L 25 0 Z" fill="${COLORS.red}" stroke="${COLORS.ink}" stroke-width="2"/>
    <ellipse cx="0" cy="0" rx="28" ry="8" fill="${COLORS.redDark}" stroke="${COLORS.ink}" stroke-width="2"/>
    <ellipse cx="0" cy="5" rx="20" ry="5" fill="${COLORS.cream}" opacity="0.4"/>
  </g>`;
}

export function deer(x, y, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="20" rx="35" ry="25" fill="#C4A574" stroke="${COLORS.ink}" stroke-width="2"/>
    <ellipse cx="30" cy="10" rx="15" ry="12" fill="#C4A574" stroke="${COLORS.ink}" stroke-width="2"/>
    <circle cx="38" cy="6" r="3" fill="${COLORS.ink}"/>
    <path d="M 25 -15 L 20 -45 M 30 -15 L 35 -50 M 15 -15 L 5 -40" stroke="${COLORS.brownDark}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="-20" cy="30" rx="8" ry="5" fill="#C4A574" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <path d="M -30 40 L -35 55 M 10 40 L 10 55" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

export function mapleLeaves(cx, cy, count = 4, scale = 1) {
  const s = scale;
  const colors = [COLORS.mapleRed, COLORS.mapleOrange, '#E74C3C', '#F39C12'];
  let svg = '';
  for (let i = 0; i < count; i++) {
    const ox = (i % 2) * 50 * s - 25 * s;
    const oy = Math.floor(i / 2) * 45 * s;
    const rot = i * 30 - 15;
    svg += mapleLeaf(cx + ox, cy + oy, 22 * s, colors[i % colors.length], rot);
  }
  return svg;
}

export function mapleLeaf(cx, cy, size, color, rot = 0) {
  return `
  <g transform="translate(${cx},${cy}) rotate(${rot})">
    <path d="M 0 -${size} L ${size * 0.3} -${size * 0.3} L ${size} 0 L ${size * 0.3} ${size * 0.3} L 0 ${size} L -${size * 0.3} ${size * 0.3} L -${size} 0 L -${size * 0.3} -${size * 0.3} Z" fill="${color}" stroke="${COLORS.ink}" stroke-width="2"/>
    <line x1="0" y1="-${size}" x2="0" y2="${size}" stroke="${COLORS.ink}" stroke-width="1.5"/>
  </g>`;
}

export function raven(x, y, scale = 1) {
  const s = scale;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <ellipse cx="0" cy="10" rx="28" ry="20" fill="${COLORS.black}" stroke="${COLORS.ink}" stroke-width="2"/>
    <ellipse cx="22" cy="0" rx="14" ry="11" fill="${COLORS.black}" stroke="${COLORS.ink}" stroke-width="2"/>
    <circle cx="30" cy="-3" r="3.5" fill="${COLORS.white}"/>
    <circle cx="31" cy="-3" r="1.5" fill="${COLORS.ink}"/>
    <path d="M 32 0 L 40 2" stroke="${COLORS.ink}" stroke-width="2" stroke-linecap="round"/>
    <path d="M -15 5 Q -30 -5 -25 -20 Q -10 -10 -5 0" fill="${COLORS.black}" stroke="${COLORS.ink}" stroke-width="1.5"/>
    <path d="M -20 25 L -25 40 M 5 25 L 5 40" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

export function willowBranch(cx, cy, scale = 1) {
  const s = scale;
  let svg = `<line x1="${cx}" y1="${cy - 80 * s}" x2="${cx}" y2="${cy + 60 * s}" stroke="${COLORS.brown}" stroke-width="5" stroke-linecap="round"/>`;
  for (let i = 0; i < 8; i++) {
    const oy = cy - 60 * s + i * 18 * s;
    const len = 40 * s + (i % 3) * 15 * s;
    const dir = i % 2 === 0 ? 1 : -1;
    svg += `<path d="M ${cx} ${oy} Q ${cx + dir * len * 0.5} ${oy + 15 * s} ${cx + dir * len} ${oy + 25 * s}" fill="none" stroke="${COLORS.green}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  return svg;
}

export function paulowniaLeaves(cx, cy, scale = 1, count = 3) {
  const s = scale;
  let svg = '';
  for (let i = 0; i < count; i++) {
    const ox = (i - (count - 1) / 2) * 40 * s;
    svg += `<path d="M ${cx + ox} ${cy + 40 * s} Q ${cx + ox - 20 * s} ${cy} ${cx + ox} ${cy - 50 * s} Q ${cx + ox + 20 * s} ${cy} ${cx + ox} ${cy + 40 * s}" fill="${COLORS.green}" stroke="${COLORS.ink}" stroke-width="2"/>`;
    svg += `<line x1="${cx + ox}" y1="${cy - 50 * s}" x2="${cx + ox}" y2="${cy + 40 * s}" stroke="${COLORS.greenLight}" stroke-width="1.5"/>`;
  }
  return svg;
}

export function rainLines() {
  let svg = '';
  for (let i = 0; i < 25; i++) {
    const x = 80 + (i * 17) % 460;
    const y = 200 + (i * 23) % 500;
    svg += `<line x1="${x}" y1="${y}" x2="${x - 8}" y2="${y + 25}" stroke="${COLORS.blue}" stroke-width="2" opacity="0.5"/>`;
  }
  return svg;
}

export function branchLine(x1, y1, x2, y2, width = 4) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${COLORS.brown}" stroke-width="${width}" stroke-linecap="round"/>`;
}

export function wrapSvg(inner) {
  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}
