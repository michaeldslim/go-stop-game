import { getCardById } from '../cards/getCardById';
import type { Month } from '../types/hwatu';
import type { CardId, TableCard } from '../types/gameState';

export function expandTableCard(tableCard: TableCard): CardId[] {
  const stacked = tableCard.stackedCardIds ?? [];
  return [...stacked, tableCard.cardId];
}

export function tableCardSize(tableCard: TableCard): number {
  return expandTableCard(tableCard).length;
}

export function isSingleCardPile(tableCard: TableCard): boolean {
  return tableCardSize(tableCard) === 1;
}

export function getCardMonth(cardId: CardId): Month {
  return getCardById(cardId).month;
}

export function findTableMatchIndices(table: TableCard[], month: Month): number[] {
  return table
    .map((tableCard, index) => ({ tableCard, index }))
    .filter(({ tableCard }) => getCardMonth(tableCard.cardId) === month)
    .map(({ index }) => index);
}

export function removeTableCards(table: TableCard[], indices: number[]): TableCard[] {
  const removeSet = new Set(indices);
  return table.filter((_, index) => !removeSet.has(index));
}

export function createStackedTableCard(cardIds: CardId[]): TableCard {
  if (cardIds.length === 0) {
    throw new Error('Cannot create an empty table stack');
  }

  return {
    cardId: cardIds[cardIds.length - 1],
    stackedCardIds: cardIds.length > 1 ? cardIds.slice(0, -1) : undefined,
  };
}

export function addTableCard(table: TableCard[], cardId: CardId): TableCard[] {
  return [...table, { cardId }];
}
