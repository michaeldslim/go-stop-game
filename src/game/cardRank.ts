import { getCardById } from '../cards/getCardById';
import type { CardId } from '../types/gameState';

const TYPE_RANK: Record<string, number> = {
  bright: 4,
  animal: 3,
  ribbon: 2,
  junk: 1,
};

/** Higher value wins dealer draw (month, then type). */
export function getDealerCardRank(cardId: CardId): number {
  const card = getCardById(cardId);
  const typeRank = TYPE_RANK[card.type] ?? 0;
  return card.month * 10 + typeRank;
}

export function compareDealerCards(leftId: CardId, rightId: CardId): number {
  return getDealerCardRank(leftId) - getDealerCardRank(rightId);
}
