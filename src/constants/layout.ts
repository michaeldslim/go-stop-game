import type { CardSize } from '../types/hwatu';

/** Card display dimensions in points (hanafuda ~1.6:1 aspect) */
export const CARD_DIMENSIONS: Record<CardSize, { width: number; height: number }> = {
  hand: { width: 68, height: 110 },
  table: { width: 60, height: 97 },
  small: { width: 44, height: 71 },
  /** Compact pile thumbnails for captured cards */
  pile: { width: 32, height: 52 },
  /** Tiny face-down opponent hand cards */
  mini: { width: 22, height: 36 },
};

export const CARD_BORDER_RADIUS = 6;
