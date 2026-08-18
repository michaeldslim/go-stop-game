import type { AvatarId } from '../constants/avatars';
import { DEFAULT_AI_AVATAR_ID, DEFAULT_PLAYER_AVATAR_ID } from '../constants/avatars';

export type AiDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type GameMode = 'matgo' | 'gostop' | 'hwatu';
export type AppLanguage = 'en' | 'ko';
export type GameSpeed = 'slow' | 'medium' | 'fast';

export const SOUND_VOLUME_MIN = 1;
export const SOUND_VOLUME_MAX = 10;

export function playerVolumeFromSetting(level: number): number {
  if (typeof level !== 'number' || Number.isNaN(level)) {
    return 1;
  }

  const clamped = Math.max(SOUND_VOLUME_MIN, Math.min(SOUND_VOLUME_MAX, Math.round(level)));
  const t = (clamped - SOUND_VOLUME_MIN) / (SOUND_VOLUME_MAX - SOUND_VOLUME_MIN);
  // Quadratic curve: level 1 ≈ 5%, level 10 = 100%
  return 0.05 + t * t * 0.95;
}

export interface AppSettings {
  language: AppLanguage;
  defaultAiDifficulty: AiDifficulty;
  defaultGameMode: GameMode;
  gameSpeed: GameSpeed;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;
  careerModeEnabled: boolean;
  playerAvatarId: AvatarId;
  aiAvatarId: AvatarId;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'ko',
  defaultAiDifficulty: 'intermediate',
  defaultGameMode: 'matgo',
  gameSpeed: 'slow',
  hintsEnabled: true,
  soundEnabled: true,
  soundVolume: 6,
  hapticsEnabled: true,
  careerModeEnabled: true,
  playerAvatarId: DEFAULT_PLAYER_AVATAR_ID,
  aiAvatarId: DEFAULT_AI_AVATAR_ID,
};
