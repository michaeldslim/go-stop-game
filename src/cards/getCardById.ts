import { CARD_BY_ID } from '../cards/cardCatalog';
import type { CardDefinition } from '../types/hwatu';
import type { CardId } from '../types/gameState';

export function getCardById(cardId: CardId): CardDefinition {
  const card = CARD_BY_ID[cardId];
  if (!card) {
    throw new Error(`Unknown card id: ${cardId}`);
  }
  return card;
}

export function getCardsByIds(cardIds: CardId[]): CardDefinition[] {
  return cardIds.map(getCardById);
}
