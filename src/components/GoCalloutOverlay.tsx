import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

interface GoCalloutOverlayProps {
  message: string | null;
  onComplete: () => void;
}

const DISPLAY_MS = 1200;
const FADE_MS = 400;
const ACCENT = colors.gold;

export function GoCalloutOverlay({ message, onComplete }: GoCalloutOverlayProps) {
  const backdropOpacity = useSharedValue(0);
  const bannerScale = useSharedValue(0.45);
  const bannerOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.6);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (!message) {
      return;
    }

    backdropOpacity.value = 0;
    bannerScale.value = 0.45;
    bannerOpacity.value = 0;
    glowScale.value = 0.6;
    glowOpacity.value = 0;

    backdropOpacity.value = withSequence(
      withTiming(0.55, { duration: 200, easing: Easing.out(Easing.quad) }),
      withDelay(
        DISPLAY_MS,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) }),
      ),
    );

    bannerScale.value = withSequence(
      withTiming(1.1, { duration: 260, easing: Easing.out(Easing.back(1.4)) }),
      withTiming(1, { duration: 160, easing: Easing.inOut(Easing.quad) }),
    );

    bannerOpacity.value = withSequence(
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
      withDelay(
        DISPLAY_MS,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) {
            scheduleOnRN(onComplete);
          }
        }),
      ),
    );

    glowScale.value = withSequence(
      withTiming(1.45, { duration: 320, easing: Easing.out(Easing.cubic) }),
      withTiming(1.15, { duration: 280, easing: Easing.inOut(Easing.quad) }),
    );

    glowOpacity.value = withSequence(
      withTiming(0.7, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(0.3, { duration: 280, easing: Easing.inOut(Easing.quad) }),
      withDelay(
        DISPLAY_MS - 200,
        withTiming(0, { duration: FADE_MS, easing: Easing.in(Easing.quad) }),
      ),
    );
  }, [
    message,
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

  if (!message) {
    return null;
  }

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      <Animated.View style={[styles.bannerWrap, bannerStyle]}>
        <Animated.View
          style={[styles.glow, glowStyle, { backgroundColor: ACCENT, shadowColor: ACCENT }]}
        />
        <View style={[styles.banner, { borderColor: ACCENT }]}>
          <View style={[styles.accentBar, { backgroundColor: ACCENT }]} />
          <Text style={[styles.label, { color: ACCENT }]}>{message}</Text>
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
    width: 260,
    height: 100,
    borderRadius: 50,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 16,
  },
  banner: {
    minWidth: 220,
    maxWidth: 340,
    backgroundColor: colors.felt,
    borderRadius: 18,
    borderWidth: 3,
    paddingVertical: 20,
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
    marginBottom: 12,
    opacity: 0.9,
  },
  label: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.65)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
