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
import { formatDistance, getETA } from '../../utils/helpers';
import Badge from '../ui/Badge';
import RatingStars from './RatingStars';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;
const CARD_HEIGHT = 220;

interface ShopCardProps {
  id: string;
  name: string;
  image: string;
  logo?: string;
  rating: number;
  ratingCount: number;
  distance?: number;
  estimatedArrival?: number;
  isOpen?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  onPress: (id: string) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({
  id,
  name,
  image,
  logo,
  rating,
  ratingCount,
  distance,
  estimatedArrival,
  isOpen = true,
  isFeatured = false,
  tags,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(id)}
      style={styles.card}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.image} />
        {logo && (
          <View style={styles.logoContainer}>
            <Image source={{ uri: logo }} style={styles.logo} />
          </View>
        )}
        {isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>مميز</Text>
          </View>
        )}
        {!isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>مغلق</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={styles.ratingRow}>
          <RatingStars rating={rating} size={12} />
          <Text style={styles.ratingCount}>({ratingCount})</Text>
        </View>
        <View style={styles.infoRow}>
          {distance !== undefined && (
            <Text style={styles.infoText}>{formatDistance(distance)}</Text>
          )}
          {estimatedArrival !== undefined && (
            <Text style={styles.infoText}>• {getETA(estimatedArrival)}</Text>
          )}
        </View>
        {tags && tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.slice(0, 2).map((tag, idx) => (
              <Badge key={idx} label={tag} size="sm" color={colors.gold} />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginRight: 12,
    ...shadows.md,
    overflow: 'hidden',
  },
  imageContainer: {
    height: CARD_HEIGHT * 0.55,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -20,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  featuredText: {
    color: colors.white,
    fontSize: 10,
    ...fonts.bold,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: colors.white,
    fontSize: 16,
    ...fonts.bold,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg + 8,
  },
  name: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingCount: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 4,
  },
});

export default ShopCard;
