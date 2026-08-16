import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CollectedPileView } from '../src/components/CollectedPileView';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { colors } from '../src/constants/colors';
import { getAiDifficultyOption, getLocalizedText } from '../src/constants/gameOptions';
import { createGame } from '../src/game/createGame';
import { computeSettlement } from '../src/game/settlement';
import { calculateScore, calculateHwatuSimpleScore } from '../src/game/scoring';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, GameMode } from '../src/types/game';
import type { CardId, FinishReason } from '../src/types/gameState';

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

function headline(
  language: 'en' | 'ko',
  humanWon: boolean,
  isDraw: boolean,
  finishReason: FinishReason,
): string {
  if (isDraw) {
    return language === 'ko' ? '무승부' : 'Draw';
  }

  if (finishReason === 'autoWin') {
    return humanWon
      ? language === 'ko'
        ? '4월 승 — 자동 승리!'
        : 'Four of a month — you win!'
      : language === 'ko'
        ? 'AI 4월 승'
        : 'AI wins — four of a month';
  }

  if (finishReason === 'nagari') {
    return language === 'ko' ? '나가리' : 'Nagari';
  }

  return humanWon
    ? language === 'ko'
      ? '승리!'
      : 'You win!'
    : language === 'ko'
      ? '패배'
      : 'You lose';
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
  const { settings } = useSettings();
  const { language } = settings;

  const mode = parseMode(params.mode);
  const difficulty = parseDifficulty(params.difficulty);
  const difficultyOption = getAiDifficultyOption(difficulty);
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

  const humanBreakdown =
    mode === 'hwatu'
      ? null
      : calculateScore(humanCollected, humanGoCount, humanBonusPi);
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
        title={headline(language, humanWon, isDraw, finishReason)}
        subtitle={getLocalizedText(language, difficultyOption.labels)}
        onBack={() => router.replace('/')}
        backLabel={language === 'ko' ? '← 홈' : '← Home'}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{language === 'ko' ? '나' : 'You'}</Text>
            <Text style={[styles.scoreValue, humanWon && styles.winnerScore]}>
              {mode === 'hwatu' ? humanHwatuScore : humanScore}
            </Text>
            {humanGoCount > 0 ? (
              <Text style={styles.goCount}>
                {language === 'ko' ? `${humanGoCount}고` : `${humanGoCount} Go`}
              </Text>
            ) : null}
          </View>
          {opponentScores.map((score, index) => {
            const opponentWon = !humanWon && !isDraw && winner !== 'human' && index === 0 && opponentScores.length === 1;
            return (
              <View key={opponentNames[index] ?? index} style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>{opponentNames[index] ?? 'AI'}</Text>
                <Text style={[styles.scoreValue, opponentWon && styles.winnerScore]}>
                  {score}
                </Text>
                {opponentGoCounts[index] && Number(opponentGoCounts[index]) > 0 ? (
                  <Text style={styles.goCount}>
                    {language === 'ko'
                      ? `${opponentGoCounts[index]}고`
                      : `${opponentGoCounts[index]} Go`}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {finishReason === 'nagari' ? (
          <Text style={styles.nagariHint}>
            {language === 'ko'
              ? `다음 판 ${nextHandMultiplier}배 정산`
              : `Next hand pays ${nextHandMultiplier}×`}
          </Text>
        ) : null}

        {settlement && !isDraw ? (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>
              {language === 'ko' ? '정산' : 'Settlement'}
            </Text>
            <Text style={styles.breakdownLine}>
              {language === 'ko' ? '순 획득 칩' : 'Net chips'}:{' '}
              <Text style={styles.chipValue}>
                {settlement.humanNetChips > 0 ? '+' : ''}
                {settlement.humanNetChips}
              </Text>
            </Text>
            {settlement.players.map((line) => (
              <Text key={line.playerIndex} style={styles.breakdownLine}>
                {opponentNames[line.playerIndex - 1] ?? 'AI'}:{' '}
                {language === 'ko' ? '정산' : 'pays'} {line.totalChips}
                {line.goBakVictim ? (language === 'ko' ? ' · 고박' : ' · Go bak') : ''}
                {line.piBak ? (language === 'ko' ? ' · 피박' : ' · Pi bak') : ''}
                {line.gwangBak ? (language === 'ko' ? ' · 광박' : ' · Gwang bak') : ''}
              </Text>
            ))}
          </View>
        ) : null}

        {humanBreakdown ? (
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>
              {language === 'ko' ? '점수 내역' : 'Score breakdown'}
            </Text>
            <Text style={styles.breakdownLine}>
              {language === 'ko' ? '나' : 'You'}: 광 {humanBreakdown.bright} · 열끗{' '}
              {humanBreakdown.animal} · 띠 {humanBreakdown.ribbon} · 피 {humanBreakdown.junk}
              {humanBreakdown.godori > 0 ? ` · 고도리 ${humanBreakdown.godori}` : ''}
              {humanBonusPi > 0 ? ` · 보너스피 ${humanBonusPi}` : ''}
            </Text>
          </View>
        ) : null}

        <View style={styles.pileSection}>
          <Text style={styles.sectionTitle}>
            {language === 'ko' ? '따낸 패' : 'Collected'}
          </Text>
          <Text style={styles.pileLabel}>{language === 'ko' ? '나' : 'You'}</Text>
          <CollectedPileView cardIds={humanCollected} />
          {opponentCollectedList.map((collected, index) => (
            <View key={opponentNames[index] ?? index}>
              <Text style={styles.pileLabel}>{opponentNames[index] ?? 'AI'}</Text>
              <CollectedPileView cardIds={parseCardIds(collected)} />
            </View>
          ))}
        </View>

        <Pressable style={styles.playAgain} onPress={playAgain}>
          <Text style={styles.playAgainText}>
            {language === 'ko' ? '다시 하기' : 'Play Again'}
          </Text>
        </Pressable>
      </ScrollView>
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
