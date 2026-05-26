import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, borderRadius } from '../../utils/theme';

type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  color?: string;
  size?: BadgeSize;
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  color = colors.primary,
  size = 'md',
  style,
}) => {
  return (
    <View
      style={[
        styles.badge,
        styles[`size_${size}`],
        { backgroundColor: color + '20' },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, styles[`text_${size}`], { color }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  size_sm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  size_md: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  size_lg: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    ...fonts.medium,
  },
  text_sm: {
    fontSize: 11,
  },
  text_md: {
    fontSize: 12,
  },
  text_lg: {
    fontSize: 14,
  },
});

export default Badge;
