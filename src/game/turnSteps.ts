import type { CardId, MatgoGameState } from '../types/gameState';
import { expandTableCard } from './tableCards';
import { cloneGameState } from './gameUtils';
import { addTableCard } from './tableCards';

export type TurnStep =
  | { type: 'playHand'; cardId: CardId; playerIndex: number }
  | { type: 'collect'; cardIds: CardId[]; playerIndex: number }
  | { type: 'flipDeck'; cardId: CardId }
  | { type: 'stack'; flippedCardId: CardId }
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

function flipCollectIds(flippedCard: CardId, collected: CardId[]): CardId[] {
  if (!collected.includes(flippedCard)) {
    return [];
  }
  return collected.filter((cardId) => cardId === flippedCard || cardId !== flippedCard);
}

/**
 * Derive animation steps from committed before/after game states.
 * Returns empty when waiting for human table choice mid-turn.
 */
export function buildTurnSteps(before: MatgoGameState, after: MatgoGameState): TurnStep[] {
  if (after.pendingAction?.type === 'chooseHandMatch' && !before.pendingAction) {
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

  steps.push({ type: 'playHand', cardId: playedCard, playerIndex });

  if (handCollect.length > 0) {
    steps.push({ type: 'collect', cardIds: handCollect, playerIndex });
  } else {
    steps.push({ type: 'pause', durationMs: STEP_TIMING.pauseAfterPlay });
  }

  if (flippedCard) {
    steps.push({ type: 'flipDeck', cardId: flippedCard });

    if (flipCollect.length > 0) {
      steps.push({ type: 'collect', cardIds: flipCollect, playerIndex });
    } else if (isStackPuk(before, after, flippedCard)) {
      steps.push({ type: 'stack', flippedCardId: flippedCard });
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
      if (!next.players[step.playerIndex].collected.includes(step.cardId)) {
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
        if (!onTable) {
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

export function soundForStep(step: TurnStep): 'playCard' | 'flipCard' | 'collect' | null {
  switch (step.type) {
    case 'playHand':
      return 'playCard';
    case 'flipDeck':
      return 'flipCard';
    case 'collect':
      return 'collect';
    default:
      return null;
  }
}
