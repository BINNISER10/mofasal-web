import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../utils/theme';
import { ORDER_STATUS_AR } from '../../utils/constants';
import AnimatedTrackingStep from './AnimatedTrackingStep';

interface TrackingStepData {
  status: string;
  label?: string;
  description?: string;
  timestamp: string | null;
  completed: boolean;
  active: boolean;
}

interface OrderTrackingTimelineProps {
  steps: TrackingStepData[];
}

const ORDER_STAGES = [
  'received',
  'staff_on_way',
  'taking_measurements',
  'cutting_fabric',
  'sewing_assembly',
  'ironing_finishing',
  'packing_wrapping',
  'on_way_to_you',
  'delivered',
];

const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ steps }) => {
  const timelineSteps = ORDER_STAGES.map((stage) => {
    const step = steps.find((s) => s.status === stage);
    return {
      status: stage,
      label: ORDER_STATUS_AR[stage as keyof typeof ORDER_STATUS_AR] || stage,
      timestamp: step?.timestamp || null,
      completed: step?.completed || false,
      active: step?.active || false,
    };
  });

  return (
    <View style={styles.container}>
      {timelineSteps.map((step, index) => (
        <View key={step.status} style={styles.stepRow}>
          <View style={styles.timelineLeft}>
            <AnimatedTrackingStep
              status={step.status}
              completed={step.completed}
              active={step.active}
              isLast={index === timelineSteps.length - 1}
            />
          </View>
          <View style={styles.stepContent}>
            <Text
              style={[
                styles.stepLabel,
                step.completed && styles.completedLabel,
                step.active && styles.activeLabel,
              ]}
            >
              {step.label}
            </Text>
            {step.timestamp && (
              <Text style={styles.timestamp}>{step.timestamp}</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeft: {
    width: 50,
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
    paddingRight: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    ...fonts.medium,
    textAlign: 'right',
  },
  completedLabel: {
    color: colors.primary,
    ...fonts.bold,
  },
  activeLabel: {
    color: colors.gold,
    ...fonts.bold,
  },
  timestamp: {
    fontSize: fonts.sizes.xs,
    color: colors.textLight,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default OrderTrackingTimeline;
