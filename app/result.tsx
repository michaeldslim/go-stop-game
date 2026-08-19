import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectedPileView } from '../src/components/CollectedPileView';
import { PlayerAvatar } from '../src/components/PlayerAvatar';
import { PromotionOverlay } from '../src/components/PromotionOverlay';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { careerRankKey, getCareerResultMessage } from '../src/career/careerLabels';
import { useCareer } from '../src/career/CareerProvider';
import { colors } from '../src/constants/colors';
import { getOpponentAvatarId } from '../src/constants/avatars';
import { createGame } from '../src/game/createGame';
import { computeSettlement } from '../src/game/settlement';
import { calculateScore, calculateHwatuSimpleScore, countCollectedCards, type ScoreBreakdown } from '../src/game/scoring';
import { useTranslation } from '../src/i18n/useTranslation';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, GameMode } from '../src/types/game';
import type { CardId, FinishReason } from '../src/types/gameState';
import type { TranslationKey } from '../src/i18n/translations';
import type { PromotionResult } from '../src/types/career';

function parseDifficulty(value: string | string[] | undefined): AiDifficulty {
  if (
    value === 'beginner' ||
    value === 'intermediate' ||
    value === 'advanced' ||
    value === 'expert'
  ) {
    return value;
  }
  return 'intermediate';
}

function parseMode(value: string | string[] | undefined): GameMode {
  if (value === 'gostop' || value === 'hwatu') {
    return value;
  }
  return 'matgo';
}

function parseCardIds(value: string): CardId[] {
  if (!value) {
    return [];
  }
  return value.split(',').filter(Boolean);
}

function parseFinishReason(value: string | string[] | undefined): FinishReason {
  if (
    value === 'stop' ||
    value === 'handsEmpty' ||
    value === 'autoWin' ||
    value === 'draw' ||
    value === 'nagari'
  ) {
    return value;
  }
  return 'handsEmpty';
}

function headlineKey(
  humanWon: boolean,
  isDraw: boolean,
  finishReason: FinishReason,
): TranslationKey {
  if (isDraw) {
    return finishReason === 'nagari' ? 'result.headline.nagari' : 'result.headline.draw';
  }

  if (finishReason === 'autoWin') {
    return humanWon ? 'result.headline.autoWinHuman' : 'result.headline.autoWinAi';
  }

  if (finishReason === 'nagari') {
    return 'result.headline.nagari';
  }

  return humanWon ? 'result.headline.win' : 'result.headline.lose';
}

