import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { AppLanguage } from '../types/game';

interface SpecialMoveBarProps {
  language: AppLanguage;
  canShake: boolean;
  canBomb: boolean;
  onShake: () => void;
  onBomb: () => void;
  disabled?: boolean;
}

export function SpecialMoveBar({
  language,
  canShake,
  canBomb,
  onShake,
  onBomb,
  disabled,
}: SpecialMoveBarProps) {
  if (!canShake && !canBomb) {
    return null;
  }

  return (
    <View style={styles.bar}>
      {canShake ? (
        <Pressable
          style={[styles.chip, disabled && styles.chipDisabled]}
          onPress={onShake}
          disabled={disabled}
        >
          <Text style={styles.chipText}>{language === 'ko' ? '흔들기' : 'Shake'}</Text>
        </Pressable>
      ) : null}
      {canBomb ? (
        <Pressable
          style={[styles.chip, styles.chipBomb, disabled && styles.chipDisabled]}
          onPress={onBomb}
          disabled={disabled}
        >
          <Text style={styles.chipText}>{language === 'ko' ? '폭탄' : 'Bomb'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  chip: {
    backgroundColor: 'rgba(201,162,39,0.25)',
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipBomb: {
    backgroundColor: 'rgba(139,26,26,0.35)',
    borderColor: '#c44',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '700',
  },
});
