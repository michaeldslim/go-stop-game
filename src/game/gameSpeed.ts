import type { GameSpeed } from '../types/game';

export interface GameSpeedTimings {
  playHand: number;
  flipDeck: number;
  collect: number;
  stack: number;
  pauseAfterPlay: number;
  pauseBeforeCollect: number;
  aiTurnDelayMs: number;
  specialMoveFirstPromptMs: number;
}

export const GAME_SPEED_TIMINGS: Record<GameSpeed, GameSpeedTimings> = {
  slow: {
    playHand: 250,
    flipDeck: 300,
    collect: 350,
    stack: 200,
    pauseAfterPlay: 200,
    pauseBeforeCollect: 500,
    aiTurnDelayMs: 1200,
    specialMoveFirstPromptMs: 1500,
  },
  medium: {
    playHand: 250,
    flipDeck: 300,
    collect: 350,
    stack: 200,
    pauseAfterPlay: 175,
    pauseBeforeCollect: 250,
    aiTurnDelayMs: 950,
    specialMoveFirstPromptMs: 750,
  },
  fast: {
    playHand: 250,
    flipDeck: 300,
    collect: 350,
    stack: 200,
    pauseAfterPlay: 150,
    pauseBeforeCollect: 0,
    aiTurnDelayMs: 700,
    specialMoveFirstPromptMs: 0,
  },
};

export function getGameSpeedTimings(speed: GameSpeed): GameSpeedTimings {
  return GAME_SPEED_TIMINGS[speed] ?? GAME_SPEED_TIMINGS.slow;
}
