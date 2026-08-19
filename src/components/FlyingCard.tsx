import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
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
  flipRevealHoldMs?: number;
  bounceOnArrival?: boolean;
  durationMs: number;
  onComplete: () => void;
}

const DEFAULT_POINT: AnchorPoint = { x: 0, y: 0 };
const DEFAULT_FLIP_REVEAL_HOLD_MS = 350;

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

export function FlyingCard({
  cardId,
  from,
  to,
  size = 'table',
  faceDown = false,
  flipOnArrival = false,
  flipRevealHoldMs = DEFAULT_FLIP_REVEAL_HOLD_MS,
  bounceOnArrival = false,
  durationMs,
  onComplete,
}: FlyingCardProps) {
  const card = getCardById(cardId);
  const dimensions = CARD_DIMENSIONS[size];
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const fromX = useSharedValue(from?.x ?? DEFAULT_POINT.x);
  const fromY = useSharedValue(from?.y ?? DEFAULT_POINT.y);
  const toX = useSharedValue(to?.x ?? DEFAULT_POINT.x);
  const toY = useSharedValue(to?.y ?? DEFAULT_POINT.y);
  const cardWidth = useSharedValue(dimensions.width);
  const cardHeight = useSharedValue(dimensions.height);
  const [showFace, setShowFace] = useState(!faceDown);
  const onCompleteRef = useRef(onComplete);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  onCompleteRef.current = onComplete;

  const finishFlight = useCallback(() => {
    onCompleteRef.current();
  }, []);

  const finishWithFlipReveal = useCallback(() => {
    setShowFace(true);
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
    }
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      finishFlight();
    }, flipRevealHoldMs);
  }, [finishFlight, flipRevealHoldMs]);

  const finishWithBounce = useCallback(() => {
    scale.value = withSequence(
      withSpring(1.12, { damping: 8, stiffness: 320 }),
      withSpring(1, { damping: 12, stiffness: 280 }, (finished) => {
        if (finished) {
          runOnJS(finishFlight)();
        }
      }),
    );
  }, [finishFlight, scale]);

  useEffect(() => {
    let cancelled = false;

    const startFlight = async () => {
      await waitForNextFrame();
      if (cancelled) {
        return;
      }

      fromX.value = from?.x ?? DEFAULT_POINT.x;
      fromY.value = from?.y ?? DEFAULT_POINT.y;
      toX.value = to?.x ?? DEFAULT_POINT.x;
      toY.value = to?.y ?? DEFAULT_POINT.y;
      cardWidth.value = dimensions.width;
      cardHeight.value = dimensions.height;
      progress.value = 0;
      scale.value = 1;
      setShowFace(!faceDown);

      const isBounceOnly =
        bounceOnArrival &&
        Math.abs((from?.x ?? 0) - (to?.x ?? 0)) < 1 &&
        Math.abs((from?.y ?? 0) - (to?.y ?? 0)) < 1;

      if (isBounceOnly) {
        progress.value = 1;
        finishWithBounce();
        return;
      }

      progress.value = withTiming(
        1,
        { duration: durationMs, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (!finished || cancelled) {
            return;
          }
          if (flipOnArrival && faceDown) {
            runOnJS(finishWithFlipReveal)();
          } else if (bounceOnArrival) {
            runOnJS(finishWithBounce)();
          } else {
            runOnJS(finishFlight)();
          }
        },
      );
    };

    void startFlight();

    return () => {
      cancelled = true;
      cancelAnimation(progress);
      cancelAnimation(scale);
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [
    cardId,
    from?.x,
    from?.y,
    to?.x,
    to?.y,
    durationMs,
    faceDown,
    flipOnArrival,
    flipRevealHoldMs,
    bounceOnArrival,
    dimensions.width,
    dimensions.height,
    finishFlight,
    finishWithFlipReveal,
    finishWithBounce,
    cardWidth,
    cardHeight,
    fromX,
    fromY,
    progress,
    scale,
    toX,
    toY,
  ]);

  const animatedStyle = useAnimatedStyle(() => {
    const width = cardWidth.value;
    const height = cardHeight.value;
    const x = fromX.value + (toX.value - fromX.value) * progress.value - width / 2;
    const y = fromY.value + (toY.value - fromY.value) * progress.value - height / 2;

    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: scale.value },
      ],
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
