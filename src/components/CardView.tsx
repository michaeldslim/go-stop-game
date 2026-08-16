import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { getCardBackSource, getCardImageSource } from '../cards/getCardImage';
import { colors } from '../constants/colors';
import { CARD_BORDER_RADIUS, CARD_DIMENSIONS } from '../constants/layout';
import type { CardDefinition, CardSize } from '../types/hwatu';

interface CardViewProps {
  card: CardDefinition;
  size?: CardSize;
  faceDown?: boolean;
}

export function CardView({ card, size = 'table', faceDown = false }: CardViewProps) {
  const dimensions = CARD_DIMENSIONS[size];

  if (faceDown) {
    return (
      <View style={[styles.card, dimensions, styles.shadow]}>
        <Image source={getCardBackSource()} style={styles.image} contentFit="contain" transition={200} />
      </View>
    );
  }

  return (
    <View style={[styles.card, dimensions, styles.shadow]}>
      <Image
        source={getCardImageSource(card)}
        style={styles.image}
        contentFit="contain"
        transition={200}
        accessibilityLabel={card.labels.ko}
      />
    </View>
  );
}

/** Alias matching plan naming */
export const Card = CardView;

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
});