function scoreExtras(breakdown: ScoreBreakdown, t: ReturnType<typeof useTranslation>['t']): string {
  let extras = '';
  if (breakdown.godori > 0) {
    extras += t('result.godoriSuffix', { count: breakdown.godori });
  }
  if (breakdown.hongdan > 0) {
    extras += t('result.hongdanSuffix', { count: breakdown.hongdan });
  }
  if (breakdown.cheongdan > 0) {
    extras += t('result.cheongdanSuffix', { count: breakdown.cheongdan });
  }
  if (breakdown.chodan > 0) {
    extras += t('result.chodanSuffix', { count: breakdown.chodan });
  }
  return extras;
}

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    mode?: string;
    difficulty?: string;
    humanScore?: string;
    humanCollected?: string;
    humanGoCount?: string;
    humanBonusPi?: string;
    winner?: string;
    finishReason?: string;
    handMultiplier?: string;
    nextHandMultiplier?: string;
    opponentScores?: string;
    opponentNames?: string;
    opponentCollected?: string;
    opponentGoCounts?: string;
    opponentBonusPi?: string;
    winnerIndex?: string;
  }>();
  const { t, language } = useTranslation();
  const { settings, loaded: settingsLoaded } = useSettings();
  const { recordMatchResult, loaded: careerLoaded } = useCareer();
  const [careerResult, setCareerResult] = useState<PromotionResult | null>(null);
  const [showPromotionOverlay, setShowPromotionOverlay] = useState(false);
  const recordedCareerRef = useRef(false);
  const mode = parseMode(params.mode);
  const difficulty = parseDifficulty(params.difficulty);
  const humanScore = Number(params.humanScore ?? 0);
  const humanCollected = parseCardIds(params.humanCollected ?? '');
  const humanGoCount = Number(params.humanGoCount ?? 0);
  const humanBonusPi = Number(params.humanBonusPi ?? 0);
  const finishReason = parseFinishReason(params.finishReason);
  const winner = params.winner;
  const humanWon = winner === 'human';
  const isDraw = winner === 'draw' || finishReason === 'draw' || finishReason === 'nagari';
  const nextHandMultiplier = Number(params.nextHandMultiplier ?? 1);

  const opponentScores = (params.opponentScores ?? '').split('|').filter(Boolean);
  const opponentNames = (params.opponentNames ?? 'AI').split('|');
  const opponentCollectedList = (params.opponentCollected ?? '').split('|');
  const opponentGoCounts = (params.opponentGoCounts ?? '').split('|');
  const opponentBonusPiList = (params.opponentBonusPi ?? '').split('|');
  const opponentAvatarIds = opponentScores.map((_, index) =>
    getOpponentAvatarId(settings.playerAvatarId, settings.aiAvatarId, index),
  );

  const humanHwatuScore =
    mode === 'hwatu' ? calculateHwatuSimpleScore(humanCollected) : humanScore;

  const settlementState = createGame({ mode, aiDifficulty: difficulty, handMultiplier: Number(params.handMultiplier ?? 1) });
  settlementState.phase = 'finished';
  settlementState.finishReason = finishReason;
  settlementState.winnerIndex =
    params.winnerIndex !== undefined && params.winnerIndex !== ''
      ? Number(params.winnerIndex)
      : humanWon
        ? 0
        : isDraw
          ? null
          : 1;
  settlementState.players[0] = {
    ...settlementState.players[0],
    score: humanScore,
    collected: humanCollected,
    goCount: humanGoCount,
    bonusPi: humanBonusPi,
  };
  for (let index = 0; index < opponentScores.length; index += 1) {
    const opponentIndex = index + 1;
    if (settlementState.players[opponentIndex]) {
      settlementState.players[opponentIndex] = {
        ...settlementState.players[opponentIndex],
        score: Number(opponentScores[index] ?? 0),
        collected: parseCardIds(opponentCollectedList[index] ?? ''),
        goCount: Number(opponentGoCounts[index] ?? 0),
        bonusPi: Number(opponentBonusPiList[index] ?? 0),
      };
    }
  }

  const settlement = !isDraw ? computeSettlement(settlementState) : null;

  const humanFlexRoles = settlementState.players[0]?.flexCardRoles ?? {};
  const humanBreakdown =
    mode === 'hwatu'
      ? null
      : calculateScore(humanCollected, humanGoCount, humanBonusPi, humanFlexRoles);
  const humanCollectedCounts =
    mode === 'hwatu'
      ? null
      : countCollectedCards(humanCollected, humanBonusPi, humanFlexRoles);

  useEffect(() => {
    if (!settingsLoaded || !careerLoaded || recordedCareerRef.current || !settings.careerModeEnabled) {
      return;
    }

    recordedCareerRef.current = true;
    const result = recordMatchResult({
      won: humanWon,
      aiDifficulty: difficulty,
      finishReason,
    });

    if (result) {
      setCareerResult(result);
      if (result.promoted) {
        setShowPromotionOverlay(true);
      }
    }
  }, [
    settingsLoaded,
    careerLoaded,
    settings.careerModeEnabled,
    recordMatchResult,
    humanWon,
    difficulty,
    finishReason,
  ]);

  const careerMessage =
    settings.careerModeEnabled && careerResult
      ? getCareerResultMessage(
          t,
          language,
          careerResult,
          finishReason === 'nagari' ? 'nagari' : finishReason === 'draw' ? 'draw' : undefined,
        )
      : null;

  const promotedRank = careerResult?.promoted ?? null;
  const promotionTitle = promotedRank === 'ceo' ? t('career.ceoReached.title') : t('career.promoted.title');
  const promotionSubtitle =
    promotedRank === 'ceo'
      ? t('career.ceoReached.subtitle')
      : promotedRank
        ? t('career.promoted.subtitle', { rank: t(careerRankKey(promotedRank)) })
        : '';

  const playAgain = () => {
    router.replace({
      pathname: '/game',
      params: {
        mode,
        difficulty,
        handMultiplier: String(nextHandMultiplier),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={t(headlineKey(humanWon, isDraw, finishReason))}
        onBack={() => router.replace('/')}
        backLabel={t('common.home')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <PlayerAvatar avatarId={settings.playerAvatarId} size="md" />
            <Text style={styles.scoreLabel}>{t('common.player')}</Text>
            <Text style={[styles.scoreValue, humanWon && styles.winnerScore]}>
              {mode === 'hwatu' ? humanHwatuScore : humanScore}
            </Text>
            {humanGoCount > 0 ? (
              <Text style={styles.goCount}>{t('result.goCount', { count: humanGoCount })}</Text>
            ) : null}
          </View>
          {opponentScores.map((score, index) => {
            const opponentWon = !humanWon && !isDraw && winner !== 'human' && index === 0 && opponentScores.length === 1;
            return (
              <View key={opponentNames[index] ?? index} style={styles.scoreCard}>
                <PlayerAvatar avatarId={opponentAvatarIds[index] ?? settings.aiAvatarId} size="md" />
                <Text style={styles.scoreLabel}>{opponentNames[index] ?? 'AI'}</Text>
                <Text style={[styles.scoreValue, opponentWon && styles.winnerScore]}>
                  {score}
                </Text>
                {opponentGoCounts[index] && Number(opponentGoCounts[index]) > 0 ? (
                  <Text style={styles.goCount}>
                    {t('result.goCount', { count: Number(opponentGoCounts[index]) })}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {finishReason === 'nagari' ? (
          <Text style={styles.nagariHint}>
            {t('result.nagariHint', { multiplier: nextHandMultiplier })}
          </Text>
        ) : null}

        {careerMessage ? (
          <View style={styles.careerSection}>
            <Text style={styles.sectionTitle}>{t('settings.career')}</Text>
            <Text style={styles.careerMessage}>{careerMessage}</Text>
          </View>
        ) : null}

        {settlement && !isDraw ? (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>{t('result.settlement')}</Text>
            <Text style={styles.breakdownLine}>
              {t('result.netChips')}:{' '}
              <Text style={styles.chipValue}>
                {settlement.humanNetChips > 0 ? '+' : ''}
                {settlement.humanNetChips}
                {language === 'ko' ? '점' : ''}
              </Text>
            </Text>
            {settlement.players.map((line) => {
              const payerName =
                line.playerIndex === 0
                  ? t('common.player')
                  : opponentNames[line.playerIndex - 1] ?? 'AI';
              return (
                <Text key={line.playerIndex} style={styles.breakdownLine}>
                  {t('result.paysLine', { name: payerName, amount: line.totalChips })}
                  {line.goBakVictim ? t('result.goBak') : ''}
                  {line.piBak ? t('result.piBak') : ''}
                  {line.gwangBak ? t('result.gwangBak') : ''}
                </Text>
              );
            })}
          </View>
        ) : null}

        {humanBreakdown && humanCollectedCounts ? (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>{t('result.scoreBreakdown')}</Text>
            <Text style={styles.breakdownLine}>
              {t('result.collectedCounts', {
                bright: humanCollectedCounts.brights,
                animal: humanCollectedCounts.animals,
                ribbon: humanCollectedCounts.ribbons,
                pi: humanCollectedCounts.pi,
              })}
            </Text>
            <Text style={styles.breakdownLine}>
              {t('result.scorePoints', {
                bright: humanBreakdown.bright,
                animal: humanBreakdown.animal,
                ribbon: humanBreakdown.ribbon,
                junk: humanBreakdown.junk,
                extras: scoreExtras(humanBreakdown, t),
              })}
            </Text>
            {humanBonusPi > 0 ? (
              <Text style={styles.breakdownLine}>
                {t('result.bonusPiLine', { count: humanBonusPi })}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.pileSection}>
          <Text style={styles.sectionTitle}>{t('result.collected')}</Text>
          <View style={styles.pileGroup}>
            <View style={styles.pileHeader}>
              <PlayerAvatar avatarId={settings.playerAvatarId} size="sm" />
              <Text style={styles.pileLabel}>{t('common.player')}</Text>
            </View>
            <CollectedPileView cardIds={humanCollected} />
          </View>
          {opponentCollectedList.map((collected, index) => (
            <View key={opponentNames[index] ?? index} style={styles.pileGroup}>
              <View style={styles.pileHeader}>
                <PlayerAvatar avatarId={opponentAvatarIds[index] ?? settings.aiAvatarId} size="sm" />
                <Text style={styles.pileLabel}>{opponentNames[index] ?? 'AI'}</Text>
              </View>
              <CollectedPileView cardIds={parseCardIds(collected)} />
            </View>
          ))}
        </View>

        <Pressable style={styles.playAgain} onPress={playAgain}>
          <Text style={styles.playAgainText}>{t('result.playAgain')}</Text>
        </Pressable>
      </ScrollView>

      <PromotionOverlay
        visible={showPromotionOverlay}
        title={promotionTitle}
        subtitle={promotionSubtitle}
        isCeo={promotedRank === 'ceo'}
        playerAvatarId={settings.playerAvatarId}
        hapticsEnabled={settings.hapticsEnabled}
        onComplete={() => setShowPromotionOverlay(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  scoreCard: {
    minWidth: 100,
    alignItems: 'center',
    gap: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,230,200,0.2)',
  },
  scoreLabel: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreValue: {
    color: colors.cream,
    fontSize: 36,
    fontWeight: '700',
  },
  winnerScore: {
    color: colors.gold,
  },
  goCount: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  nagariHint: {
    color: colors.gold,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  careerSection: {
    gap: 8,
    paddingVertical: 4,
  },
  careerMessage: {
    color: colors.cream,
    opacity: 0.9,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  breakdownSection: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  breakdownLine: {
    color: colors.cream,
    opacity: 0.85,
    fontSize: 13,
    lineHeight: 20,
  },
  chipValue: {
    color: colors.gold,
    fontWeight: '700',
  },
  pileSection: {
    gap: 8,
  },
  pileGroup: {
    gap: 8,
  },
  pileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  pileLabel: {
    color: colors.cream,
    opacity: 0.7,
    fontSize: 13,
    fontWeight: '600',
  },
  playAgain: {
    backgroundColor: colors.gold,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  playAgainText: {
    color: colors.felt,
    fontSize: 18,
    fontWeight: '700',
  },
});
