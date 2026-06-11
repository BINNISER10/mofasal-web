import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { useLocation } from '../../hooks/useLocation';
import SearchBar from '../../components/shared/SearchBar';
import ShopCard from '../../components/shared/ShopCard';
import ProductCard from '../../components/shared/ProductCard';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { HomeStackParamList } from '../../navigation/stacks/HomeStack';
import { shopsApi } from '../../services/api/shops';
import { productsApi } from '../../services/api/products';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 160;

type HomeNavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

const BANNERS = [
  { id: '1', title: 'تصاميم عصرية بخامات ممتازة', subtitle: 'احصل على إطلالتك المميزة', color: '#1B5E20' },
  { id: '2', title: 'خدمة قياس منزلية مجانية', subtitle: 'نأتي إليك أينما كنت', color: '#2E7D32' },
  { id: '3', title: 'سوق الأقمشة بأفضل الأسعار', subtitle: 'تشكيلة واسعة من الأقمشة الفاخرة', color: '#D4AF37' },
];

const CATEGORIES = [
  { id: '1', emoji: '🧣', label: 'ثوب رجالي', color: '#00373E' },
  { id: '2', emoji: '👘', label: 'بشت', color: '#481719' },
  { id: '3', emoji: '👔', label: 'بدلة', color: '#1a4a6b' },
  { id: '4', emoji: '✂️', label: 'تعديل', color: '#735B4D' },
  { id: '5', emoji: '�', label: 'قميص', color: '#6b1a4a' },
  { id: '6', emoji: '👦', label: 'أطفال', color: '#1a6b3a' },
  { id: '7', emoji: '🎽', label: 'رياضي', color: '#4a3a6b' },
  { id: '8', emoji: '🧥', label: 'معطف', color: '#3a2a1a' },
];

const MOCK_SHOPS = [
  { id: '1', name: 'خياط الرجال', image: 'https://via.placeholder.com/400x300/1B5E20/ffffff?text=خياط+الرجال', rating: 4.8, ratingCount: 124, distance: 1.2, estimatedArrival: 25, isFeatured: true, tags: ['خياطة رجالي', 'توصيل'] },
  { id: '2', name: 'مشغل الأمير', image: 'https://via.placeholder.com/400x300/2E7D32/ffffff?text=مشغل+الأمير', rating: 4.6, ratingCount: 89, distance: 2.5, estimatedArrival: 35, tags: ['أطفال', 'رجالي'] },
  { id: '3', name: 'بيت البشوت الماسية', image: 'https://via.placeholder.com/400x300/D4AF37/000000?text=الماسية', rating: 4.9, ratingCount: 203, distance: 0.8, estimatedArrival: 15, isFeatured: true, tags: ['بشوت ومشالح', 'تعديل'] },
  { id: '4', name: 'محل الفخامة', image: 'https://via.placeholder.com/400x300/1B5E20/ffffff?text=الفخامة', rating: 4.5, ratingCount: 67, distance: 3.8, estimatedArrival: 40, tags: ['أقمشة', 'خياطة'] },
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'قماش صوف إيطالي', image: 'https://via.placeholder.com/200x200/D4AF37/000000?text=صوف', price: 180, merchantName: 'متجر الأقمشة', rating: 4.7 },
  { id: '2', name: 'قماش قطن مصري', image: 'https://via.placeholder.com/200x200/1B5E20/ffffff?text=قطن', price: 95, merchantName: 'متجر الأقمشة', rating: 4.5 },
  { id: '3', name: 'حرير طبيعي', image: 'https://via.placeholder.com/200x200/D4AF37/000000?text=حرير', price: 250, merchantName: 'متجر الحرير', rating: 4.8 },
  { id: '4', name: 'كتان بلجيكي', image: 'https://via.placeholder.com/200x200/2E7D32/ffffff?text=كتان', price: 140, merchantName: 'متجر الأقمشة', rating: 4.3 },
];

