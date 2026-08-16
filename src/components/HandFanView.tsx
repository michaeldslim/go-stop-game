import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { getCardById } from '../cards/getCardById';
import { LayoutAnchor, anchorKeys } from './LayoutAnchor';
import { CardView } from './CardView';
import { CARD_DIMENSIONS } from '../constants/layout';
import type { CardId } from '../types/gameState';

interface HandFanViewProps {
  cardIds: CardId[];
  playerIndex?: number;
  playableCardIds?: Set<CardId>;
  hiddenCardIds?: Set<CardId>;
  onCardPress?: (cardId: CardId) => void;
  selected?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const FAN_MAX_ROTATION = 14;
const FAN_OVERLAP = 0.58;

export function HandFanView({
  cardIds,
  playerIndex = 0,
  playableCardIds,
  hiddenCardIds,
  onCardPress,
  selected = false,
  disabled = false,
  style,
}: HandFanViewProps) {
  const count = cardIds.length;
  const cardWidth = CARD_DIMENSIONS.hand.width;
  const cardHeight = CARD_DIMENSIONS.hand.height;

  if (count === 0) {
    return <View style={[styles.empty, style]} />;
  }

  const step = cardWidth * FAN_OVERLAP;
  const totalWidth = cardWidth + step * (count - 1);
  const centerIndex = (count - 1) / 2;

  return (
    <View style={[styles.container, { width: totalWidth, height: cardHeight + 18 }, style]}>
      {cardIds.map((cardId, index) => {
        const card = getCardById(cardId);
        const offset = (index - centerIndex) / Math.max(count - 1, 1);
        const rotation = offset * FAN_MAX_ROTATION * 2;
        const playable = playableCardIds?.has(cardId) ?? true;
        const isPlayable = playable && !disabled;
        const hidden = hiddenCardIds?.has(cardId) ?? false;

        return (
          <LayoutAnchor
            key={`fan-${cardId}`}
            anchorKey={anchorKeys.hand(playerIndex, cardId)}
            style={[
              styles.cardSlot,
              {
                left: index * step,
                transform: [{ rotate: `${rotation}deg` }],
                zIndex: index,
                opacity: hidden ? 0 : 1,
              },
            ]}
          >
            <CardView
              card={card}
              size="hand"
              onPress={onCardPress ? () => onCardPress(cardId) : undefined}
              disabled={!isPlayable}
              selected={selected && isPlayable}
            />
          </LayoutAnchor>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    position: 'relative',
  },
  empty: {
    height: CARD_DIMENSIONS.hand.height,
  },
  cardSlot: {
    position: 'absolute',
    bottom: 0,
  },
});
