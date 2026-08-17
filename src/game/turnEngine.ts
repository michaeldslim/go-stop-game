import type { CardId, GameSoundEffect, MatgoGameState, PendingAction, PlayerState, SepCupRole } from '../types/gameState';
import { finishHandsEmpty, maybePromptGoStop } from './goStop';
import { cloneGameState, getCurrentPlayer, nextPlayerIndex as getNextPlayerIndex } from './gameUtils';
import {
  addTableCard,
  createStackedTableCard,
  expandTableCard,
  findTableMatchIndices,
  getCardMonth,
  isSingleCardPile,
  removeTableCards,
} from './tableCards';
import {
  applySpecialMoveReward,
  detectCheapMatch,
  getBombCardIds,
} from './specialMoves';

const SEP_CUP_ID = 'sep-junk-double';

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

function removeManyFromHand(player: PlayerState, handCardIds: CardId[]): PlayerState {
  const removeSet = new Set(handCardIds);
  return {
    ...player,
    hand: player.hand.filter((cardId) => !removeSet.has(cardId)),
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

function clearTurnFlags(state: MatgoGameState): MatgoGameState {
  return { ...state, turnSpecialMoves: [], lastFlippedCardId: null };
}

function needsSepCupPrompt(state: MatgoGameState, playerIndex: number, cardIds: CardId[]): boolean {
  if (state.mode === 'hwatu') {
    return false;
  }
  const player = state.players[playerIndex];
  if (player.flexCardRoles[SEP_CUP_ID]) {
    return false;
  }
  return cardIds.includes(SEP_CUP_ID) && !player.collected.includes(SEP_CUP_ID);
}

function maybePromptSepCup(
  state: MatgoGameState,
  playerIndex: number,
  collectedIds: CardId[],
): MatgoGameState {
  if (!needsSepCupPrompt(state, playerIndex, collectedIds)) {
    return state;
  }

  return withPending(state, {
    type: 'chooseSepCupRole',
    playerIndex,
    cardId: SEP_CUP_ID,
  });
}

function endTurn(state: MatgoGameState, playerIndex: number): MatgoGameState {
  let next = state;

  if (next.table.length === 0) {
    next = applySpecialMoveReward(next, playerIndex, 'sweep');
    next = setStatus(next, '싹쓸이 — table swept');
  }

  if (next.mode === 'hwatu') {
    const afterHands = finishHandsEmpty(next);
    if (afterHands.phase === 'finished') {
      return afterHands;
    }
    return advanceTurn(clearTurnFlags(afterHands));
  }

  const afterGoStop = maybePromptGoStop(next, playerIndex);
  if (afterGoStop.phase === 'goStopPrompt' || afterGoStop.phase === 'finished') {
    return afterGoStop;
  }

  return advanceTurn(clearTurnFlags(afterGoStop));
}

function advanceTurn(state: MatgoGameState): MatgoGameState {
  const nextPlayerIndex = getNextPlayerIndex(state, state.currentPlayerIndex);
  const next = finishHandsEmpty({
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
  playerIndex: number,
  tableIndex: number,
  extraCardIds: CardId[] = [],
): MatgoGameState {
  const tableCard = state.table[tableIndex];
  if (!tableCard) {
    throw new Error(`No table card at index ${tableIndex}`);
  }

  const collectedIds = [...extraCardIds, ...expandTableCard(tableCard)];
  const isPukCollect = collectedIds.length >= 3;
  const players = [...state.players];
  players[playerIndex] = collectCards(players[playerIndex], collectedIds);

  let next = appendSound(
    {
      ...state,
      players,
      table: removeTableCards(state.table, [tableIndex]),
    },
    'collect',
  );

  if (isPukCollect) {
    next = applySpecialMoveReward(next, playerIndex, 'puk');
  }

  return maybePromptSepCup(next, playerIndex, collectedIds);
}

function collectFromTableIndices(
  state: MatgoGameState,
  playerIndex: number,
  tableIndices: number[],
  extraCardIds: CardId[] = [],
): MatgoGameState {
  const collectedIds = [...extraCardIds];
  for (const tableIndex of tableIndices) {
    const tableCard = state.table[tableIndex];
    if (tableCard) {
      collectedIds.push(...expandTableCard(tableCard));
    }
  }

  const players = [...state.players];
  players[playerIndex] = collectCards(players[playerIndex], collectedIds);

  let next = appendSound(
    {
      ...state,
      players,
      table: removeTableCards(state.table, tableIndices),
    },
    'collect',
  );

  return maybePromptSepCup(next, playerIndex, collectedIds);
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

  const playerIndex = state.currentPlayerIndex;
  return setStatus(
    {
      ...state,
      table: remainingTable,
      lastFlippedCardId: flippedCardId,
    },
    '뻑 — three cards stacked on the table',
  );
}

interface HandPlayContext {
  handPlayedToTable: boolean;
  handMatched: boolean;
  handMatchIndices: number[];
}

function shouldPromptHandMatch(table: MatgoGameState['table'], matchIndices: number[]): boolean {
  if (matchIndices.length <= 1) {
    return false;
  }

  // 따닥 — two singles on table; all four cards are collected automatically.
  if (
    matchIndices.length === 2 &&
    matchIndices.every((index) => isSingleCardPile(table[index]))
  ) {
    return false;
  }

  return true;
}

function resolveHandPlay(
  state: MatgoGameState,
  playerIndex: number,
  handCardId: CardId,
  tableIndex?: number,
): MatgoGameState {
  const player = state.players[playerIndex];
  if (!player.hand.includes(handCardId)) {
    throw new Error('Selected card is not in hand');
  }

  const month = getCardMonth(handCardId);
  const matchIndices = findTableMatchIndices(state.table, month);

  if (shouldPromptHandMatch(state.table, matchIndices) && tableIndex === undefined) {
    return setStatus(
      {
        ...withPending(state, {
          type: 'chooseHandMatch',
          playerIndex,
          handCardId,
          matchIndices,
        }),
        soundEffects: [],
      },
      'Choose a matching table card',
    );
  }

  let next = cloneGameState(state);
  const players = [...next.players];
  players[playerIndex] = removeFromHand(players[playerIndex], handCardId);
  next = appendSound({ ...next, players, pendingAction: null, turnSpecialMoves: [] }, 'playCard');

  const context: HandPlayContext = {
    handPlayedToTable: false,
    handMatched: false,
    handMatchIndices: matchIndices,
  };

  if (matchIndices.length === 0) {
    next = setStatus(
      { ...next, table: addTableCard(next.table, handCardId) },
      'Played to table',
    );
    context.handPlayedToTable = true;
    return flipDeckCard(next, playerIndex, context);
  }

  const chosenIndex = tableIndex ?? matchIndices[0];
  if (!matchIndices.includes(chosenIndex)) {
    throw new Error('Selected table card is not a valid match');
  }

  if (detectCheapMatch(next, chosenIndex, matchIndices)) {
    next = applySpecialMoveReward(next, playerIndex, 'cheapMatch');
  }

  // Ttadak: two same-month singles on table, collect both with hand play
  const sameMonthSingles = matchIndices.filter((index) => isSingleCardPile(next.table[index]));
  if (sameMonthSingles.length >= 2) {
    next = collectFromTableIndices(next, playerIndex, sameMonthSingles, [handCardId]);
    next = applySpecialMoveReward(next, playerIndex, 'ttadak');
    next = setStatus(next, '따닥 — all four cards collected');
    context.handMatched = true;
    return flipDeckCard(next, playerIndex, context);
  }

  next = collectFromTable(next, playerIndex, chosenIndex, [handCardId]);
  next = setStatus(next, 'Matched from hand');
  context.handMatched = true;
  return flipDeckCard(next, playerIndex, context);
}

function flipDeckCard(
  state: MatgoGameState,
  playerIndex: number,
  context: HandPlayContext,
  flipCount = 1,
): MatgoGameState {
  if (state.deck.length === 0) {
    return endTurn(setStatus(state, 'Deck empty — turn ends'), playerIndex);
  }

  let next = cloneGameState(state);

  for (let flip = 0; flip < flipCount; flip += 1) {
    if (next.deck.length === 0) {
      break;
    }

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
      flipCount > 1 ? 'Bomb flip to table' : 'Flipped to table',
    );

    if (flip < flipCount - 1) {
      continue;
    }
    return endTurn(next, playerIndex);
  }

  if (
    matchIndices.length === 2 &&
    matchIndices.every((index) => isSingleCardPile(next.table[index]))
  ) {
    next = stackPuk(next, flippedCardId, [matchIndices[0], matchIndices[1]]);
    if (flip < flipCount - 1) {
      continue;
    }
    return endTurn(next, playerIndex);
  }

  if (matchIndices.length === 1) {
    next = collectFromTable(next, playerIndex, matchIndices[0], [flippedCardId]);

    if (context.handPlayedToTable && !context.handMatched) {
      next = applySpecialMoveReward(next, playerIndex, 'chok');
      next = setStatus(next, '쪽 — chok match');
    } else {
      next = setStatus(next, flipCount > 1 ? 'Bomb flip match' : 'Matched from flip');
    }

    if (flip < flipCount - 1) {
      continue;
    }
    return endTurn(next, playerIndex);
  }

    if (flip < flipCount - 1) {
      // Rare: multiple flip matches during bomb — take first match
      next = collectFromTable(next, playerIndex, matchIndices[0], [flippedCardId]);
      continue;
    }

    return setStatus(
      withPending(next, {
        type: 'chooseFlipMatch',
        playerIndex,
        flippedCardId,
        matchIndices,
      }),
      'Choose a matching table card for the flip',
    );
  }

  return endTurn(next, playerIndex);
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
  return endTurn(next, pending.playerIndex);
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

export function playBomb(state: MatgoGameState): MatgoGameState {
  if (state.phase !== 'playing' || state.pendingAction) {
    return state;
  }

  const playerIndex = state.currentPlayerIndex;
  const bombCards = getBombCardIds(state, playerIndex);
  if (bombCards.length < 3) {
    return state;
  }

  let next = cloneGameState(state);
  const players = [...next.players];
  players[playerIndex] = {
    ...removeManyFromHand(players[playerIndex], bombCards),
    scoreMultiplier: 2,
  };
  next = {
    ...next,
    players,
    turnSpecialMoves: ['폭탄'],
    statusMessage: '폭탄 — three cards played',
  };

  // Play all three to table (they match the table card month)
  const month = getCardMonth(bombCards[0]);
  const tableMatches = findTableMatchIndices(next.table, month);
  if (tableMatches.length > 0) {
    next = collectFromTableIndices(next, playerIndex, tableMatches, bombCards);
    next = applySpecialMoveReward(next, playerIndex, 'bomb');
  } else {
    for (const cardId of bombCards) {
      next = { ...next, table: addTableCard(next.table, cardId) };
    }
  }

  const context: HandPlayContext = {
    handPlayedToTable: tableMatches.length === 0,
    handMatched: tableMatches.length > 0,
    handMatchIndices: tableMatches,
  };

  return flipDeckCard(next, playerIndex, context, 2);
}

export function chooseSepCupRole(
  state: MatgoGameState,
  role: SepCupRole,
): MatgoGameState {
  const pending = state.pendingAction;
  if (!pending || pending.type !== 'chooseSepCupRole') {
    return state;
  }

  const players = [...state.players];
  const player = players[pending.playerIndex];
  players[pending.playerIndex] = {
    ...player,
    sepCupRole: role,
    flexCardRoles: { ...player.flexCardRoles, [pending.cardId]: role },
  };

  return withPending({ ...state, players }, null);
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

  if (state.pendingAction.type === 'chooseHandMatch' || state.pendingAction.type === 'chooseFlipMatch') {
    return state.pendingAction.matchIndices.includes(tableIndex);
  }

  return false;
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
  if (!state.pendingAction) {
    return false;
  }

  const player = state.players[state.pendingAction.playerIndex];
  if (!player?.isHuman) {
    return false;
  }

  return (
    state.pendingAction.type === 'chooseHandMatch' ||
    state.pendingAction.type === 'chooseFlipMatch'
  );
}

export function getPendingTableChoice(state: MatgoGameState): {
  matchIndices: number[];
  handCardId: CardId | null;
  flippedCardId: CardId | null;
} | null {
  if (!state.pendingAction) {
    return null;
  }

  if (state.pendingAction.type === 'chooseHandMatch') {
    return {
      matchIndices: state.pendingAction.matchIndices,
      handCardId: state.pendingAction.handCardId,
      flippedCardId: null,
    };
  }

  if (state.pendingAction.type === 'chooseFlipMatch') {
    return {
      matchIndices: state.pendingAction.matchIndices,
      handCardId: null,
      flippedCardId: state.pendingAction.flippedCardId,
    };
  }

  return null;
}

export function needsHumanSepCupChoice(state: MatgoGameState): boolean {
  return state.pendingAction?.type === 'chooseSepCupRole' && state.players[state.pendingAction.playerIndex].isHuman;
}

// Re-export for tests
export { flipDeckCard as flipDeckCardForTest };
