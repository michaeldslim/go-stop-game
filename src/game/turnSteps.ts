import type { CardId, MatgoGameState, TableCard } from '../types/gameState';
import { addTableCard, expandTableCard, findTableMatchIndices, getCardMonth } from './tableCards';
import { cloneGameState } from './gameUtils';

export type TurnStep =
  | { type: 'playHand'; cardId: CardId; playerIndex: number; targetTableIndex: number }
  | { type: 'collect'; cardIds: CardId[]; playerIndex: number; sourceTableIndex?: number }
  | { type: 'flipDeck'; cardId: CardId; targetTableIndex: number }
  | { type: 'stack'; flippedCardId: CardId; targetTableIndex: number }
  | { type: 'pause'; durationMs: number };

export const STEP_TIMING = {
  playHand: 250,
  flipDeck: 300,
  collect: 350,
  stack: 200,
  pauseAfterPlay: 150,
  stagger: 50,
} as const;

function findRemovedFromHand(beforeHand: CardId[], afterHand: CardId[]): CardId | null {
  for (const cardId of beforeHand) {
    if (!afterHand.includes(cardId)) {
      return cardId;
    }
  }
  return null;
}

function tableCardIds(state: MatgoGameState): CardId[] {
  return state.table.flatMap((tableCard) => expandTableCard(tableCard));
}

function findFlippedCard(before: MatgoGameState, after: MatgoGameState): CardId | null {
  if (after.deck.length >= before.deck.length) {
    return null;
  }
  return after.lastFlippedCardId;
}

function newlyCollected(before: MatgoGameState, after: MatgoGameState, playerIndex: number): CardId[] {
  const beforeSet = new Set(before.players[playerIndex].collected);
  return after.players[playerIndex].collected.filter((cardId) => !beforeSet.has(cardId));
}

function isStackPuk(before: MatgoGameState, after: MatgoGameState, flippedCardId: CardId | null): boolean {
  if (!flippedCardId) {
    return false;
  }

  const afterCollected = new Set(after.players[before.currentPlayerIndex].collected);
  if (afterCollected.has(flippedCardId)) {
    return false;
  }

  return after.statusMessage.includes('뻑') || after.statusMessage.toLowerCase().includes('stack');
}

function handMatchCollectIds(
  playedCard: CardId,
  collected: CardId[],
  beforeTable: CardId[],
  afterTable: CardId[],
): CardId[] {
  if (!collected.includes(playedCard)) {
    return [];
  }

  const removedFromTable = beforeTable.filter((cardId) => !afterTable.includes(cardId));
  return [playedCard, ...removedFromTable.filter((cardId) => collected.includes(cardId))];
}

function findCollectedPileIndex(table: TableCard[], collectedIds: CardId[]): number | null {
  for (let index = 0; index < table.length; index += 1) {
    const ids = expandTableCard(table[index]);
    if (ids.some((cardId) => collectedIds.includes(cardId))) {
      return index;
    }
  }
  return null;
}

function reconstructTableAfterHandPlay(
  before: MatgoGameState,
  playedCard: CardId,
  handCollect: CardId[],
): TableCard[] {
  if (handCollect.length === 0) {
    return addTableCard(before.table, playedCard);
  }

  const collectedSet = new Set(handCollect);
  return before.table
    .map((tableCard) => {
      const remaining = expandTableCard(tableCard).filter((cardId) => !collectedSet.has(cardId));
      if (remaining.length === 0) {
        return null;
      }
      if (remaining.length === 1) {
        return { cardId: remaining[0] };
      }
      return {
        cardId: remaining[remaining.length - 1],
        stackedCardIds: remaining.slice(0, -1),
      };
    })
    .filter((tableCard): tableCard is TableCard => tableCard !== null);
}

function resolveHandPlayTargetIndex(before: MatgoGameState, handCollect: CardId[]): number {
  if (handCollect.length === 0) {
    return before.table.length;
  }

  const matchedIndex = findCollectedPileIndex(before.table, handCollect);
  if (matchedIndex !== null) {
    return matchedIndex;
  }

  const month = handCollect[0] ? getCardMonth(handCollect[0]) : null;
  if (month) {
    const matchIndices = findTableMatchIndices(before.table, month);
    if (matchIndices.length > 0) {
      return matchIndices[0];
    }
  }

  return before.table.length;
}

function resolveFlipDeckTargetIndex(
  tableBeforeFlip: TableCard[],
  flippedCard: CardId,
  flipCollect: CardId[],
  isPuk: boolean,
): number {
  const month = getCardMonth(flippedCard);
  const matchIndices = findTableMatchIndices(tableBeforeFlip, month);

  if (flipCollect.length > 0) {
    const matchedIndex = findCollectedPileIndex(tableBeforeFlip, flipCollect);
    if (matchedIndex !== null) {
      return matchedIndex;
    }
    return matchIndices[0] ?? tableBeforeFlip.length;
  }

  if (isPuk && matchIndices.length > 0) {
    return matchIndices[0];
  }

  if (matchIndices.length === 0) {
    return tableBeforeFlip.length;
  }

  return matchIndices[0];
}

