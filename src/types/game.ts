export type AiDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type GameMode = 'matgo' | 'gostop' | 'hwatu';
export type AppLanguage = 'en' | 'ko';

export interface AppSettings {
  language: AppLanguage;
  defaultAiDifficulty: AiDifficulty;
  defaultGameMode: GameMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface GameSetupConfig {
  mode: GameMode;
  aiDifficulty: AiDifficulty;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  defaultAiDifficulty: 'intermediate',
  defaultGameMode: 'matgo',
  soundEnabled: true,
  hapticsEnabled: true,
};
