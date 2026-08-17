import type { AiDifficulty, AppLanguage, GameMode, GameSpeed } from '../types/game';

export interface LocalizedLabel {
  en: string;
  ko: string;
}

export interface AiDifficultyOption {
  value: AiDifficulty;
  labels: LocalizedLabel;
  description: LocalizedLabel;
}

export interface GameModeOption {
  value: GameMode;
  labels: LocalizedLabel;
  description: LocalizedLabel;
  /** Not playable until Phase 3 */
  comingSoon?: boolean;
}

export interface LanguageOption {
  value: AppLanguage;
  labels: LocalizedLabel;
}

export interface GameSpeedOption {
  value: GameSpeed;
  labels: LocalizedLabel;
  description: LocalizedLabel;
}

export const GAME_SPEED_OPTIONS: GameSpeedOption[] = [
  {
    value: 'slow',
    labels: { en: 'Slow', ko: '느림' },
    description: {
      en: 'More time to follow each move',
      ko: '한 수씩 여유 있게',
    },
  },
  {
    value: 'medium',
    labels: { en: 'Medium', ko: '보통' },
    description: {
      en: 'Balanced pace',
      ko: '적당한 속도',
    },
  },
  {
    value: 'fast',
    labels: { en: 'Fast', ko: '빠름' },
    description: {
      en: 'Snappy animations',
      ko: '빠른 진행',
    },
  },
];

export const AI_DIFFICULTY_OPTIONS: AiDifficultyOption[] = [
  {
    value: 'beginner',
    labels: { en: 'Beginner', ko: '초보' },
    description: {
      en: 'Obvious matches, calls Stop early',
      ko: '쉬운 매칭, 빠른 스톱',
    },
  },
  {
    value: 'intermediate',
    labels: { en: 'Intermediate', ko: '중급' },
    description: {
      en: 'Solid play and reasonable Go/Stop',
      ko: '안정적인 플레이와 고/스톱',
    },
  },
  {
    value: 'advanced',
    labels: { en: 'Advanced', ko: '고급' },
    description: {
      en: 'Chases yaku and avoids cheap matches',
      ko: '역 추적, 싼 것 회피',
    },
  },
  {
    value: 'expert',
    labels: { en: 'Expert', ko: '전문가' },
    description: {
      en: 'Strong lookahead and optimal Go/Stop',
      ko: '선읽기, 최적 고/스톱',
    },
  },
];

export const GAME_MODE_OPTIONS: GameModeOption[] = [
  {
    value: 'matgo',
    labels: { en: 'Matgo', ko: '맞고' },
    description: {
      en: 'You vs 1 AI · 10 hand · 8 table · 7 pts',
      ko: '1대1 · 손패 10 · 바닥 8 · 7점',
    },
  },
  {
    value: 'gostop',
    labels: { en: 'Go-Stop', ko: '고스톱' },
    description: {
      en: 'You vs 2 AI · 7 hand · 6 table · 3 pts',
      ko: '1대2 · 손패 7 · 바닥 6 · 3점',
    },
  },
  {
    value: 'hwatu',
    labels: { en: 'Hwatu Simple', ko: '화투 심플' },
    description: {
      en: 'No Go/Stop · per-card scoring',
      ko: '고/스톱 없음 · 카드별 점수',
    },
  },
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', labels: { en: 'English', ko: 'English' } },
  { value: 'ko', labels: { en: '한국어', ko: '한국어' } },
];

export function getLocalizedText(language: AppLanguage, labels: LocalizedLabel): string {
  return labels[language];
}

export function getAiDifficultyOption(difficulty: AiDifficulty): AiDifficultyOption {
  return AI_DIFFICULTY_OPTIONS.find((option) => option.value === difficulty) ?? AI_DIFFICULTY_OPTIONS[1];
}

export function getGameModeOption(mode: GameMode): GameModeOption {
  return GAME_MODE_OPTIONS.find((option) => option.value === mode) ?? GAME_MODE_OPTIONS[0];
}
