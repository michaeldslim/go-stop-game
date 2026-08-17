import type { CardId, SepCupRole } from '../types/gameState';
import { countYakuProgress } from './scoring';

export type YakuType = 'godori' | 'hongdan' | 'cheongdan' | 'chodan';

export const YAKU_TYPES: YakuType[] = ['godori', 'hongdan', 'cheongdan', 'chodan'];

/** Minimum cards to complete each yaku (고도리 / 홍단 / 청단 / 초단). */
export const YAKU_COMPLETE_COUNT = 3;

export function detectCompletedYaku(
  before: ReturnType<typeof countYakuProgress>,
  after: ReturnType<typeof countYakuProgress>,
): YakuType[] {
  return YAKU_TYPES.filter(
    (type) =>
      before[type] < YAKU_COMPLETE_COUNT && after[type] >= YAKU_COMPLETE_COUNT,
  );
}

export function detectHumanYakuCompletion(
  beforeCollected: CardId[],
  afterCollected: CardId[],
  beforeFlex: Partial<Record<CardId, SepCupRole>> = {},
  afterFlex: Partial<Record<CardId, SepCupRole>> = {},
): YakuType[] {
  return detectCompletedYaku(
    countYakuProgress(beforeCollected, beforeFlex),
    countYakuProgress(afterCollected, afterFlex),
  );
}
