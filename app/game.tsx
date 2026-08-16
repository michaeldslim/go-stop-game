import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCardById } from '../src/cards/getCardById';
import { CardView } from '../src/components/CardView';
import {
  getAiDifficultyOption,
  getGameModeOption,
  getLocalizedText,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
import { expandTableCard } from '../src/game/tableCards';
import { canChooseTableIndex } from '../src/game/turnEngine';
import { useMatgoGame } from '../src/game/useMatgoGame';
import { useSettings } from '../src/settings/SettingsProvider';
import type { AiDifficulty, GameMode } from '../src/types/game';

function parseMode(value: string | string[] | undefined): GameMode {
  return value === 'gostop' ? 'gostop' : 'matgo';
}

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

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; difficulty?: string }>();
  const { settings } = useSettings();
  const { language } = settings;

  const mode = parseMode(params.mode);
  const difficulty = parseDifficulty(params.difficulty);
  const modeOption = getGameModeOption(mode);
  const difficultyOption = getAiDifficultyOption(difficulty);

  const { game, playCard, chooseTable, playableHandCardIds, isHumanTurn, needsTableChoice } =
    useMatgoGame(difficulty);

  const human = game.players[0];
  const ai = game.players[1];
  const humanHand = human.hand.map(getCardById);
  const isHumanDealer = game.dealerIndex === 0;
  const playableSet = new Set(playableHandCardIds);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{language === 'ko' ? '← 설정' : '← Setup'}</Text>
        </Pressable>
        <Text style={styles.title}>{language === 'ko' ? '맞고' : 'Matgo'}</Text>
        <View style={styles.configRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getLocalizedText(language, modeOption.labels)}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              AI · {getLocalizedText(language, difficultyOption.labels)}
            </Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {language === 'ko' ? `목표 ${game.targetScore}점` : `Target ${game.targetScore}`}
            </Text>
          </View>
        </View>
        <Text style={styles.status}>{game.statusMessage}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.opponentBar}>
          <View style={styles.opponentInfo}>
            <Text style={styles.opponentName}>
              AI · {getLocalizedText(language, difficultyOption.labels)}
            </Text>
            {game.dealerIndex === 1 ? (
              <Text style={styles.dealerBadge}>{language === 'ko' ? '선' : 'Dealer'}</Text>
            ) : null}
            <Text style={styles.collectedCount}>
              {language === 'ko' ? `따낸 패 ${ai.collected.length}` : `Captured ${ai.collected.length}`}
            </Text>
          </View>
          <Text style={styles.handCount}>
            {language === 'ko' ? `손패 ${ai.hand.length}장` : `${ai.hand.length} cards`}
          </Text>
          <View style={styles.aiHandRow}>
            {ai.hand.map((_, index) => (
              <CardView key={`ai-${index}`} card={humanHand[0] ?? getCardById('jan-junk-1')} size="small" faceDown />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{language === 'ko' ? '바닥' : 'Table'}</Text>
            <Text style={styles.sectionMeta}>
              {language === 'ko' ? `${game.table.length}장` : `${game.table.length} cards`}
            </Text>
          </View>
          {needsTableChoice ? (
            <Text style={styles.prompt}>
              {language === 'ko' ? '매칭할 바닥 패를 선택하세요' : 'Tap a matching table card'}
            </Text>
          ) : null}
          <View style={styles.tableGrid}>
            {game.table.map((tableCard, index) => {
              const card = getCardById(tableCard.cardId);
              const stackSize = expandTableCard(tableCard).length;
              const choosable = canChooseTableIndex(game, index);

              return (
                <View key={`table-${index}-${tableCard.cardId}`} style={styles.tableItem}>
                  <CardView
                    card={card}
                    size="table"
                    onPress={choosable ? () => chooseTable(index) : undefined}
                    selected={choosable}
                  />
                  {stackSize > 1 ? (
                    <Text style={styles.stackLabel}>
                      {language === 'ko' ? `스택 ${stackSize}` : `Stack ${stackSize}`}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.middleBar}>
          <View style={styles.deckPile}>
            <CardView
              card={humanHand[0] ?? getCardById('jan-junk-1')}
              size="small"
              faceDown
            />
            <Text style={styles.deckCount}>
              {language === 'ko' ? `덱 ${game.deck.length}` : `Deck ${game.deck.length}`}
            </Text>
          </View>
          {game.lastFlippedCardId ? (
            <View style={styles.flippedPreview}>
              <Text style={styles.flippedLabel}>{language === 'ko' ? '방금 뒤집음' : 'Flipped'}</Text>
              <CardView card={getCardById(game.lastFlippedCardId)} size="small" />
            </View>
          ) : null}
          <Text style={styles.turnHint}>
            {game.phase === 'finished'
              ? language === 'ko'
                ? '패 종료'
                : 'Hand finished'
              : isHumanTurn
                ? language === 'ko'
                  ? '당신 차례'
                  : 'Your turn'
                : language === 'ko'
                  ? 'AI 차례…'
                  : 'AI turn…'}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{language === 'ko' ? '내 손패' : 'Your Hand'}</Text>
            <View style={styles.playerMeta}>
              {isHumanDealer ? (
                <Text style={styles.dealerBadge}>{language === 'ko' ? '선' : 'Dealer'}</Text>
              ) : null}
              <Text style={styles.collectedCount}>
                {language === 'ko' ? `따낸 패 ${human.collected.length}` : `Captured ${human.collected.length}`}
              </Text>
              <Text style={styles.sectionMeta}>
                {language === 'ko' ? `${humanHand.length}장` : `${humanHand.length} cards`}
              </Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.handRow}>
            {humanHand.map((card) => {
              const playable = playableSet.has(card.id);
              return (
                <CardView
                  key={`hand-${card.id}`}
                  card={card}
                  size="hand"
                  onPress={() => playCard(card.id)}
                  disabled={!playable}
                  selected={playable && isHumanTurn && !needsTableChoice}
                />
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.felt,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  back: {
    color: colors.gold,
    fontSize: 16,
  },
  title: {
    color: colors.cream,
    fontSize: 24,
    fontWeight: '700',
  },
  configRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(201, 162, 39, 0.18)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  status: {
    color: colors.cream,
    opacity: 0.8,
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 20,
  },
  opponentBar: {
    paddingHorizontal: 16,
    gap: 8,
  },
  opponentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  opponentName: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '600',
  },
  handCount: {
    color: colors.cream,
    opacity: 0.7,
    fontSize: 13,
  },
  collectedCount: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  aiHandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  section: {
    gap: 12,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionMeta: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 13,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dealerBadge: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prompt: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  tableItem: {
    alignItems: 'center',
    gap: 4,
  },
  stackLabel: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 11,
    fontWeight: '600',
  },
  middleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  deckPile: {
    alignItems: 'center',
    gap: 4,
  },
  deckCount: {
    color: colors.cream,
    opacity: 0.75,
    fontSize: 12,
    fontWeight: '600',
  },
  flippedPreview: {
    alignItems: 'center',
    gap: 4,
  },
  flippedLabel: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 11,
  },
  turnHint: {
    flex: 1,
    color: colors.cream,
    opacity: 0.6,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  handRow: {
    gap: 12,
    paddingVertical: 4,
  },
});