const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<HomeNavProp>();
  const { location, getFormattedDistance } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBanner, setActiveBanner] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      const [shopsData, productsData] = await Promise.all([
        shopsApi.list({ limit: 10 }),
        productsApi.list({ limit: 4 }),
      ]);
      setShops(shopsData.length > 0 ? shopsData : MOCK_SHOPS);
      setProducts(productsData.length > 0 ? productsData : MOCK_PRODUCTS);
    } catch (error) {
      console.error('Failed to load home data from API:', error);
      setShops(MOCK_SHOPS);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  useEffect(() => {
    if (loading) return;
    const interval = setInterval(() => {
      const next = (activeBanner + 1) % BANNERS.length;
      setActiveBanner(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [activeBanner, loading]);

  const handleShopPress = useCallback((shopId: string) => {
    navigation.navigate('ShopDetail', { shopId });
  }, [navigation]);

  const handleProductPress = useCallback((productId: string) => {
    // Navigate to product detail in marketplace
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to search results
    }
  };

  const renderBanner = ({ item }: { item: typeof BANNERS[0] }) => (
    <View style={[styles.banner, { backgroundColor: item.color }]}>
      <Text style={styles.bannerTitle}>{item.title}</Text>
      <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
      <Button
        title={t('home.bookNow')}
        onPress={() => {}}
        variant="secondary"
        size="sm"
      />
    </View>
  );

  const renderSection = (
    title: string,
    onViewAll?: () => void,
  ) => (
    <View style={styles.sectionHeader}>
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAll}>{t('common.viewAll')}</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationLabel}>{t('home.deliverTo')}</Text>
          <Text style={styles.locationCity}>
            {location?.city || 'الرياض'} ▼
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifButton}>
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          placeholder={t('home.searchShops')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={BANNERS}
            renderItem={renderBanner}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
              setActiveBanner(idx);
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
          />
          <View style={styles.dotsContainer}>
            {BANNERS.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  idx === activeBanner && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>تسوّق حسب الفئة</Text>
          </View>
          <FlatList
            data={CATEGORIES}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.categoryItem} activeOpacity={0.75}>
                <View style={[styles.categoryIcon, { backgroundColor: item.color + '18' }]}>
                  <Text style={styles.categoryEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.categoryLabel} numberOfLines={1}>{item.label}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Nearest Shops */}
        <View style={styles.section}>
          {renderSection(t('home.nearestToYou'))}
          <FlatList
            data={shops}
            renderItem={({ item }) => (
              <ShopCard
                {...item}
                distance={item.distance}
                estimatedArrival={item.estimatedArrival}
                onPress={handleShopPress}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Top Rated */}
        <View style={styles.section}>
          {renderSection(t('home.topRated'))}
          <FlatList
            data={[...shops].sort((a, b) => b.rating - a.rating)}
            renderItem={({ item }) => (
              <ShopCard
                {...item}
                distance={item.distance}
                estimatedArrival={item.estimatedArrival}
                onPress={handleShopPress}
              />
            )}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* Fabric Marketplace */}
        <View style={styles.section}>
          {renderSection(t('home.fabricMarketplace'))}
          <View style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onPress={handleProductPress}
              />
            ))}
          </View>
        </View>

        {/* On-Site Measurement CTA */}
        <Card style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>{t('home.onSiteMeasurement')}</Text>
          <Text style={styles.ctaDescription}>
            {t('home.onSiteDescription')}
          </Text>
          <Button
            title={t('home.bookNow')}
            onPress={() => {
              const defaultShopId = shops[0]?.id || '1';
              navigation.navigate('ServiceRequest', { shopId: defaultShopId, serviceType: 'ON_SITE_MEASUREMENT' });
            }}
            variant="primary"
            size="md"
            style={styles.ctaButton}
          />
        </Card>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  locationButton: {
    alignItems: 'flex-start',
  },
  locationLabel: {
    fontSize: 11,
    color: colors.textLight,
  },
  locationCity: {
    fontSize: 15,
    color: colors.textPrimary,
    ...fonts.bold,
    marginTop: 2,
  },
  notifButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIcon: {
    fontSize: 20,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  bannerContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  banner: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    justifyContent: 'center',
    marginRight: 16,
  },
  bannerTitle: {
    fontSize: fonts.sizes.xxl,
    color: colors.white,
    ...fonts.bold,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.md,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 20,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  viewAll: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.medium,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  ctaCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  ctaTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.white,
    ...fonts.bold,
    marginBottom: spacing.sm,
    textAlign: 'right',
  },
  ctaDescription: {
    fontSize: fonts.sizes.md,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
    textAlign: 'right',
    lineHeight: 22,
  },
  ctaButton: {
    alignSelf: 'flex-start',
  },
  bottomPadding: {
    height: 80,
  },
  categoriesSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
  },
  categoriesList: {
    paddingHorizontal: spacing.lg,
    gap: 12,
  },
  categoryItem: {
    alignItems: 'center',
    width: 72,
    gap: 6,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryLabel: {
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    ...fonts.medium,
  },
});

export default HomeScreen;
