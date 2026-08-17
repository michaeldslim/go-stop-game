import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getCardBackSource, getCardImageSource } from '../cards/getCardImage';
import { colors } from '../constants/colors';
import { CARD_BORDER_RADIUS, CARD_DIMENSIONS } from '../constants/layout';
import type { CardDefinition, CardSize } from '../types/hwatu';

interface CardViewProps {
  card: CardDefinition;
  size?: CardSize;
  faceDown?: boolean;
  onPress?: () => void;
  selected?: boolean;
  choosable?: boolean;
  hinted?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function CardView({
  card,
  size = 'table',
  faceDown = false,
  onPress,
  selected = false,
  choosable = false,
  hinted = false,
  disabled = false,
  style,
}: CardViewProps) {
  const dimensions = CARD_DIMENSIONS[size];
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!hinted) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [hinted, pulse]);

  const hintGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const content = faceDown ? (
    <Image source={getCardBackSource()} style={styles.image} contentFit="contain" transition={200} />
  ) : (
    <Image
      source={getCardImageSource(card)}
      style={styles.image}
      contentFit="contain"
      transition={200}
      accessibilityLabel={card.labels.ko}
    />
  );

  const cardBody = (
    <Animated.View style={hinted ? hintGlowStyle : undefined}>
      <View
        style={[
          styles.card,
          dimensions,
          styles.shadow,
          selected && styles.selected,
          choosable && styles.choosable,
          hinted && styles.hinted,
          disabled && styles.disabled,
          style,
        ]}
      >
        {content}
      </View>
    </Animated.View>
  );

  if (!onPress) {
    return cardBody;
  }

  return (
    <Pressable onPress={onPress} disabled={disabled}>
      {cardBody}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    backgroundColor: colors.cream,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selected: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  choosable: {
    borderColor: colors.gold,
    borderWidth: 3,
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1.06 }],
  },
  hinted: {
    borderColor: colors.hint,
    borderWidth: 3,
    shadowColor: colors.hint,
    shadowOpacity: 0.85,
    shadowRadius: 12,
    elevation: 12,
  },
  disabled: {
    opacity: 0.45,
  },
});
