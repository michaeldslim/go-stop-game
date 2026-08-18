import { AI_DIFFICULTY_OPTIONS, getLocalizedText } from '../constants/gameOptions';
import type { TranslationKey } from '../i18n/translations';
import type { AppLanguage } from '../types/game';
import type { CareerRank, CareerState, PromotionResult } from '../types/career';
import { getPromotionTarget } from './careerRules';

export const CAREER_RANK_KEYS: Record<CareerRank, TranslationKey> = {
  intern: 'career.rank.intern',
  staff: 'career.rank.staff',
  assistant: 'career.rank.assistant',
  manager: 'career.rank.manager',
  deputy: 'career.rank.deputy',
  director: 'career.rank.director',
  executive: 'career.rank.executive',
  ceo: 'career.rank.ceo',
};

export function careerRankKey(rank: CareerRank): TranslationKey {
  return CAREER_RANK_KEYS[rank];
}

export function isMaxCareerRank(state: CareerState): boolean {
  return getPromotionTarget(state.rank) === null;
}

type TranslateFn = (key: TranslationKey, params?: Record<string, string | number>) => string;

export function getCareerProgressCopy(
  t: TranslateFn,
  state: CareerState,
): { primary: string; secondary?: string } {
  const rankLabel = t(careerRankKey(state.rank));
  const target = getPromotionTarget(state.rank);

  if (!target) {
    return { primary: t('career.maxRank', { rank: rankLabel }) };
  }

  return {
    primary: t('career.homeBadge', {
      rank: rankLabel,
      current: state.promotionWins,
      required: target.requiredWins,
    }),
    secondary: t('career.progressNext', {
      nextRank: t(careerRankKey(target.nextRank)),
      required: target.requiredWins,
    }),
  };
}

function minDifficultyLabel(language: AppLanguage, minDifficulty: NonNullable<ReturnType<typeof getPromotionTarget>>['minAiDifficulty']) {
  if (!minDifficulty) {
    return '';
  }

  const option = AI_DIFFICULTY_OPTIONS.find((entry) => entry.value === minDifficulty);
  return option ? getLocalizedText(language, option.labels) : minDifficulty;
}

export function getCareerResultMessage(
  t: TranslateFn,
  language: AppLanguage,
  result: PromotionResult,
  finishReason: 'draw' | 'nagari' | undefined,
): string {
  const rankLabel = t(careerRankKey(result.nextState.rank));
  const target = getPromotionTarget(result.nextState.rank);

  if (result.unchanged) {
    if (finishReason === 'nagari') {
      return t('career.nagariNoChange');
    }
    return getCareerProgressCopy(t, result.nextState).primary;
  }

  if (result.lost && target) {
    return t('career.lossKeepsProgress', {
      rank: rankLabel,
      current: result.nextState.promotionWins,
      required: target.requiredWins,
    });
  }

  if (result.noProgressDifficulty) {
    return t('career.noProgressDifficulty', {
      minDifficulty: minDifficultyLabel(language, target?.minAiDifficulty),
    });
  }

  return getCareerProgressCopy(t, result.nextState).primary;
}
