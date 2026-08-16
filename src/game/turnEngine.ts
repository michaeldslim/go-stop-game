import type { CardId, GameSoundEffect, MatgoGameState, PendingAction, PlayerState } from '../types/gameState';
import { cloneGameState, getCurrentPlayer, opponentIndex } from './gameUtils';
import {
  addTableCard,
  createStackedTableCard,
  expandTableCard,
  findTableMatchIndices,
  getCardMonth,
  isSingleCardPile,
  removeTableCards,
} from './tableCards';

function removeFromHand(player: PlayerState, handCardId: CardId): PlayerState {
  const handIndex = player.hand.indexOf(handCardId);
  if (handIndex === -1) {
    throw new Error(`Card ${handCardId} is not in ${player.id} hand`);
  }

  return {
    ...player,
    hand: player.hand.filter((cardId) => cardId !== handCardId),
  };
}

function collectCards(player: PlayerState, cardIds: CardId[]): PlayerState {
  return {
    ...player,
    collected: [...player.collected, ...cardIds],
  };
}

function setStatus(state: MatgoGameState, statusMessage: string): MatgoGameState {
  return { ...state, statusMessage };
}

function withPending(state: MatgoGameState, pendingAction: PendingAction | null): MatgoGameState {
  return { ...state, pendingAction };
}

function appendSound(state: MatgoGameState, effect: GameSoundEffect): MatgoGameState {
  return { ...state, soundEffects: [...state.soundEffects, effect] };
}

function bothHandsEmpty(state: MatgoGameState): boolean {
  return state.players[0].hand.length === 0 && state.players[1].hand.length === 0;
}

function finishIfHandsEmpty(state: MatgoGameState): MatgoGameState {
  if (!bothHandsEmpty(state)) {
    return state;
  }

  return {
    ...state,
    phase: 'finished',
    pendingAction: null,
    statusMessage: 'All cards played — hand complete (scoring in Phase 2)',
  };
}

function advanceTurn(state: MatgoGameState): MatgoGameState {
  const nextPlayerIndex = opponentIndex(state.currentPlayerIndex);
  const next = finishIfHandsEmpty({
    ...state,
    currentPlayerIndex: nextPlayerIndex,
    pendingAction: null,
    lastFlippedCardId: null,
  });

  if (next.phase === 'finished') {
    return next;
  }

  const nextPlayer = next.players[nextPlayerIndex];
  return setStatus(
    next,
    nextPlayer.isHuman ? 'Your turn — play a card' : 'AI is playing…',
  );
}

function collectFromTable(
  state: MatgoGameState,
  playerIndex: 0 | 1,
  tableIndex: number,
  extraCardIds: CardId[] = [],
): MatgoGameState {
  const tableCard = state.table[tableIndex];
  if (!tableCard) {
    throw new Error(`No table card at index ${tableIndex}`);
  }

  const collectedIds = [...extraCardIds, ...expandTableCard(tableCard)];
  const players = [...state.players] as MatgoGameState['players'];
  players[playerIndex] = collectCards(players[playerIndex], collectedIds);

  return appendSound(
    {
      ...state,
      players,
      table: removeTableCards(state.table, [tableIndex]),
    },
    'collect',
  );
}

function stackPuk(
  state: MatgoGameState,
  flippedCardId: CardId,
  matchIndices: [number, number],
): MatgoGameState {
  const [indexA, indexB] = matchIndices;
  const cardA = state.table[indexA];
  const cardB = state.table[indexB];
  const stackedIds = [...expandTableCard(cardA), ...expandTableCard(cardB), flippedCardId];
  const stackedCard = createStackedTableCard(stackedIds);

  const remainingTable = removeTableCards(state.table, [indexA, indexB]);
  remainingTable.push(stackedCard);

  return setStatus(
    {
      ...state,
      table: remainingTable,
      lastFlippedCardId: flippedCardId,
    },
    '뻑 — three cards stacked on the table',
  );
}

function resolveHandPlay(
  state: MatgoGameState,
  playerIndex: 0 | 1,
  handCardId: CardId,
  tableIndex?: number,
): MatgoGameState {
  const player = state.players[playerIndex];
  if (!player.hand.includes(handCardId)) {
    throw new Error('Selected card is not in hand');
  }

  const month = getCardMonth(handCardId);
  const matchIndices = findTableMatchIndices(state.table, month);

  if (matchIndices.length > 1 && tableIndex === undefined) {
    return {
      ...withPending(state, {
        type: 'chooseHandMatch',
        playerIndex,
        handCardId,
        matchIndices,
      }),
      soundEffects: [],
    };
  }

  let next = cloneGameState(state);
  const players = [...next.players] as MatgoGameState['players'];
  players[playerIndex] = removeFromHand(players[playerIndex], handCardId);
  next = appendSound({ ...next, players, pendingAction: null }, 'playCard');

  if (matchIndices.length === 0) {
    next = setStatus(
      { ...next, table: addTableCard(next.table, handCardId) },
      'Played to table',
    );
    return flipDeckCard(next, playerIndex);
  }

  const chosenIndex = tableIndex ?? matchIndices[0];
  if (!matchIndices.includes(chosenIndex)) {
    throw new Error('Selected table card is not a valid match');
  }

  next = collectFromTable(next, playerIndex, chosenIndex, [handCardId]);
  next = setStatus(next, 'Matched from hand');
  return flipDeckCard(next, playerIndex);
}

