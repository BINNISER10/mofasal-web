import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, fonts, borderRadius, spacing } from '../../utils/theme';

interface Chip {
  id: string;
  label: string;
  icon?: string;
}

interface CategoryChipsProps {
  chips: Chip[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({
  chips,
  selectedId,
  onSelect,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map((chip) => {
        const isSelected = chip.id === selectedId;
        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(chip.id)}
            activeOpacity={0.7}
          >
            {chip.icon && <Text style={styles.chipIcon}>{chip.icon}</Text>}
            <Text
              style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    ...fonts.medium,
  },
  chipLabelSelected: {
    color: colors.white,
    ...fonts.bold,
  },
});

export default CategoryChips;
