import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AI_DIFFICULTY_OPTIONS, getLocalizedText } from '../constants/gameOptions';
import { colors } from '../constants/colors';
import type { AiDifficulty } from '../types/game';

interface CareerDifficultyBannerProps {
  message: string;
  actionLabel: string;
  recommendedDifficulty: AiDifficulty;
  onApply: (difficulty: AiDifficulty) => void;
}

export function CareerDifficultyBanner({
  message,
  actionLabel,
  recommendedDifficulty,
  onApply,
}: CareerDifficultyBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={styles.actionButton}
        onPress={() => onApply(recommendedDifficulty)}
        accessibilityRole="button"
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

export function difficultyLabel(language: 'en' | 'ko', difficulty: AiDifficulty): string {
  const option = AI_DIFFICULTY_OPTIONS.find((entry) => entry.value === difficulty);
  return option ? getLocalizedText(language, option.labels) : difficulty;
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.45)',
    padding: 14,
    gap: 12,
  },
  message: {
    color: colors.cream,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionText: {
    color: colors.felt,
    fontSize: 14,
    fontWeight: '700',
  },
});
