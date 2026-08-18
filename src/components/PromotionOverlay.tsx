import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { colors } from '../constants/colors';
import type { CareerRank } from '../types/career';

interface PromotionOverlayProps {
  visible: boolean;
  title: string;
  subtitle: string;
  isCeo: boolean;
  hapticsEnabled: boolean;
  onComplete: () => void;
}

const DISPLAY_MS = 1200;
const CEO_DISPLAY_MS = 1800;
const FADE_MS = 400;

export function PromotionOverlay({
  visible,
  title,
  subtitle,
  isCeo,
  hapticsEnabled,
  onComplete,
}: PromotionOverlayProps) {
  const backdropOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.45);
  const bannerOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (hapticsEnabled) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const displayMs = isCeo ? CEO_DISPLAY_MS : DISPLAY_MS;

    backdropOpacity.value = 0;
    bannerScale.value = 0.45;
    bannerOpacity.value = 0;
    glowScale.value = 0.6;
    glowOpacity.value = 0;

    backdropOpacity.value = withSequence(
      withTiming(0.62, { duration: 200, easing: Easing.out(Easing.quad) }),
      withDelay(displayMs, withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) })),
    );

    bannerScale.value = withSequence(
      withTiming(1.14, { duration: 260, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 160, easing: Easing.inOut(Easing.quad) }),
    );

    bannerOpacity.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withDelay(
        displayMs,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) {
            scheduleOnRN(onComplete);
          }
        }),
      ),
    );

    glowScale.value = withSequence(
      withTiming(1.55, { duration: 320, easing: Easing.out(Easing.cubic) }),
      withTiming(1.2, { duration: 280, easing: Easing.inOut(Easing.quad) }),
    );

    glowOpacity.value = withSequence(
      withTiming(0.75, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(0.35, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      withDelay(
        displayMs - 200,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) }),
      ),
    );
  }, [
    visible,
    isCeo,
    hapticsEnabled,
    onComplete,
    backdropOpacity,
    bannerOpacity,
    bannerScale,
    glowOpacity,
    glowScale,
  ]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const bannerStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
    transform: [{ scale: bannerScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  if (!visible) {
    return null;
  }

  const accent = colors.gold;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      <Animated.View style={[styles.bannerWrap, bannerStyle]}>
        <Animated.View
          style={[styles.glow, glowStyle, { backgroundColor: accent, shadowColor: accent }]}
        />
        <View style={[styles.banner, { borderColor: accent }]}>
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <Text style={[styles.title, { color: accent }]}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    elevation: 2000,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
  },
  bannerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 120,
    borderRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 16,
  },
  banner: {
    minWidth: 240,
    maxWidth: 340,
    backgroundColor: colors.felt,
    borderRadius: 18,
    borderWidth: 3,
    paddingVertical: 22,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  accentBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
    opacity: 0.9,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    marginTop: 10,
    color: colors.cream,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 26,
  },
});