/**
 * Derive animation steps from committed before/after game states.
 * Returns empty when waiting for human table choice mid-turn.
 */
export function buildTurnSteps(before: MatgoGameState, after: MatgoGameState): TurnStep[] {
  if (
    after.pendingAction &&
    !before.pendingAction &&
    (after.pendingAction.type === 'chooseHandMatch' ||
      after.pendingAction.type === 'chooseFlipMatch')
  ) {
    return [];
  }

  const playerIndex = before.pendingAction?.playerIndex ?? before.currentPlayerIndex;
  const playedCard =
    findRemovedFromHand(before.players[playerIndex].hand, after.players[playerIndex].hand) ??
    (before.pendingAction?.type === 'chooseHandMatch' ? before.pendingAction.handCardId : null);

  if (!playedCard) {
    return [];
  }

  const steps: TurnStep[] = [];
  const allCollected = newlyCollected(before, after, playerIndex);
  const beforeTable = tableCardIds(before);
  const afterTable = tableCardIds(after);
  const flippedCard = findFlippedCard(before, after);

  const handCollect = handMatchCollectIds(playedCard, allCollected, beforeTable, afterTable);
  const flipCollect = flippedCard
    ? allCollected.filter((cardId) => !handCollect.includes(cardId))
    : [];
  const tableBeforeFlip = reconstructTableAfterHandPlay(before, playedCard, handCollect);
  const stackPuk = flippedCard ? isStackPuk(before, after, flippedCard) : false;
  const handPlayTargetIndex = resolveHandPlayTargetIndex(before, handCollect);

  steps.push({
    type: 'playHand',
    cardId: playedCard,
    playerIndex,
    targetTableIndex: handPlayTargetIndex,
  });

  if (handCollect.length > 0) {
    steps.push({
      type: 'collect',
      cardIds: handCollect,
      playerIndex,
      sourceTableIndex: handPlayTargetIndex,
    });
  } else {
    steps.push({ type: 'pause', durationMs: STEP_TIMING.pauseAfterPlay });
  }

  if (flippedCard) {
    const flipTargetIndex = resolveFlipDeckTargetIndex(
      tableBeforeFlip,
      flippedCard,
      flipCollect,
      stackPuk,
    );

    steps.push({
      type: 'flipDeck',
      cardId: flippedCard,
      targetTableIndex: flipTargetIndex,
    });

    if (flipCollect.length > 0) {
      steps.push({
        type: 'collect',
        cardIds: flipCollect,
        playerIndex,
        sourceTableIndex: flipTargetIndex,
      });
    } else if (stackPuk) {
      steps.push({
        type: 'stack',
        flippedCardId: flippedCard,
        targetTableIndex: flipTargetIndex,
      });
    }
  }

  return steps;
}

/** Apply a single visual step to a display copy (for progressive board updates). */
export function applyVisualStep(state: MatgoGameState, step: TurnStep): MatgoGameState {
  const next = cloneGameState(state);

  switch (step.type) {
    case 'playHand': {
      const player = next.players[step.playerIndex];
      next.players[step.playerIndex] = {
        ...player,
        hand: player.hand.filter((cardId) => cardId !== step.cardId),
      };
      if (
        !next.players[step.playerIndex].collected.includes(step.cardId) &&
        step.targetTableIndex >= next.table.length
      ) {
        next.table = addTableCard(next.table, step.cardId);
      }
      return next;
    }
    case 'collect': {
      const player = next.players[step.playerIndex];
      const collectedSet = new Set(player.collected);
      const toCollect = step.cardIds.filter((cardId) => !collectedSet.has(cardId));
      next.players[step.playerIndex] = {
        ...player,
        collected: [...player.collected, ...toCollect],
      };
      next.table = next.table
        .map((tableCard) => {
          const expanded = expandTableCard(tableCard);
          const remaining = expanded.filter((cardId) => !step.cardIds.includes(cardId));
          if (remaining.length === 0) {
            return null;
          }
          if (remaining.length === 1) {
            return { cardId: remaining[0] };
          }
          return {
            cardId: remaining[remaining.length - 1],
            stackedCardIds: remaining.slice(0, -1),
          };
        })
        .filter((tableCard): tableCard is NonNullable<typeof tableCard> => tableCard !== null);
      return next;
    }
    case 'flipDeck': {
      next.deck = next.deck.slice(1);
      next.lastFlippedCardId = step.cardId;
      if (!next.players[next.currentPlayerIndex].collected.includes(step.cardId)) {
        const onTable = tableCardIds(next).includes(step.cardId);
        if (!onTable && step.targetTableIndex >= next.table.length) {
          next.table = addTableCard(next.table, step.cardId);
        }
      }
      return next;
    }
    case 'stack': {
      next.lastFlippedCardId = step.flippedCardId;
      return next;
    }
    case 'pause':
      return next;
    default:
      return next;
  }
}
