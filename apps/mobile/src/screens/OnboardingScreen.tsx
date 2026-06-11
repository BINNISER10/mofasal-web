import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { colors, fonts, borderRadius } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onDone: () => void;
}

const SLIDES = [
  {
    id: '1',
    emoji: '✂️',
    bg: colors.primary,
    titleAr: 'خيّط ملابسك\nبكل سهولة',
    descAr: 'اختر من أفضل الخياطين المعتمدين في مدينتك وصمّم ملابسك على مقاسك الخاص',
    accent: '#4dd8e0',
  },
  {
    id: '2',
    emoji: '📏',
    bg: '#481719',
    titleAr: 'قياس منزلي\nمجاني',
    descAr: 'فني متخصص يأتي إليك في المنزل أو العمل لأخذ مقاساتك بدقة عالية واحترافية تامة',
    accent: '#e08080',
  },
  {
    id: '3',
    emoji: '🚚',
    bg: '#735B4D',
    titleAr: 'تتبع طلبك\nخطوة بخطوة',
    descAr: 'تابع حالة طلبك لحظة بلحظة من أخذ المقاس حتى التوصيل لباب منزلك مع ضمان الجودة',
    accent: '#c4a882',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onDone }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
      setActiveIndex(activeIndex + 1);
    } else {
      onDone();
    }
  };

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { backgroundColor: item.bg, width }]}>
      <View style={styles.illustrationWrapper}>
        <View style={[styles.illustrationCircle, { borderColor: item.accent + '40' }]}>
          <View style={[styles.illustrationInner, { backgroundColor: item.accent + '20' }]}>
            <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
          </View>
        </View>
        <View style={[styles.decorDot1, { backgroundColor: item.accent }]} />
        <View style={[styles.decorDot2, { backgroundColor: item.accent }]} />
        <View style={[styles.decorDot3, { backgroundColor: item.accent }]} />
      </View>

      <Text style={[styles.slideTitle, { color: colors.white }]}>
        {item.titleAr}
      </Text>
      <Text style={[styles.slideDesc, { color: colors.white }]}>
        {item.descAr}
      </Text>
    </View>
  );

  const currentSlide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={currentSlide.bg} />

      <TouchableOpacity style={styles.skipButton} onPress={onDone}>
        <Text style={styles.skipText}>تخطّى</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
      />

      <View style={[styles.bottomSection, { backgroundColor: currentSlide.bg }]}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity: dotOpacity,
                    backgroundColor: currentSlide.accent,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: colors.white }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextButtonText, { color: currentSlide.bg }]}>
            {isLast ? 'ابدأ الآن 🎉' : 'التالي ←'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    left: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  skipText: {
    color: colors.white,
    fontSize: 14,
    ...fonts.medium,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 40,
    minHeight: height * 0.72,
  },
  illustrationWrapper: {
    position: 'relative',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 70,
  },
  decorDot1: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 20,
    right: 20,
    opacity: 0.7,
  },
  decorDot2: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 30,
    left: 20,
    opacity: 0.5,
  },
  decorDot3: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    top: 50,
    left: 40,
    opacity: 0.4,
  },
  slideTitle: {
    fontSize: 34,
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
    ...fonts.bold,
  },
  slideDesc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 26,
    opacity: 0.85,
    ...fonts.regular,
    paddingHorizontal: 8,
  },
  bottomSection: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 24,
    alignItems: 'center',
    gap: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    fontSize: 18,
    ...fonts.bold,
  },
});

export default OnboardingScreen;
