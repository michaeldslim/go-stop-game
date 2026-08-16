import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  subtitle?: string;
}

export function ScreenHeader({ title, onBack, backLabel = '← Back', subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>{backLabel}</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.cream,
    opacity: 0.65,
    fontSize: 14,
    lineHeight: 20,
  },
});
