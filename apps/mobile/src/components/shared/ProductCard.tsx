import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import RatingStars from './RatingStars';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;
const IMAGE_HEIGHT = 140;

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  merchantName?: string;
  rating?: number;
  inStock?: boolean;
  onPress: (id: string) => void;
  onAddToCart?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  price,
  merchantName,
  rating,
  inStock = true,
  onPress,
  onAddToCart,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(id)}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        {!inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>غير متوفر</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{name}</Text>
        {merchantName && (
          <Text style={styles.merchant} numberOfLines={1}>{merchantName}</Text>
        )}
        {rating !== undefined && (
          <View style={styles.ratingRow}>
            <RatingStars rating={rating} size={10} />
          </View>
        )}
        <Text style={styles.price}>{formatCurrency(price)}</Text>
        {onAddToCart && inStock && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(id)}
          >
            <Text style={styles.addButtonText}>أضف للسلة</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.sm,
    overflow: 'hidden',
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 13,
    ...fonts.bold,
  },
  content: {
    padding: spacing.sm,
  },
  name: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
    textAlign: 'right',
    marginBottom: 2,
  },
  merchant: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  price: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
    textAlign: 'right',
    marginBottom: 6,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 12,
    ...fonts.medium,
  },
});

export default ProductCard;
