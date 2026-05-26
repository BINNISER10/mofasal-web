import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils/theme';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRate,
}) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= maxStars; i++) {
      const filled = i <= Math.floor(rating);
      const halfFilled = !filled && i - rating < 1 && i - rating > 0;

      if (interactive && onRate) {
        stars.push(
          <TouchableOpacity key={i} onPress={() => onRate(i)}>
            <Text style={[styles.star, { fontSize: size }]}>
              {filled ? '★' : halfFilled ? '⯨' : '☆'}
            </Text>
          </TouchableOpacity>,
        );
      } else {
        stars.push(
          <Text key={i} style={[styles.star, { fontSize: size }]}>
            {filled ? '★' : halfFilled ? '⯨' : '☆'}
          </Text>,
        );
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  star: {
    color: colors.starActive,
  },
});

export default RatingStars;
