import {
  baseCard,
  brightDisc,
  branchLine,
  bushClover,
  butterfly,
  cherryBlossoms,
  chrysanthemum,
  crane,
  cuckoo,
  deer,
  geese,
  iris,
  mapleLeaves,
  moon,
  paulowniaLeaves,
  peony,
  pineBranch,
  pampasGrass,
  plumBlossoms,
  rainLines,
  ribbonCheongdan,
  ribbonChodan,
  ribbonHongdan,
  raven,
  sakeCup,
  smallBird,
  sparrows,
  boar,
  willowBranch,
  wisteria,
  wrapSvg,
} from './svgHelpers.mjs';

/** Per-card illustration — large, centered art for mobile readability */
export const CARD_ART = {
  // ── January (Pine) ──
  'jan-bright': () => wrapSvg(baseCard(`
    ${brightDisc(430, 180, 80)}
    ${pineBranch(160, 320, 1.5)}
    ${crane(290, 520, 1.5)}
    ${branchLine(180, 720, 420, 760, 6)}
  `)),

  'jan-ribbon': () => wrapSvg(baseCard(`
    ${pineBranch(100, 280, 1.2)}
    ${ribbonHongdan()}
    ${pineBranch(400, 600, 1.0)}
  `)),

  'jan-junk-1': () => wrapSvg(baseCard(`
    ${pineBranch(200, 300, 1.6)}
    ${branchLine(280, 520, 480, 500, 5)}
    <g stroke="#4A7C3F" stroke-width="4" stroke-linecap="round">
      <line x1="280" y1="520" x2="220" y2="460"/><line x1="280" y1="520" x2="340" y2="460"/>
      <line x1="340" y1="510" x2="300" y2="450"/><line x1="340" y1="510" x2="380" y2="450"/>
      <line x1="400" y1="500" x2="360" y2="440"/><line x1="400" y1="500" x2="440" y2="440"/>
      <line x1="460" y1="490" x2="420" y2="430"/><line x1="460" y1="490" x2="500" y2="430"/>
    </g>
  `)),

  'jan-junk-2': () => wrapSvg(baseCard(`
    ${pineBranch(300, 280, 1.5)}
    ${branchLine(200, 600, 400, 580, 5)}
  `)),

  // ── February (Plum) ──
  'feb-animal': () => wrapSvg(baseCard(`
    ${branchLine(120, 380, 480, 340, 6)}
    ${plumBlossoms(200, 320, 4, 1.5)}
    ${plumBlossoms(400, 300, 4, 1.3)}
    ${smallBird(340, 270, 1.6)}
    ${plumBlossoms(260, 420, 3, 1.2)}
    ${plumBlossoms(180, 450, 2, 1.0)}
  `)),

  'feb-ribbon': () => wrapSvg(baseCard(`
    ${plumBlossoms(300, 280, 6, 1.4)}
    ${ribbonHongdan()}
    ${branchLine(150, 480, 450, 500, 5)}
    ${plumBlossoms(200, 520, 3, 1.1)}
  `)),

  'feb-junk-1': () => wrapSvg(baseCard(`
    ${branchLine(180, 340, 420, 320, 6)}
    ${plumBlossoms(260, 300, 5, 1.6)}
    ${plumBlossoms(360, 340, 4, 1.3)}
    ${plumBlossoms(200, 420, 3, 1.1)}
  `)),

  'feb-junk-2': () => wrapSvg(baseCard(`
    ${branchLine(220, 320, 380, 300, 6)}
    ${plumBlossoms(300, 280, 8, 1.7)}
    ${plumBlossoms(220, 420, 4, 1.2)}
  `)),

  // ── March (Cherry) ──
  'mar-bright': () => wrapSvg(baseCard(`
    ${brightDisc(420, 200, 80)}
    ${cherryBlossoms(300, 450, 6, 1.5)}
    ${branchLine(160, 560, 440, 520, 6)}
    ${cherryBlossoms(200, 520, 4, 1.2)}
    ${cherryBlossoms(400, 500, 3, 1.1)}
  `)),

  'mar-ribbon': () => wrapSvg(baseCard(`
    ${cherryBlossoms(300, 300, 7, 1.4)}
    ${ribbonHongdan()}
    ${branchLine(140, 520, 460, 500, 5)}
    ${cherryBlossoms(200, 560, 3, 1.1)}
  `)),

  'mar-junk-1': () => wrapSvg(baseCard(`
    ${branchLine(180, 340, 420, 320, 6)}
    ${cherryBlossoms(300, 300, 6, 1.6)}
    ${cherryBlossoms(200, 420, 4, 1.2)}
    ${cherryBlossoms(400, 400, 3, 1.1)}
  `)),

  'mar-junk-2': () => wrapSvg(baseCard(`
    ${branchLine(220, 320, 380, 300, 6)}
    ${cherryBlossoms(300, 300, 9, 1.8)}
    ${cherryBlossoms(220, 480, 4, 1.2)}
  `)),

  // ── April (Wisteria) ──
  'apr-animal': () => wrapSvg(baseCard(`
    ${wisteria(300, 380, 1.5)}
    ${cuckoo(300, 560, 1.4)}
    ${branchLine(180, 440, 420, 420, 5)}
  `)),

  'apr-ribbon': () => wrapSvg(baseCard(`
    ${wisteria(300, 320, 1.3)}
    ${ribbonCheongdan()}
    ${wisteria(300, 620, 1.1)}
  `)),

  'apr-junk-1': () => wrapSvg(baseCard(`
    ${wisteria(280, 400, 1.6)}
    ${branchLine(180, 580, 420, 560, 5)}
    ${wisteria(200, 500, 1.0)}
  `)),

  'apr-junk-2': () => wrapSvg(baseCard(`
    ${wisteria(300, 380, 1.7)}
    ${wisteria(240, 560, 1.2)}
    ${wisteria(360, 580, 1.1)}
  `)),

  // ── May (Iris) ──
  'may-animal': () => wrapSvg(baseCard(`
    ${iris(300, 500, 1.5)}
    ${sparrows(300, 320, 1.3)}
    ${iris(180, 600, 1.0)}
    ${iris(420, 610, 1.0)}
  `)),

  'may-ribbon': () => wrapSvg(baseCard(`
    ${iris(300, 380, 1.3)}
    ${ribbonCheongdan()}
    ${iris(250, 620, 1.0)}
    ${iris(350, 630, 1.0)}
  `)),

  'may-junk-1': () => wrapSvg(baseCard(`
    ${iris(240, 420, 1.5)}
    ${iris(360, 440, 1.4)}
    ${iris(300, 580, 1.2)}
  `)),

  'may-junk-2': () => wrapSvg(baseCard(`
    ${iris(300, 400, 1.6)}
    ${iris(200, 540, 1.1)}
    ${iris(400, 550, 1.1)}
    ${iris(300, 660, 1.0)}
  `)),

  // ── June (Peony) ──
  'jun-animal': () => wrapSvg(baseCard(`
    ${peony(300, 480, 1.6)}
    ${butterfly(180, 320, 1.3)}
    ${butterfly(420, 340, 1.2, true)}
    ${butterfly(300, 260, 1.0)}
    ${butterfly(240, 400, 0.9, true)}
  `)),

  'jun-ribbon': () => wrapSvg(baseCard(`
    ${peony(300, 340, 1.4)}
    ${ribbonCheongdan()}
    ${peony(300, 620, 1.2)}
  `)),

  'jun-junk-1': () => wrapSvg(baseCard(`
    ${peony(240, 420, 1.5)}
    ${peony(360, 440, 1.4)}
    ${branchLine(180, 580, 420, 560, 5)}
    ${peony(300, 660, 1.1)}
  `)),

  'jun-junk-2': () => wrapSvg(baseCard(`
    ${peony(300, 420, 1.7)}
    ${peony(220, 560, 1.2)}
    ${peony(380, 570, 1.2)}
  `)),

  // ── July (Bush clover) ──
  'jul-animal': () => wrapSvg(baseCard(`
    ${bushClover(300, 380, 1.5)}
    ${boar(300, 580, 1.3)}
    ${bushClover(180, 560, 1.1)}
    ${bushClover(420, 570, 1.1)}
  `)),

  'jul-ribbon': () => wrapSvg(baseCard(`
    ${bushClover(300, 340, 1.3)}
    ${ribbonChodan()}
    ${bushClover(300, 620, 1.1)}
  `)),

  'jul-junk-1': () => wrapSvg(baseCard(`
    ${bushClover(280, 420, 1.6)}
    ${bushClover(360, 460, 1.4)}
    ${branchLine(180, 580, 420, 560, 5)}
    ${bushClover(300, 660, 1.1)}
  `)),

  'jul-junk-2': () => wrapSvg(baseCard(`
    ${bushClover(300, 440, 1.7)}
    ${bushClover(220, 580, 1.2)}
    ${bushClover(380, 590, 1.2)}
  `)),

  // ── August (Pampas) ──
  'aug-animal': () => wrapSvg(baseCard(`
    ${geese(1.0)}
    ${pampasGrass(300, 620, 1.2)}
  `)),

  'aug-bright': () => wrapSvg(baseCard(`
    ${moon(300, 400, 110)}
    ${brightDisc(300, 400, 70)}
    ${pampasGrass(300, 660, 1.1)}
  `)),

  'aug-ribbon': () => wrapSvg(baseCard(`
    ${pampasGrass(300, 380, 1.3)}
    ${ribbonChodan()}
    ${pampasGrass(300, 620, 1.0)}
  `)),

  'aug-junk-1': () => wrapSvg(baseCard(`
    ${pampasGrass(280, 420, 1.6)}
    ${pampasGrass(360, 440, 1.4)}
    ${pampasGrass(220, 580, 1.1)}
    ${pampasGrass(400, 590, 1.1)}
  `)),

  // ── September (Chrysanthemum) ──
  'sep-animal-double': () => wrapSvg(baseCard(`
    ${chrysanthemum(300, 360, 1.5)}
    ${sakeCup(300, 580, 1.6)}
    ${chrysanthemum(180, 480, 1.0)}
    ${chrysanthemum(420, 490, 1.0)}
  `)),

  'sep-ribbon': () => wrapSvg(baseCard(`
    ${chrysanthemum(300, 340, 1.3)}
    ${ribbonChodan()}
    ${chrysanthemum(300, 620, 1.1)}
  `)),

  'sep-junk-1': () => wrapSvg(baseCard(`
    ${chrysanthemum(250, 420, 1.5)}
    ${chrysanthemum(350, 440, 1.4)}
    ${chrysanthemum(300, 580, 1.2)}
    ${chrysanthemum(220, 660, 1.0)}
  `)),

  'sep-junk-2': () => wrapSvg(baseCard(`
    ${chrysanthemum(300, 440, 1.7)}
    ${chrysanthemum(220, 580, 1.2)}
    ${chrysanthemum(380, 590, 1.2)}
  `)),

  // ── October (Maple) ──
  'oct-animal': () => wrapSvg(baseCard(`
    ${branchLine(180, 380, 420, 350, 6)}
    ${mapleLeaves(300, 320, 5, 1.3)}
    ${deer(300, 560, 1.3)}
  `)),

  'oct-junk-1': () => wrapSvg(baseCard(`
    ${mapleLeaves(300, 440, 5, 1.6)}
    ${branchLine(180, 580, 420, 560, 5)}
    ${mapleLeaves(200, 660, 3, 1.1)}
  `)),

  'oct-junk-2': () => wrapSvg(baseCard(`
    ${mapleLeaves(280, 420, 4, 1.5)}
    ${mapleLeaves(360, 500, 4, 1.3)}
    ${mapleLeaves(240, 620, 3, 1.1)}
  `)),

  'oct-junk-3': () => wrapSvg(baseCard(`
    ${mapleLeaves(300, 440, 6, 1.8)}
    ${branchLine(200, 660, 400, 640, 5)}
  `)),

  // ── November (Willow) ──
  'nov-bright': () => wrapSvg(baseCard(`
    ${willowBranch(300, 400, 1.5)}
    ${raven(300, 300, 1.4)}
  `)),

  'nov-junk-1': () => wrapSvg(baseCard(`
    ${willowBranch(280, 400, 1.6)}
    ${willowBranch(360, 430, 1.3)}
    ${willowBranch(220, 580, 1.1)}
  `)),

  'nov-junk-2': () => wrapSvg(baseCard(`
    ${willowBranch(300, 420, 1.7)}
    ${willowBranch(240, 600, 1.2)}
    ${willowBranch(380, 610, 1.1)}
  `)),

  'nov-junk-double': () => wrapSvg(baseCard(`
    ${willowBranch(200, 360, 1.5)}
    ${willowBranch(400, 380, 1.5)}
    <text x="300" y="720" text-anchor="middle" font-family="serif" font-size="42" fill="#8B1A1A" font-weight="bold">쌍피</text>
  `)),

  // ── December (Rain / Paulownia) ──
  'dec-rain': () => wrapSvg(baseCard(`
    ${rainLines()}
    ${brightDisc(420, 200, 75)}
    ${paulowniaLeaves(300, 520, 1.5, 3)}
    ${branchLine(180, 680, 420, 660, 5)}
  `)),

  'dec-junk-1': () => wrapSvg(baseCard(`
    ${paulowniaLeaves(300, 440, 1.6, 3)}
    ${branchLine(180, 580, 420, 560, 5)}
    ${paulowniaLeaves(220, 660, 1.1, 2)}
  `)),

  'dec-junk-2': () => wrapSvg(baseCard(`
    ${paulowniaLeaves(280, 420, 1.5, 2)}
    ${paulowniaLeaves(360, 460, 1.3, 2)}
    ${paulowniaLeaves(300, 620, 1.2, 2)}
  `)),

  'dec-junk-double': () => wrapSvg(baseCard(`
    ${paulowniaLeaves(200, 360, 1.5, 2)}
    ${paulowniaLeaves(400, 380, 1.5, 2)}
    <text x="300" y="720" text-anchor="middle" font-family="serif" font-size="42" fill="#8B1A1A" font-weight="bold">쌍피</text>
  `)),
};
