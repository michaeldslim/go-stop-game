import type { AiDifficulty } from '../types/game';
import type { CareerRank, PromotionTarget } from '../types/career';

export const CAREER_RANK_ORDER: CareerRank[] = [
  'intern',
  'staff',
  'assistant',
  'manager',
  'deputy',
  'director',
  'executive',
  'ceo',
];

const DIFFICULTY_ORDER: Record<AiDifficulty, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
  expert: 3,
};

const PROMOTION_RULES: Partial<
  Record<CareerRank, { requiredWins: number; minAiDifficulty?: AiDifficulty }>
> = {
  intern: { requiredWins: 3 },
  staff: { requiredWins: 5 },
  assistant: { requiredWins: 7 },
  manager: { requiredWins: 10 },
  deputy: { requiredWins: 5, minAiDifficulty: 'intermediate' },
  director: { requiredWins: 7, minAiDifficulty: 'advanced' },
  executive: { requiredWins: 5, minAiDifficulty: 'expert' },
};

export function getNextRank(rank: CareerRank): CareerRank | null {
  const index = CAREER_RANK_ORDER.indexOf(rank);
  if (index < 0 || index >= CAREER_RANK_ORDER.length - 1) {
    return null;
  }
  return CAREER_RANK_ORDER[index + 1];
}

export function compareAiDifficulty(current: AiDifficulty, minimum: AiDifficulty): boolean {
  return DIFFICULTY_ORDER[current] >= DIFFICULTY_ORDER[minimum];
}

export function getPromotionTarget(rank: CareerRank): PromotionTarget | null {
  const nextRank = getNextRank(rank);
  if (!nextRank) {
    return null;
  }

  const rule = PROMOTION_RULES[rank];
  if (!rule) {
    return null;
  }

  return {
    nextRank,
    requiredWins: rule.requiredWins,
    minAiDifficulty: rule.minAiDifficulty,
  };
}

export function rankIndex(rank: CareerRank): number {
  return CAREER_RANK_ORDER.indexOf(rank);
}

export function isHigherRank(left: CareerRank, right: CareerRank): boolean {
  return rankIndex(left) > rankIndex(right);
}
