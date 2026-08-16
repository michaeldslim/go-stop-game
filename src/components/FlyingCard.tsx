import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { getCardById } from '../cards/getCardById';
import { CardView } from './CardView';
import { CARD_DIMENSIONS } from '../constants/layout';
import type { CardId } from '../types/gameState';
import type { CardSize } from '../types/hwatu';
import type { AnchorPoint } from './LayoutAnchor';

interface FlyingCardProps {
  cardId: CardId;
  from: AnchorPoint;
  to: AnchorPoint;
  size?: CardSize;
  faceDown?: boolean;
  flipOnArrival?: boolean;
  durationMs: number;
  onComplete: () => void;
}

const DEFAULT_POINT: AnchorPoint = { x: 0, y: 0 };

export function FlyingCard({
  cardId,
  from,
  to,
  size = 'table',
  faceDown = false,
  flipOnArrival = false,
  durationMs,
  onComplete,
}: FlyingCardProps) {
  const card = getCardById(cardId);
  const dimensions = CARD_DIMENSIONS[size];
  const progress = useSharedValue(0);
  const [showFace, setShowFace] = useState(!faceDown);

  const safeFrom = from ?? DEFAULT_POINT;
  const safeTo = to ?? DEFAULT_POINT;

  useEffect(() => {
    progress.value = 0;
    setShowFace(!faceDown);

    progress.value = withTiming(
      1,
      { duration: durationMs, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (!finished) {
          return;
        }
        if (flipOnArrival && faceDown) {
          runOnJS(setShowFace)(true);
          runOnJS(onComplete)();
        } else {
          runOnJS(onComplete)();
        }
      },
    );
  }, [
    cardId,
    safeFrom.x,
    safeFrom.y,
    safeTo.x,
    safeTo.y,
    durationMs,
    faceDown,
    flipOnArrival,
    onComplete,
    progress,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const x = safeFrom.x + (safeTo.x - safeFrom.x) * progress.value - dimensions.width / 2;
    const y = safeFrom.y + (safeTo.y - safeFrom.y) * progress.value - dimensions.height / 2;
    const scale = size === 'pile' ? 0.5 + progress.value * 0.5 : 1;

    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
    };
  });

  return (
    <Animated.View style={[styles.overlay, animatedStyle]} pointerEvents="none">
      <CardView
        card={card}
        size={size}
        faceDown={!showFace}
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1000,
    elevation: 1000,
  },
});
