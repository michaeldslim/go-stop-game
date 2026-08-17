import { useState } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { getCardById } from '../cards/getCardById';
import { LayoutAnchor, anchorKeys } from './LayoutAnchor';
import { CardView } from './CardView';
import { CARD_DIMENSIONS } from '../constants/layout';
import type { CardId } from '../types/gameState';
import type { CardSize } from '../types/hwatu';

interface HandFanViewProps {
  cardIds: CardId[];
  playerIndex?: number;
  playableCardIds?: Set<CardId>;
  hiddenCardIds?: Set<CardId>;
  highlightedCardIds?: Set<CardId>;
  onCardPress?: (cardId: CardId) => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  size?: CardSize;
  /** Human hand fans upward; opponent hand at top fans downward toward the table */
  fanDirection?: 'up' | 'down';
  style?: StyleProp<ViewStyle>;
}

const FAN_MAX_ROTATION = 14;
const FAN_OVERLAP = 0.58;

export function HandFanView({
  cardIds,
  playerIndex = 0,
  playableCardIds,
  hiddenCardIds,
  highlightedCardIds,
  onCardPress,
  selected = false,
  disabled = false,
  faceDown = false,
  fanDirection = 'up',
  size = 'hand',
  style,
}: HandFanViewProps) {
  const count = cardIds.length;
  const { width: cardWidth, height: cardHeight } = CARD_DIMENSIONS[size];
  const rotationSign = fanDirection === 'up' ? 1 : -1;
  const fanPadding = Math.round(cardHeight * 0.15);
  const [viewportWidth, setViewportWidth] = useState(0);

  if (count === 0) {
    return <View style={[styles.empty, { height: cardHeight }, style]} />;
  }

  const step = cardWidth * FAN_OVERLAP;
  const totalWidth = cardWidth + step * (count - 1);
  const centerIndex = (count - 1) / 2;
  const containerHeight = cardHeight + fanPadding;
  const needsScroll = viewportWidth > 0 && totalWidth > viewportWidth;

  const fan = (
    <View style={[styles.container, { width: totalWidth, height: containerHeight }]}>
      {cardIds.map((cardId, index) => {
        const card = getCardById(cardId);
        const offset = (index - centerIndex) / Math.max(count - 1, 1);
        const rotation = offset * FAN_MAX_ROTATION * 2 * rotationSign;
        const playable = playableCardIds?.has(cardId) ?? true;
        const isPlayable = playable && !disabled;
        const hidden = hiddenCardIds?.has(cardId) ?? false;
        const highlighted = highlightedCardIds?.has(cardId) ?? false;

        return (
          <LayoutAnchor
            key={`fan-${cardId}`}
            anchorKey={anchorKeys.hand(playerIndex, cardId)}
            style={[
              styles.cardSlot,
              fanDirection === 'up' ? styles.cardSlotUp : styles.cardSlotDown,
              {
                left: index * step,
                transform: [{ rotate: `${rotation}deg` }],
                zIndex: highlighted ? count + 1 : index,
                opacity: hidden ? 0 : 1,
              },
            ]}
          >
            <CardView
              card={card}
              size={size}
              faceDown={faceDown}
              onPress={onCardPress ? () => onCardPress(cardId) : undefined}
              disabled={!isPlayable}
              selected={(selected && isPlayable) || highlighted}
              style={highlighted ? styles.highlightedCard : disabled && !highlighted ? styles.dimmedCard : undefined}
            />
          </LayoutAnchor>
        );
      })}
    </View>
  );

  return (
    <View
      style={[styles.wrapper, { height: containerHeight }, style]}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
    >
      {needsScroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
        >
          {fan}
        </ScrollView>
      ) : (
        fan
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    position: 'relative',
  },
  empty: {
    alignSelf: 'center',
  },
  cardSlot: {
    position: 'absolute',
  },
  cardSlotUp: {
    bottom: 0,
  },
  cardSlotDown: {
    top: 0,
  },
  highlightedCard: {
    opacity: 1,
  },
  dimmedCard: {
    opacity: 0.45,
  },
});
