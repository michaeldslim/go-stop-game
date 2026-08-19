import { Modal, StyleSheet, View } from 'react-native';
import { FlyingCard } from './FlyingCard';
import type { CardId } from '../types/gameState';
import type { AnchorPoint } from './LayoutAnchor';
import type { CardSize } from '../types/hwatu';

export interface ActiveFlightState {
  id: string;
  cardId: CardId;
  from: AnchorPoint;
  to: AnchorPoint;
  size: CardSize;
  faceDown: boolean;
  flipOnArrival: boolean;
  flipRevealHoldMs?: number;
  durationMs: number;
}

interface TurnAnimationOverlayProps {
  activeFlight: ActiveFlightState | null;
  onFlightComplete: () => void;
}

export function TurnAnimationOverlay({
  activeFlight,
  onFlightComplete,
}: TurnAnimationOverlayProps) {
  return (
    <Modal
      transparent
      visible={activeFlight !== null}
      animationType="none"
      statusBarTranslucent
      presentationStyle="overFullScreen"
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={styles.overlay} pointerEvents="none" collapsable={false}>
        {activeFlight ? (
          <FlyingCard
            key={activeFlight.id}
            cardId={activeFlight.cardId}
            from={activeFlight.from}
            to={activeFlight.to}
            size={activeFlight.size}
            faceDown={activeFlight.faceDown}
            flipOnArrival={activeFlight.flipOnArrival}
            flipRevealHoldMs={activeFlight.flipRevealHoldMs}
            durationMs={activeFlight.durationMs}
            onComplete={onFlightComplete}
          />
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
  },
});
