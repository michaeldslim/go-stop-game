import { compareDealerCards } from './cardRank';
import { MATGO_HAND_SIZE, MATGO_PLAYER_COUNT, MATGO_TABLE_SIZE } from './constants';
import { drawCards } from './deck';
import type { CardId } from '../types/gameState';

export interface MatgoDealResult {
  hands: [CardId[], CardId[]];
  table: CardId[];
  deck: CardId[];
  dealerIndex: 0 | 1;
}

/**
 * Choose dealer by drawing one card per player; highest month/type wins.
 * Drawn cards are removed from the deck.
 */
export function chooseDealer(
  deck: CardId[],
  playerCount: number = MATGO_PLAYER_COUNT,
): { dealerIndex: 0 | 1; remainingDeck: CardId[] } {
  const { drawn, remaining } = drawCards(deck, playerCount);

  let dealerIndex: 0 | 1 = 0;
  for (let index = 1; index < drawn.length; index += 1) {
    if (compareDealerCards(drawn[index], drawn[dealerIndex]) > 0) {
      dealerIndex = index as 0 | 1;
    }
  }

  return { dealerIndex, remainingDeck: remaining };
}

/**
 * Deal 맞고 2P: 10 hand each, 8 table, starting from dealer's right.
 * Pattern: 5 each → 4 table → 5 each → 4 table.
 */
export function dealMatgo2P(shuffledDeck: CardId[], dealerIndex: 0 | 1): MatgoDealResult {
  const requiredCards = MATGO_HAND_SIZE * MATGO_PLAYER_COUNT + MATGO_TABLE_SIZE;
  if (shuffledDeck.length < requiredCards) {
    throw new Error(`Need ${requiredCards} cards to deal matgo, got ${shuffledDeck.length}`);
  }

  const hands: [CardId[], CardId[]] = [[], []];
  const table: CardId[] = [];
  let index = 0;

  const rightOfDealer = ((dealerIndex + 1) % MATGO_PLAYER_COUNT) as 0 | 1;
  const dealOrder: [0 | 1, 0 | 1] = [rightOfDealer, dealerIndex];

  const dealToPlayer = (playerIndex: 0 | 1) => {
    hands[playerIndex].push(shuffledDeck[index]);
    index += 1;
  };

  const dealToTable = () => {
    table.push(shuffledDeck[index]);
    index += 1;
  };

  for (let round = 0; round < 5; round += 1) {
    dealToPlayer(dealOrder[0]);
    dealToPlayer(dealOrder[1]);
  }

  for (let round = 0; round < 4; round += 1) {
    dealToTable();
  }

  for (let round = 0; round < 5; round += 1) {
    dealToPlayer(dealOrder[0]);
    dealToPlayer(dealOrder[1]);
  }

  for (let round = 0; round < 4; round += 1) {
    dealToTable();
  }

  return {
    hands,
    table,
    deck: shuffledDeck.slice(index),
    dealerIndex,
  };
}
