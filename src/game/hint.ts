import { getCardById } from '../cards/getCardById';
import { detectCheapMatch } from './specialMoves';
import { countYakuProgress, syncPlayerScore } from './scoring';
import { getCurrentPlayer } from './gameUtils';
import {
  expandTableCard,
  findTableMatchIndices,
  getCardMonth,
  isSingleCardPile,
} from './tableCards';
import { YAKU_TYPES, type YakuType } from './yaku';
import type { CardId, MatgoGameState } from '../types/gameState';
import type { YakuProgress } from './scoring';

const TYPE_PRIORITY: Record<string, number> = {
  bright: 4,
  animal: 3,
  ribbon: 2,
  junk: 1,
};

const YAKU_COMPLETE_VALUE: Record<YakuType, number> = {
  godori: 5,
  hongdan: 3,
  cheongdan: 3,
  chodan: 3,
};

/** Weight for partial yaku progress not yet reflected in score. */
const YAKU_PROGRESS_WEIGHT = 0.45;

export interface TurnHint {
  handCardId: CardId | null;
  tableIndex: number | null;
}

function shouldPromptHandMatch(table: MatgoGameState['table'], matchIndices: number[]): boolean {
  if (matchIndices.length <= 1) {
    return false;
  }

  if (
    matchIndices.length === 2 &&
    matchIndices.every((index) => isSingleCardPile(table[index]))
  ) {
    return false;
  }

  return true;
}

function simulateHandCollection(
  state: MatgoGameState,
  handCardId: CardId,
  matchIndices: number[],
  tableIndex?: number,
): CardId[] {
  if (matchIndices.length === 0) {
    return [];
  }

  const sameMonthSingles = matchIndices.filter((index) => isSingleCardPile(state.table[index]));
  if (sameMonthSingles.length >= 2) {
    const collected: CardId[] = [handCardId];
    for (const index of sameMonthSingles) {
      collected.push(...expandTableCard(state.table[index]));
    }
    return collected;
  }

  const chosenIndex = tableIndex ?? matchIndices[0];
  if (!matchIndices.includes(chosenIndex)) {
    return [];
  }

  return [handCardId, ...expandTableCard(state.table[chosenIndex])];
}

function computePartialYakuBonus(before: YakuProgress, after: YakuProgress): number {
  let bonus = 0;

  for (const type of YAKU_TYPES) {
    if (after[type] <= before[type] || before[type] >= 3) {
      continue;
    }

    const cappedAfter = Math.min(after[type], 3);
    const delta = cappedAfter - before[type];
    const completeValue = YAKU_COMPLETE_VALUE[type];

    if (after[type] >= 3) {
      continue;
    }

    const proximity = cappedAfter / 3;
    bonus += delta * completeValue * proximity * YAKU_PROGRESS_WEIGHT;
  }

  return bonus;
}

function computeSpecialBonusPi(
  state: MatgoGameState,
  matchIndices: number[],
  tableIndex: number | undefined,
  collectedIds: CardId[],
): number {
  const opponentBonus = state.playerCount - 1;
  let bonus = 0;

  const sameMonthSingles = matchIndices.filter((index) => isSingleCardPile(state.table[index]));
  if (sameMonthSingles.length >= 2) {
    return opponentBonus;
  }

  const chosenIndex = tableIndex ?? matchIndices[0];
  if (detectCheapMatch(state, chosenIndex, matchIndices)) {
    bonus += opponentBonus;
  }

  if (collectedIds.length >= 3) {
    bonus += opponentBonus;
  }

  return bonus;
}

function evaluateCollection(
  state: MatgoGameState,
  playerIndex: number,
  collectedIds: CardId[],
  bonusPiDelta = 0,
): number {
  const player = state.players[playerIndex];
  const beforeScore = syncPlayerScore(
    player.collected,
    player.goCount,
    player.bonusPi,
    player.flexCardRoles,
    state.mode,
  );
  const beforeYaku = countYakuProgress(player.collected, player.flexCardRoles);

  const afterCollected = [...player.collected, ...collectedIds];
  const afterBonusPi = player.bonusPi + bonusPiDelta;
  const afterScore = syncPlayerScore(
    afterCollected,
    player.goCount,
    afterBonusPi,
    player.flexCardRoles,
    state.mode,
  );
  const afterYaku = countYakuProgress(afterCollected, player.flexCardRoles);

  const scoreDelta = afterScore - beforeScore;
  const yakuBonus = computePartialYakuBonus(beforeYaku, afterYaku);

  return scoreDelta + yakuBonus;
}

