import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet } from 'react-native';
import { colors, borderRadius } from '../../utils/theme';

interface AnimatedTrackingStepProps {
  status: string;
  completed: boolean;
  active: boolean;
  isLast: boolean;
}

const STAGE_ICONS: Record<string, string> = {
  received: '📩',
  staff_on_way: '🚗',
  taking_measurements: '📏',
  cutting_fabric: '✂️',
  sewing_assembly: '🧵',
  ironing_finishing: '🔥',
  packing_wrapping: '📦',
  on_way_to_you: '✈️',
  delivered: '🤝',
};

const AnimatedTrackingStep: React.FC<AnimatedTrackingStepProps> = ({
  status,
  completed,
  active,
  isLast,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (active) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();

      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      if (status === 'on_way_to_you') rotate.start();

      const bob = Animated.loop(
        Animated.sequence([
          Animated.timing(translateYAnim, {
            toValue: -5,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateYAnim, {
            toValue: 5,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      if (status === 'staff_on_way') bob.start();

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }

    if (completed) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      pulseAnim.setValue(1);
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      translateYAnim.setValue(0);
      opacityAnim.setValue(0.3);
    };
  }, [active, completed]);

  const getPulseStyle = () => {
    if (!active) return {};
    return {
      transform: [{ scale: pulseAnim }],
      opacity: opacityAnim,
    };
  };

  const getIconStyle = () => {
    const transforms: any[] = [];

    if (completed && !scaleAnim._value) {
      transforms.push({ scale: scaleAnim });
    }

    if (status === 'on_way_to_you' && active) {
      const rotateInterpolation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });
      transforms.push({ rotate: rotateInterpolation });
    }

    if (status === 'staff_on_way' && active) {
      transforms.push({ translateY: translateYAnim });
    }

    return { transform: transforms };
  };

  const circleBg = completed
    ? colors.primary
    : active
    ? colors.gold
    : colors.border;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          completed && styles.completedPulse,
          active && styles.activePulse,
          getPulseStyle(),
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          { backgroundColor: circleBg },
          getIconStyle(),
        ]}
      >
        <Text style={styles.icon}>
          {completed ? '✓' : STAGE_ICONS[status] || '○'}
        </Text>
      </Animated.View>
      {!isLast && (
        <View
          style={[
            styles.line,
            completed && styles.lineCompleted,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
  },
  completedPulse: {
    backgroundColor: colors.primary + '20',
  },
  activePulse: {
    backgroundColor: colors.gold + '30',
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  icon: {
    fontSize: 14,
    color: colors.white,
  },
  line: {
    width: 2,
    height: 30,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: colors.primary,
  },
});

export default AnimatedTrackingStep;
