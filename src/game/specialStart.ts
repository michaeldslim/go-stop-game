import { getCardById } from '../cards/getCardById';
import type { CardId, MatgoGameState, PlayerIndex, TableCard } from '../types/gameState';
import { createStackedTableCard } from './tableCards';

export type SpecialStartResult =
  | { type: 'play' }
  | { type: 'redeal'; reason: string }
  | { type: 'stackTable'; month: number; tableIndices: [number, number, number] }
  | { type: 'autoWin'; winnerIndex: PlayerIndex; month: number }
  | { type: 'draw'; month: number };

function monthCounts(cardIds: CardId[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const cardId of cardIds) {
    const month = getCardById(cardId).month;
    counts.set(month, (counts.get(month) ?? 0) + 1);
  }
  return counts;
}

function findFourOfMonth(hand: CardId[]): number | null {
  const counts = monthCounts(hand);
  for (const [month, count] of counts) {
    if (count === 4) {
      return month;
    }
  }
  return null;
}

function tableMonthCounts(table: TableCard[]): Map<number, number[]> {
  const byMonth = new Map<number, number[]>();
  table.forEach((tableCard, index) => {
    const month = getCardById(tableCard.cardId).month;
    const indices = byMonth.get(month) ?? [];
    indices.push(index);
    byMonth.set(month, indices);
  });
  return byMonth;
}

export function checkSpecialStart(state: MatgoGameState): SpecialStartResult {
  const fourMonthWinners: PlayerIndex[] = [];
  let fourMonth: number | null = null;

  for (let index = 0; index < state.players.length; index += 1) {
    const month = findFourOfMonth(state.players[index].hand);
    if (month !== null) {
      fourMonthWinners.push(index);
      fourMonth = month;
    }
  }

  if (fourMonthWinners.length >= 2) {
    return { type: 'draw', month: fourMonth ?? 0 };
  }

  if (fourMonthWinners.length === 1) {
    return { type: 'autoWin', winnerIndex: fourMonthWinners[0], month: fourMonth ?? 0 };
  }

  for (const [month, indices] of tableMonthCounts(state.table)) {
    if (indices.length === 4) {
      return { type: 'redeal', reason: `Four ${month}월 cards on table` };
    }

    if (indices.length === 3) {
      return {
        type: 'stackTable',
        month,
        tableIndices: [indices[0], indices[1], indices[2]],
      };
    }
  }

  return { type: 'play' };
}

export function applyTableStack(
  table: TableCard[],
  indices: [number, number, number],
): TableCard[] {
  const sorted = [...indices].sort((left, right) => right - left);
  const cardIds = sorted
    .map((index) => table[index])
    .reverse()
    .flatMap((tableCard) => [tableCard.cardId, ...(tableCard.stackedCardIds ?? [])]);

  const stacked = createStackedTableCard(cardIds);
  const remaining = table.filter((_, index) => !indices.includes(index));
  return [...remaining, stacked];
}