function evaluateDumpCard(state: MatgoGameState, playerIndex: number, handCardId: CardId): number {
  const card = getCardById(handCardId);
  const player = state.players[playerIndex];
  const yaku = countYakuProgress(player.collected, player.flexCardRoles);

  let score = -(TYPE_PRIORITY[card.type] ?? 0);

  if (card.flags?.godori && yaku.godori < 3) {
    score -= 2;
  }
  if (card.flags?.hongdan && yaku.hongdan < 3) {
    score -= 1.5;
  }
  if (card.flags?.cheongdan && yaku.cheongdan < 3) {
    score -= 1.5;
  }
  if (card.flags?.chodan && yaku.chodan < 3) {
    score -= 1.5;
  }

  return score;
}

function evaluateHandPlay(
  state: MatgoGameState,
  playerIndex: number,
  handCardId: CardId,
  tableIndex?: number,
): number {
  const month = getCardMonth(handCardId);
  const matchIndices = findTableMatchIndices(state.table, month);

  if (matchIndices.length === 0) {
    return evaluateDumpCard(state, playerIndex, handCardId);
  }

  const collectedIds = simulateHandCollection(state, handCardId, matchIndices, tableIndex);
  const bonusPiDelta = computeSpecialBonusPi(state, matchIndices, tableIndex, collectedIds);

  return evaluateCollection(state, playerIndex, collectedIds, bonusPiDelta);
}

function evaluateFlipChoice(
  state: MatgoGameState,
  playerIndex: number,
  flippedCardId: CardId,
  tableIndex: number,
): number {
  const collectedIds = [flippedCardId, ...expandTableCard(state.table[tableIndex])];
  let bonusPiDelta = 0;

  if (collectedIds.length >= 3) {
    bonusPiDelta += state.playerCount - 1;
  }

  return evaluateCollection(state, playerIndex, collectedIds, bonusPiDelta);
}

function handTableChoices(
  state: MatgoGameState,
  matchIndices: number[],
): Array<number | undefined> {
  const sameMonthSingles = matchIndices.filter((index) => isSingleCardPile(state.table[index]));
  if (sameMonthSingles.length >= 2) {
    return [undefined];
  }

  if (shouldPromptHandMatch(state.table, matchIndices)) {
    return matchIndices;
  }

  return [matchIndices[0]];
}

export function getBestHandCard(state: MatgoGameState, playerIndex?: number): CardId | null {
  const index = playerIndex ?? state.currentPlayerIndex;
  const hand = state.players[index]?.hand ?? [];
  if (hand.length === 0) {
    return null;
  }

  let bestCard: CardId | null = null;
  let bestScore = -Infinity;

  for (const handCardId of hand) {
    const month = getCardMonth(handCardId);
    const matchIndices = findTableMatchIndices(state.table, month);
    const choices = handTableChoices(state, matchIndices);

    for (const tableIndex of choices) {
      const score = evaluateHandPlay(state, index, handCardId, tableIndex);
      if (score > bestScore) {
        bestScore = score;
        bestCard = handCardId;
      }
    }
  }

  return bestCard;
}

export function getBestTableIndex(state: MatgoGameState, matchIndices: number[]): number | null {
  if (matchIndices.length === 0) {
    return null;
  }

  if (matchIndices.length === 1) {
    return matchIndices[0];
  }

  const pending = state.pendingAction;
  const playerIndex = pending?.playerIndex ?? state.currentPlayerIndex;

  let bestIndex = matchIndices[0];
  let bestScore = -Infinity;

  for (const tableIndex of matchIndices) {
    let score: number;

    if (pending?.type === 'chooseHandMatch') {
      score = evaluateHandPlay(state, playerIndex, pending.handCardId, tableIndex);
    } else if (pending?.type === 'chooseFlipMatch') {
      score = evaluateFlipChoice(state, playerIndex, pending.flippedCardId, tableIndex);
    } else {
      const collectedIds = expandTableCard(state.table[tableIndex]);
      score = evaluateCollection(state, playerIndex, collectedIds);
    }

    if (score > bestScore) {
      bestScore = score;
      bestIndex = tableIndex;
    }
  }

  return bestIndex;
}

export function getTurnHint(state: MatgoGameState): TurnHint | null {
  if (state.phase !== 'playing') {
    return null;
  }

  const player = getCurrentPlayer(state);
  if (!player.isHuman) {
    return null;
  }

  if (
    state.pendingAction?.type === 'chooseHandMatch' ||
    state.pendingAction?.type === 'chooseFlipMatch'
  ) {
    return {
      handCardId:
        state.pendingAction.type === 'chooseHandMatch'
          ? state.pendingAction.handCardId
          : null,
      tableIndex: getBestTableIndex(state, state.pendingAction.matchIndices),
    };
  }

  if (state.pendingAction) {
    return null;
  }

  return {
    handCardId: getBestHandCard(state),
    tableIndex: null,
  };
}
