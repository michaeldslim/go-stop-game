import { CARD_CATALOG } from '../cards/cardCatalog';
import type { CardId } from '../types/gameState';

export type Rng = () => number;

export const defaultRng: Rng = Math.random;

export function createDeck(): CardId[] {
  return CARD_CATALOG.map((card) => card.id);
}

/** Fisher–Yates shuffle (in-place copy). */
export function shuffleDeck(deck: CardId[], rng: Rng = defaultRng): CardId[] {
  const shuffled = [...deck];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function drawCards(deck: CardId[], count: number): { drawn: CardId[]; remaining: CardId[] } {
  if (count > deck.length) {
    throw new Error(`Cannot draw ${count} cards from deck of ${deck.length}`);
  }

  return {
    drawn: deck.slice(0, count),
    remaining: deck.slice(count),
  };
}
