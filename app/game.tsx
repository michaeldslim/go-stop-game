import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardView } from '../src/components/CardView';
import { CARD_CATALOG } from '../src/cards/cardCatalog';
import {
  getAiDifficultyOption,
  getGameModeOption,
  getLocalizedText,
} from '../src/constants/gameOptions';
import { colors } from '../src/constants/colors';
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

  const tableCards = CARD_CATALOG.slice(0, 8);
  const handCards = CARD_CATALOG.slice(8, 15);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>{language === 'ko' ? '← 설정' : '← Setup'}</Text>
        </Pressable>
        <Text style={styles.title}>{language === 'ko' ? '카드 미리보기' : 'Card Preview'}</Text>
        <View style={styles.configRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getLocalizedText(language, modeOption.labels)}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              AI · {getLocalizedText(language, difficultyOption.labels)}
            </Text>
          </View>
        </View>
        <Text style={styles.hint}>
          {language === 'ko'
            ? `Phase 1 — ${CARD_CATALOG.length}장 카드 · Phase 2에서 실제 대국`
            : `Phase 1 — ${CARD_CATALOG.length} cards · gameplay in Phase 2`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {language === 'ko' ? '바닥 (샘플 딜)' : 'Table (sample deal)'}
          </Text>
          <View style={styles.tableGrid}>
            {tableCards.map((card) => (
              <CardView key={card.id} card={card} size="table" />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {language === 'ko' ? '내 손패' : 'Your Hand'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.handRow}>
            {handCards.map((card) => (
              <CardView key={`hand-${card.id}`} card={card} size="hand" />
            ))}
            <CardView card={handCards[0]} size="hand" faceDown />
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {language === 'ko'
              ? `전체 덱 (${CARD_CATALOG.length}장)`
              : `Full Deck (${CARD_CATALOG.length} cards)`}
          </Text>
          <View style={styles.deckGrid}>
            {CARD_CATALOG.map((card) => (
              <View key={`deck-${card.id}`} style={styles.deckItem}>
                <CardView card={card} size="small" />
                <Text style={styles.cardId} numberOfLines={1}>
                  {card.id}
                </Text>
              </View>
            ))}
          </View>
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
  hint: {
    color: colors.cream,
    opacity: 0.6,
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 24,
  },
  section: {
    gap: 12,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  handRow: {
    gap: 12,
    paddingVertical: 4,
  },
  deckGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  deckItem: {
    alignItems: 'center',
    width: 52,
    gap: 2,
  },
  cardId: {
    color: colors.cream,
    opacity: 0.5,
    fontSize: 7,
    textAlign: 'center',
  },
});