function flipDeckCard(state: MatgoGameState, playerIndex: 0 | 1): MatgoGameState {
  if (state.deck.length === 0) {
    return advanceTurn(setStatus(state, 'Deck empty — turn ends'));
  }

  let next = cloneGameState(state);
  const flippedCardId = next.deck[0];
  next = appendSound(
    {
      ...next,
      deck: next.deck.slice(1),
      lastFlippedCardId: flippedCardId,
    },
    'flipCard',
  );

  const month = getCardMonth(flippedCardId);
  const matchIndices = findTableMatchIndices(next.table, month);

  if (matchIndices.length === 0) {
    next = setStatus(
      { ...next, table: addTableCard(next.table, flippedCardId) },
      'Flipped to table',
    );
    return advanceTurn(next);
  }

  if (
    matchIndices.length === 2 &&
    matchIndices.every((index) => isSingleCardPile(next.table[index]))
  ) {
    return advanceTurn(stackPuk(next, flippedCardId, [matchIndices[0], matchIndices[1]]));
  }

  if (matchIndices.length === 1) {
    next = collectFromTable(next, playerIndex, matchIndices[0], [flippedCardId]);
    next = setStatus(next, 'Matched from flip');
    return advanceTurn(next);
  }

  return withPending(next, {
    type: 'chooseFlipMatch',
    playerIndex,
    flippedCardId,
    matchIndices,
  });
}

function resolveFlipChoice(state: MatgoGameState, tableIndex: number): MatgoGameState {
  const pending = state.pendingAction;
  if (!pending || pending.type !== 'chooseFlipMatch') {
    throw new Error('No flip match choice is pending');
  }

  if (!pending.matchIndices.includes(tableIndex)) {
    throw new Error('Selected table card is not a valid flip match');
  }

  let next = collectFromTable(state, pending.playerIndex, tableIndex, [pending.flippedCardId]);
  next = setStatus(next, 'Matched from flip');
  next = withPending(next, null);
  return advanceTurn(next);
}

export function playHandCard(
  state: MatgoGameState,
  handCardId: CardId,
  tableIndex?: number,
): MatgoGameState {
  if (state.phase !== 'playing') {
    return state;
  }

  if (state.pendingAction?.type === 'chooseHandMatch') {
    if (tableIndex === undefined) {
      return state;
    }

    const pending = state.pendingAction;
    let next = cloneGameState(state);
    next = withPending(next, null);
    return resolveHandPlay(next, pending.playerIndex, pending.handCardId, tableIndex);
  }

  if (state.pendingAction) {
    return state;
  }

  const playerIndex = state.currentPlayerIndex;
  return resolveHandPlay(state, playerIndex, handCardId, tableIndex);
}

export function chooseTableForPending(state: MatgoGameState, tableIndex: number): MatgoGameState {
  if (state.pendingAction?.type === 'chooseHandMatch') {
    return playHandCard(state, state.pendingAction.handCardId, tableIndex);
  }

  if (state.pendingAction?.type === 'chooseFlipMatch') {
    return resolveFlipChoice(state, tableIndex);
  }

  return state;
}

export function canPlayHandCard(state: MatgoGameState, handCardId: CardId): boolean {
  if (state.phase !== 'playing') {
    return false;
  }

  if (state.pendingAction?.type === 'chooseHandMatch') {
    return state.pendingAction.handCardId === handCardId;
  }

  if (state.pendingAction) {
    return false;
  }

  return getCurrentPlayer(state).hand.includes(handCardId);
}

export function canChooseTableIndex(state: MatgoGameState, tableIndex: number): boolean {
  if (!state.pendingAction) {
    return false;
  }

  return state.pendingAction.matchIndices.includes(tableIndex);
}

export function getPlayableHandCardIds(state: MatgoGameState): CardId[] {
  if (state.phase !== 'playing') {
    return [];
  }

  if (state.pendingAction?.type === 'chooseHandMatch') {
    return [state.pendingAction.handCardId];
  }

  if (state.pendingAction) {
    return [];
  }

  return [...getCurrentPlayer(state).hand];
}

export function isHumanTurn(state: MatgoGameState): boolean {
  return state.phase === 'playing' && getCurrentPlayer(state).isHuman;
}

export function isAiTurn(state: MatgoGameState): boolean {
  return state.phase === 'playing' && !getCurrentPlayer(state).isHuman;
}

export function needsHumanTableChoice(state: MatgoGameState): boolean {
  if (!state.pendingAction || !getCurrentPlayer(state).isHuman) {
    return false;
  }

  return (
    state.pendingAction.type === 'chooseHandMatch' ||
    state.pendingAction.type === 'chooseFlipMatch'
  );
}

// Re-export for tests
export { flipDeckCard as flipDeckCardForTest };
