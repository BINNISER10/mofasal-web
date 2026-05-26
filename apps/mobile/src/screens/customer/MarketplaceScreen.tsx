import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import SearchBar from '../../components/shared/SearchBar';
import CategoryChips from '../../components/shared/CategoryChips';
import ProductCard from '../../components/shared/ProductCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '📋' },
  { id: 'fabrics', label: 'أقمشة', icon: '🧵' },
  { id: 'threads', label: 'خيوط', icon: '🧶' },
  { id: 'buttons', label: 'أزرار', icon: '🔘' },
  { id: 'zippers', label: 'سحابات', icon: '🤐' },
  { id: 'accessories', label: 'إكسسوارات', icon: '💎' },
  { id: 'linings', label: 'بطانات', icon: '🧣' },
];

const MOCK_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: String(i + 1),
  name: ['قماش صوف إيطالي', 'قطن مصري فاخر', 'حرير طبيعي', 'كتان بلجيكي', 'مخمل فاخر', 'شيفون فرنسي', 'دانتيل مطرز', 'صوف ميرينو'][i],
  image: `https://via.placeholder.com/200x200/${['1B5E20', '2E7D32', 'D4AF37', '1B5E20', '2E7D32', 'D4AF37', '1B5E20', '2E7D32'][i]}/ffffff?text=${encodeURIComponent(['قماش', 'قطن', 'حرير', 'كتان', 'مخمل', 'شيفون', 'دانتيل', 'صوف'][i])}`,
  price: [180, 95, 250, 140, 200, 160, 120, 220][i],
  merchantName: 'متجر الأقمشة',
  rating: [4.7, 4.5, 4.8, 4.3, 4.6, 4.4, 4.2, 4.9][i],
}));

const MarketplaceScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as never, { productId } as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('marketplace.title')}</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart' as never)}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>2</Text></View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <SearchBar
          placeholder={t('marketplace.searchProducts')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilter(true)}>
          <Text style={styles.filterIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <CategoryChips
        chips={CATEGORIES}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.productGrid}>
          {MOCK_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onPress={handleProductPress}
            />
          ))}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilter} onClose={() => setShowFilter(false)} title="تصفية">
        <Text style={styles.filterLabel}>نطاق السعر</Text>
        <Text style={styles.priceDisplay}>{priceRange[0]} - {priceRange[1]} ر.س</Text>
        <View style={styles.sliderContainer}>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={1000}
            value={priceRange[1]}
            onValueChange={(val) => setPriceRange([priceRange[0], Math.round(val)])}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
        </View>
        <Button
          title="تطبيق"
          onPress={() => setShowFilter(false)}
          variant="primary"
          size="lg"
          fullWidth
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  cartButton: {
    position: 'relative',
    padding: 4,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    gap: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    marginBottom: spacing.sm,
    ...fonts.medium,
  },
  priceDisplay: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    textAlign: 'center',
    ...fonts.bold,
    marginBottom: spacing.md,
  },
  sliderContainer: {
    marginBottom: spacing.xxl,
  },
});

export default MarketplaceScreen;
