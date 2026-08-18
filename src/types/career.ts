import type { AiDifficulty } from './game';
import type { FinishReason } from './gameState';

export type CareerRank =
  | 'intern'
  | 'staff'
  | 'assistant'
  | 'manager'
  | 'deputy'
  | 'director'
  | 'executive'
  | 'ceo';

export interface CareerState {
  rank: CareerRank;
  promotionWins: number;
  highestRankAchieved: CareerRank;
}

export interface MatchResultInput {
  won: boolean;
  aiDifficulty: AiDifficulty;
  finishReason?: FinishReason;
}

export interface PromotionResult {
  nextState: CareerState;
  promoted: CareerRank | null;
  lost: boolean;
  noProgressDifficulty: boolean;
  unchanged: boolean;
}

export interface PromotionTarget {
  requiredWins: number;
  minAiDifficulty?: AiDifficulty;
  nextRank: CareerRank;
}
