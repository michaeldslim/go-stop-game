import type { CardSize } from '../types/hwatu';

/** Card display dimensions in points (hanafuda ~1.6:1 aspect) */
export const CARD_DIMENSIONS: Record<CardSize, { width: number; height: number }> = {
  /** Min 88pt for comfortable touch targets */
  hand: { width: 72, height: 116 },
  /** Min 72pt so card text stays readable */
  table: { width: 64, height: 103 },
  small: { width: 44, height: 71 },
  /** Compact pile thumbnails for captured cards */
  pile: { width: 32, height: 52 },
};

export const CARD_BORDER_RADIUS = 6;
