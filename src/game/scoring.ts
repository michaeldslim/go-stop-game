import { getCardById } from '../cards/getCardById';
import type { CardId, SepCupRole } from '../types/gameState';

export interface ScoreBreakdown {
  bright: number;
  animal: number;
  ribbon: number;
  junk: number;
  godori: number;
  hongdan: number;
  cheongdan: number;
  chodan: number;
  baseTotal: number;
  animalMultiplier: number;
  goBonus: number;
  goMultiplier: number;
  total: number;
}

function resolveFlexRole(
  cardId: CardId,
  flexCardRoles: Partial<Record<CardId, SepCupRole>>,
): SepCupRole | null {
  if (cardId === 'sep-animal-double') {
    return flexCardRoles[cardId] ?? 'animal';
  }
  return null;
}

function countByType(
  collected: CardId[],
  bonusPi: number,
  flexCardRoles: Partial<Record<CardId, SepCupRole>>,
) {
  let brights = 0;
  let animals = 0;
  let ribbons = 0;
  let pi = bonusPi;
  let hasRain = false;
  let godoriCount = 0;
  let hongdanCount = 0;
  let cheongdanCount = 0;
  let chodanCount = 0;

  for (const cardId of collected) {
    const card = getCardById(cardId);
    const flexRole = resolveFlexRole(cardId, flexCardRoles);

    if (flexRole === 'junk') {
      pi += card.piValue;
      continue;
    }

    switch (card.type) {
      case 'bright':
        brights += 1;
        if (card.flags?.rainBright) {
          hasRain = true;
        }
        break;
      case 'animal':
        animals += 1;
        break;
      case 'ribbon':
        if (!card.flags?.excludeRibbonCount) {
          ribbons += 1;
        }
        break;
      case 'junk':
        pi += card.piValue;
        break;
      default:
        break;
    }

    if (card.flags?.godori) {
      godoriCount += 1;
    }
    if (card.flags?.hongdan) {
      hongdanCount += 1;
    }
    if (card.flags?.cheongdan) {
      cheongdanCount += 1;
    }
    if (card.flags?.chodan) {
      chodanCount += 1;
    }
  }

  return {
    brights,
    animals,
    ribbons,
    pi,
    hasRain,
    godoriCount,
    hongdanCount,
    cheongdanCount,
    chodanCount,
  };
}

function scoreBrights(brights: number, hasRain: boolean): number {
  if (brights >= 5) {
    return 15;
  }
  if (brights === 4) {
    return 4;
  }
  if (brights === 3) {
    return hasRain ? 2 : 3;
  }
  return 0;
}

function scoreAnimals(animals: number): number {
  if (animals < 5) {
    return 0;
  }
  return 1 + (animals - 5);
}

function scoreRibbons(ribbons: number): number {
  if (ribbons < 5) {
    return 0;
  }
  return 1 + (ribbons - 5);
}

function scoreJunk(pi: number): number {
  if (pi < 10) {
    return 0;
  }
  return 1 + (pi - 10);
}

function scoreGodori(godoriCount: number): number {
  return godoriCount >= 3 ? 5 : 0;
}

function scoreHongdan(count: number): number {
  return count >= 3 ? 3 : 0;
}

function scoreCheongdan(count: number): number {
  return count >= 3 ? 3 : 0;
}

function scoreChodan(count: number): number {
  return count >= 3 ? 3 : 0;
}

function applyGoModifiers(baseTotal: number, goCount: number): { goBonus: number; goMultiplier: number; total: number } {
  let goBonus = 0;
  let goMultiplier = 1;

  if (goCount >= 1) {
    goBonus += 1;
  }
  if (goCount >= 2) {
    goBonus += 1;
  }
  if (goCount >= 3) {
    goMultiplier = 2 ** (goCount - 2);
  }

  const total = (baseTotal + goBonus) * goMultiplier;
  return { goBonus, goMultiplier, total };
}

export interface CollectedCounts {
  brights: number;
  animals: number;
  ribbons: number;
  pi: number;
}

/** Raw card counts (and total pi including bonus) for display — not scoring points. */
export function countCollectedCards(
  collected: CardId[],
  bonusPi = 0,
  flexCardRoles: Partial<Record<CardId, SepCupRole>> = {},
): CollectedCounts {
  const counts = countByType(collected, bonusPi, flexCardRoles);
  return {
    brights: counts.brights,
    animals: counts.animals,
    ribbons: counts.ribbons,
    pi: counts.pi,
  };
}

export function calculateScore(
  collected: CardId[],
  goCount = 0,
  bonusPi = 0,
  flexCardRoles: Partial<Record<CardId, SepCupRole>> = {},
): ScoreBreakdown {
  const counts = countByType(collected, bonusPi, flexCardRoles);

  const bright = scoreBrights(counts.brights, counts.hasRain);
  const animal = scoreAnimals(counts.animals);
  const ribbon = scoreRibbons(counts.ribbons);
  const junk = scoreJunk(counts.pi);
  const godori = scoreGodori(counts.godoriCount);
  const hongdan = scoreHongdan(counts.hongdanCount);
  const cheongdan = scoreCheongdan(counts.cheongdanCount);
  const chodan = scoreChodan(counts.chodanCount);

  const baseTotal = bright + animal + ribbon + junk + godori + hongdan + cheongdan + chodan;
  const animalMultiplier = counts.animals >= 7 ? 2 : 1;
  const baseWithAnimalMultiplier = baseTotal * animalMultiplier;

  const { goBonus, goMultiplier, total } = applyGoModifiers(baseWithAnimalMultiplier, goCount);

  return {
    bright,
    animal,
    ribbon,
    junk,
    godori,
    hongdan,
    cheongdan,
    chodan,
    baseTotal,
    animalMultiplier,
    goBonus,
    goMultiplier,
    total,
  };
}

/** Hwatu simple — no Go/Stop, per-card scoring */
export function calculateHwatuSimpleScore(
  collected: CardId[],
  flexCardRoles: Partial<Record<CardId, SepCupRole>> = {},
): number {
  let brightPts = 0;
  let animalPts = 0;
  let ribbonPts = 0;
  let piCount = 0;

  for (const cardId of collected) {
    const card = getCardById(cardId);
    const flexRole = resolveFlexRole(cardId, flexCardRoles);

    if (flexRole === 'junk') {
      piCount += card.piValue;
      continue;
    }

    switch (card.type) {
      case 'bright':
        brightPts += 20;
        break;
      case 'animal':
        animalPts += 10;
        break;
      case 'ribbon':
        ribbonPts += 5;
        break;
      case 'junk':
        piCount += card.piValue;
        break;
      default:
        break;
    }
  }

  const junkPts = piCount >= 10 ? 5 + (piCount - 10) : 0;
  return brightPts + animalPts + ribbonPts + junkPts;
}

export function syncPlayerScore(
  collected: CardId[],
  goCount: number,
  bonusPi = 0,
  flexCardRoles: Partial<Record<CardId, SepCupRole>> = {},
  mode: 'matgo' | 'gostop' | 'hwatu' = 'matgo',
): number {
  if (mode === 'hwatu') {
    return calculateHwatuSimpleScore(collected, flexCardRoles);
  }
  return calculateScore(collected, goCount, bonusPi, flexCardRoles).total;
}
