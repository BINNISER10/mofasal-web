'use client';
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { colors, fonts } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const bgScale = useRef(new Animated.Value(1.2)).current;

  useEffect(() => {
    Animated.sequence([
      // Background zoom in
      Animated.timing(bgScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Logo pop in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Tagline slide up
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Loading dots
      Animated.timing(dotsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(800),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Animated.View style={[styles.bgCircle, { transform: [{ scale: bgScale }] }]} />
      <Animated.View style={[styles.bgCircle2, { transform: [{ scale: bgScale }] }]} />

      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoArabic}>م</Text>
        </View>
        <Text style={styles.logoText}>مفصّل</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.taglineWrapper,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineY }],
          },
        ]}
      >
        <Text style={styles.tagline}>خياطتك راقية بتفاصيلها</Text>
        <View style={styles.taglineDivider} />
        <Text style={styles.taglineEn}>Tailored to Perfection</Text>
      </Animated.View>

      <Animated.View style={[styles.loadingDots, { opacity: dotsOpacity }]}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: colors.primaryLight,
    opacity: 0.15,
    top: -width * 0.5,
    right: -width * 0.3,
  },
  bgCircle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: colors.primaryDark,
    opacity: 0.3,
    bottom: -width * 0.4,
    left: -width * 0.3,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  logoArabic: {
    fontSize: 48,
    color: colors.primary,
    ...fonts.bold,
  },
  logoText: {
    fontSize: 36,
    color: colors.white,
    ...fonts.bold,
    letterSpacing: 2,
  },
  taglineWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  tagline: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.9,
    ...fonts.medium,
  },
  taglineDivider: {
    width: 40,
    height: 2,
    backgroundColor: colors.white,
    opacity: 0.4,
    borderRadius: 1,
  },
  taglineEn: {
    fontSize: 13,
    color: colors.white,
    opacity: 0.6,
    letterSpacing: 1,
  },
  loadingDots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    opacity: 0.4,
  },
  dotActive: {
    width: 24,
    opacity: 0.9,
    backgroundColor: colors.white,
  },
});

export default SplashScreen;
