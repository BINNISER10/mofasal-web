import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { MEASUREMENT_CATEGORIES, MEASUREMENT_LABELS } from '../../utils/constants';

interface MeasurementData {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  bicep?: number;
  forearm?: number;
  wrist?: number;
  sleeveLength?: number;
  shirtLength?: number;
  waistLower?: number;
  hips?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  inseam?: number;
  outseam?: number;
  trouserLength?: number;
  [key: string]: number | undefined;
}

interface MeasurementViewProps {
  measurements: MeasurementData;
  title?: string;
  date?: string;
}

const MeasurementView: React.FC<MeasurementViewProps> = ({
  measurements,
  title,
  date,
}) => {
  const renderCategory = (category: keyof typeof MEASUREMENT_CATEGORIES) => {
    const config = MEASUREMENT_CATEGORIES[category];
    const fields = config.fields as string[];

    return (
      <View key={category} style={styles.category}>
        <Text style={styles.categoryTitle}>{config.label}</Text>
        <View style={styles.grid}>
          {fields.map((field) => {
            const value = measurements[field];
            if (value === undefined || value === null) return null;
            return (
              <View key={field} style={styles.measurementItem}>
                <Text style={styles.measurementValue}>{value}</Text>
                <Text style={styles.measurementUnit}>سم</Text>
                <Text style={styles.measurementLabel}>
                  {MEASUREMENT_LABELS[field] || field}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {date && <Text style={styles.date}>{date}</Text>}
      {renderCategory('upper_body')}
      {renderCategory('lower_body')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  title: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    ...fonts.bold,
  },
  date: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  category: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'right',
    ...fonts.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  measurementItem: {
    width: '30%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  measurementUnit: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: -2,
  },
  measurementLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default MeasurementView;
