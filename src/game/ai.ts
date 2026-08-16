import type { MatgoGameState } from '../types/gameState';
import { getCardById } from '../cards/getCardById';
import { findTableMatchIndices } from './tableCards';
import { chooseTableForPending, playHandCard } from './turnEngine';

function pickHandCard(state: MatgoGameState): string {
  const hand = state.players[state.currentPlayerIndex].hand;

  const matchingFirst = hand.find((cardId) => {
    const month = getCardById(cardId).month;
    return findTableMatchIndices(state.table, month).length > 0;
  });

  if (matchingFirst) {
    return matchingFirst;
  }

  return hand[0];
}

function pickTableIndex(state: MatgoGameState, matchIndices: number[]): number {
  if (matchIndices.length === 0) {
    throw new Error('No table matches to choose from');
  }

  const difficulty = state.aiDifficulty;

  if (difficulty === 'beginner' || difficulty === 'intermediate') {
    return matchIndices[0];
  }

  // Prefer capturing a smaller pile when multiple singles exist.
  const sorted = [...matchIndices].sort((left, right) => {
    const leftSize = state.table[left].stackedCardIds?.length ?? 0;
    const rightSize = state.table[right].stackedCardIds?.length ?? 0;
    return leftSize - rightSize;
  });

  return sorted[0];
}

export function runAiTurn(state: MatgoGameState): MatgoGameState {
  if (state.phase !== 'playing' || getCurrentPlayerIsHuman(state)) {
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

  const handCardId = pickHandCard(state);
  let next = playHandCard(state, handCardId);

  if (next.pendingAction?.type === 'chooseHandMatch') {
    const tableIndex = pickTableIndex(next, next.pendingAction.matchIndices);
    next = chooseTableForPending(next, tableIndex);
  }

  return next;
}

function getCurrentPlayerIsHuman(state: MatgoGameState): boolean {
  return state.players[state.currentPlayerIndex].isHuman;
}
