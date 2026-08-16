import type { MatgoGameState } from '../types/gameState';

export function cloneGameState(state: MatgoGameState): MatgoGameState {
  return {
    ...state,
    players: [
      {
        ...state.players[0],
        hand: [...state.players[0].hand],
        collected: [...state.players[0].collected],
      },
      {
        ...state.players[1],
        hand: [...state.players[1].hand],
        collected: [...state.players[1].collected],
      },
    ],
    table: state.table.map((tableCard) => ({
      ...tableCard,
      stackedCardIds: tableCard.stackedCardIds ? [...tableCard.stackedCardIds] : undefined,
    })),
    deck: [...state.deck],
    pendingAction: state.pendingAction ? { ...state.pendingAction } : null,
    soundEffects: [],
  };
}

export function getCurrentPlayer(state: MatgoGameState) {
  return state.players[state.currentPlayerIndex];
}

export function opponentIndex(playerIndex: 0 | 1): 0 | 1 {
  return playerIndex === 0 ? 1 : 0;
}

export function isGamePlayable(state: MatgoGameState): boolean {
  return state.phase === 'playing' && state.pendingAction === null;
}
