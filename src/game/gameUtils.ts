import type { MatgoGameState, PlayerIndex, PlayerState } from '../types/gameState';

export function clonePlayerState(player: PlayerState): PlayerState {
  return {
    ...player,
    hand: [...player.hand],
    collected: [...player.collected],
    flexCardRoles: { ...player.flexCardRoles },
  };
}

export function cloneGameState(state: MatgoGameState): MatgoGameState {
  return {
    ...state,
    players: state.players.map(clonePlayerState),
    table: state.table.map((tableCard) => ({
      ...tableCard,
      stackedCardIds: tableCard.stackedCardIds ? [...tableCard.stackedCardIds] : undefined,
    })),
    deck: [...state.deck],
    pendingAction: state.pendingAction ? { ...state.pendingAction } : null,
    soundEffects: [...state.soundEffects],
    turnSpecialMoves: [...state.turnSpecialMoves],
  };
}

export function getCurrentPlayer(state: MatgoGameState): PlayerState {
  return state.players[state.currentPlayerIndex];
}

export function nextPlayerIndex(state: MatgoGameState, fromIndex: PlayerIndex): PlayerIndex {
  return (fromIndex + 1) % state.playerCount;
}

export function opponentIndices(state: MatgoGameState, playerIndex: PlayerIndex): PlayerIndex[] {
  return state.players.map((_, index) => index).filter((index) => index !== playerIndex);
}

export function allHandsEmpty(state: MatgoGameState): boolean {
  return state.players.every((player) => player.hand.length === 0);
}
