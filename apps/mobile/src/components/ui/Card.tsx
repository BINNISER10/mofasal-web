import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../utils/theme';

interface CardProps {
  children: ReactNode;
  padding?: number;
  style?: ViewStyle;
  noShadow?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = spacing.lg,
  style,
  noShadow = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        { padding },
        noShadow && styles.noShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default Card;
