import { compareDealerCards } from './cardRank';
import {
  GOSTOP_PLAYER_COUNT,
  MATGO_PLAYER_COUNT,
} from './constants';
import { drawCards } from './deck';
import type { CardId } from '../types/gameState';

export interface DealResult {
  hands: CardId[][];
  table: CardId[];
  deck: CardId[];
  dealerIndex: number;
}

/**
 * Choose dealer by drawing one card per player; highest month/type wins.
 * Drawn cards are removed from the deck.
 */
export function chooseDealer(
  deck: CardId[],
  playerCount: number = MATGO_PLAYER_COUNT,
): { dealerIndex: number; remainingDeck: CardId[] } {
  const { drawn, remaining } = drawCards(deck, playerCount);

  let dealerIndex = 0;
  for (let index = 1; index < drawn.length; index += 1) {
    if (compareDealerCards(drawn[index], drawn[dealerIndex]) > 0) {
      dealerIndex = index;
    }
  }

  return { dealerIndex, remainingDeck: remaining };
}

function dealInOrder(
  shuffledDeck: CardId[],
  dealerIndex: number,
  playerCount: number,
  playerRounds: number[],
  tableRounds: number[],
): DealResult {
  const handTotal = playerRounds.reduce((sum, rounds) => sum + rounds * playerCount, 0);
  const tableTotal = tableRounds.reduce((sum, rounds) => sum + rounds, 0);
  const requiredCards = handTotal + tableTotal;

  if (shuffledDeck.length < requiredCards) {
    throw new Error(`Need ${requiredCards} cards to deal, got ${shuffledDeck.length}`);
  }

  const hands: CardId[][] = Array.from({ length: playerCount }, () => []);
  const table: CardId[] = [];
  let index = 0;

  const dealOrder: number[] = [];
  for (let step = 0; step < playerCount; step += 1) {
    dealOrder.push((dealerIndex + 1 + step) % playerCount);
  }

  const dealToPlayer = (playerIndex: number) => {
    hands[playerIndex].push(shuffledDeck[index]);
    index += 1;
  };

  const dealToTable = () => {
    table.push(shuffledDeck[index]);
    index += 1;
  };

  const batches = Math.max(playerRounds.length, tableRounds.length);
  for (let batch = 0; batch < batches; batch += 1) {
    const playerRoundCount = playerRounds[batch] ?? 0;
    const tableRoundCount = tableRounds[batch] ?? 0;

    for (let round = 0; round < playerRoundCount; round += 1) {
      for (const playerIndex of dealOrder) {
        dealToPlayer(playerIndex);
      }
    }

    for (let round = 0; round < tableRoundCount; round += 1) {
      dealToTable();
    }
  }

  return {
    hands,
    table,
    deck: shuffledDeck.slice(index),
    dealerIndex,
  };
}

/**
 * Deal 맞고 2P: 10 hand each, 8 table.
 * Pattern: 5 each → 4 table → 5 each → 4 table.
 */
export function dealMatgo2P(shuffledDeck: CardId[], dealerIndex: number): DealResult {
  return dealInOrder(shuffledDeck, dealerIndex, MATGO_PLAYER_COUNT, [5, 5], [4, 4]);
}

/**
 * Deal 고스톱 3P: 7 hand each, 6 table.
 * Pattern: 3 each → 2 table → 3 each → 2 table → 1 each → 2 table.
 */
export function dealGostop3P(shuffledDeck: CardId[], dealerIndex: number): DealResult {
  return dealInOrder(
    shuffledDeck,
    dealerIndex,
    GOSTOP_PLAYER_COUNT,
    [3, 3, 1],
    [2, 2, 2],
  );
}

/** Hwatu simple uses same deal as matgo 2P */
export function dealHwatu2P(shuffledDeck: CardId[], dealerIndex: number): DealResult {
  return dealMatgo2P(shuffledDeck, dealerIndex);
}
