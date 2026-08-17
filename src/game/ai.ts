import type { MatgoGameState } from '../types/gameState';
import { getCardById } from '../cards/getCardById';
import { findTableMatchIndices } from './tableCards';
import { getBestHandCard, getBestTableIndex } from './hint';
import {
  canDeclareBomb,
  canDeclareShake,
  declareBomb,
  declareShake,
} from './specialMoves';
import { chooseTableForPending, playBomb, playHandCard } from './turnEngine';

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

  const best = getBestHandCard(state);
  if (!best) {
    return hand[0];
  }

  if (difficulty === 'intermediate') {
    return best;
  }

  if (difficulty === 'advanced' && matchers.length > 1 && Math.random() < 0.2) {
    const alternate = matchers.find((cardId) => cardId !== best);
    if (alternate) {
      return alternate;
    }
  }

  return best;
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

  const best = getBestTableIndex(state, matchIndices);
  if (best === null) {
    return matchIndices[0];
  }

  if (difficulty === 'expert') {
    return best;
  }

  const sorted = [...matchIndices].sort((left, right) => left - right);
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
