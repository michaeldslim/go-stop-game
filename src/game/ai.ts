import type { MatgoGameState, PlayerIndex } from '../types/gameState';
import { getCardById } from '../cards/getCardById';
import { calculateScore } from './scoring';
import { findTableMatchIndices } from './tableCards';
import {
  canDeclareBomb,
  canDeclareShake,
  declareBomb,
  declareShake,
} from './specialMoves';
import { chooseTableForPending, playBomb, playHandCard } from './turnEngine';

const TYPE_PRIORITY: Record<string, number> = {
  bright: 4,
  animal: 3,
  ribbon: 2,
  junk: 1,
};

function pickHandCard(state: MatgoGameState): string {
  const hand = state.players[state.currentPlayerIndex].hand;
  const difficulty = state.aiDifficulty;

  const matchers = hand.filter((cardId) => {
    const month = getCardById(cardId).month;
    return findTableMatchIndices(state.table, month).length > 0;
  });

  if (matchers.length === 0) {
    if (difficulty === 'beginner' && Math.random() < 0.15) {
      return hand[Math.floor(Math.random() * hand.length)];
    }
    return hand[0];
  }

  if (difficulty === 'beginner') {
    return matchers[0];
  }

  const scored = matchers.map((cardId) => {
    const card = getCardById(cardId);
    const month = card.month;
    const matchCount = findTableMatchIndices(state.table, month).length;
    const typeWeight = TYPE_PRIORITY[card.type] ?? 0;
    const matchBonus = matchCount === 1 ? 2 : 0;
    return { cardId, weight: typeWeight + matchBonus };
  });

  scored.sort((left, right) => right.weight - left.weight);

  if (difficulty === 'intermediate') {
    return scored[0].cardId;
  }

  if (difficulty === 'advanced' && scored.length > 1 && Math.random() < 0.2) {
    return scored[1].cardId;
  }

  return scored[0].cardId;
}

function pickTableIndex(state: MatgoGameState, matchIndices: number[]): number {
  if (matchIndices.length === 0) {
    throw new Error('No table matches to choose from');
  }

  const difficulty = state.aiDifficulty;

  if (difficulty === 'beginner') {
    return matchIndices[Math.floor(Math.random() * matchIndices.length)];
  }

  if (difficulty === 'intermediate') {
    return matchIndices[0];
  }

  const sorted = [...matchIndices].sort((left, right) => {
    const leftCard = getCardById(state.table[left].cardId);
    const rightCard = getCardById(state.table[right].cardId);
    const leftType = TYPE_PRIORITY[leftCard.type] ?? 0;
    const rightType = TYPE_PRIORITY[rightCard.type] ?? 0;
    if (leftType !== rightType) {
      return leftType - rightType;
    }

    const leftSize = state.table[left].stackedCardIds?.length ?? 0;
    const rightSize = state.table[right].stackedCardIds?.length ?? 0;
    return leftSize - rightSize;
  });

  if (difficulty === 'expert') {
    return sorted[sorted.length - 1];
  }

  return sorted[0];
}

function maybeDeclareSpecial(state: MatgoGameState): MatgoGameState {
  const playerIndex = state.currentPlayerIndex;
  const difficulty = state.aiDifficulty;

  if (difficulty === 'beginner') {
    return state;
  }

  if (canDeclareBomb(state, playerIndex) && (difficulty === 'expert' || difficulty === 'advanced')) {
    return declareBomb(state, playerIndex);
  }

  if (canDeclareShake(state, playerIndex) && difficulty === 'expert') {
    return declareShake(state, playerIndex);
  }

  return state;
}

export function runAiTurn(state: MatgoGameState): MatgoGameState {
  if (state.phase !== 'playing' || state.players[state.currentPlayerIndex].isHuman) {
    return state;
  }

  if (state.pendingAction) {
    if (
      state.pendingAction.type === 'chooseHandMatch' ||
      state.pendingAction.type === 'chooseFlipMatch'
    ) {
      const tableIndex = pickTableIndex(state, state.pendingAction.matchIndices);
      return chooseTableForPending(state, tableIndex);
    }

    return state;
  }

  let next = maybeDeclareSpecial(state);

  if (canDeclareBomb(next, next.currentPlayerIndex) && next.players[next.currentPlayerIndex].scoreMultiplier > 1) {
    return playBomb(next);
  }

  const handCardId = pickHandCard(next);
  next = playHandCard(next, handCardId);

  if (next.pendingAction?.type === 'chooseHandMatch') {
    const tableIndex = pickTableIndex(next, next.pendingAction.matchIndices);
    next = chooseTableForPending(next, tableIndex);
  }

  return next;
}

export function estimateAiYakuStrength(state: MatgoGameState, playerIndex: PlayerIndex): number {
  const player = state.players[playerIndex];
  return calculateScore(
    player.collected,
    player.goCount,
    player.bonusPi,
    player.flexCardRoles,
  ).total;
}
