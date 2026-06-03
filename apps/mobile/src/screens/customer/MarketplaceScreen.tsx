import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
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
import { productsApi } from '../../services/api/products';

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
  inStock: true,
}));

const MarketplaceScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب الأقسام عند تحميل الصفحة
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productsApi.getCategories();
        setDbCategories(cats);
      } catch (err) {
        console.warn('Failed to fetch categories, using UI fallbacks:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let categoryId: string | undefined = undefined;
      if (selectedCategory !== 'all') {
        const matched = dbCategories.find(
          (c) =>
            c.slug?.toLowerCase() === selectedCategory.toLowerCase() ||
            c.name?.toLowerCase() === selectedCategory.toLowerCase()
        );
        if (matched) {
          categoryId = matched.id;
        }
      }

      const params = {
        categoryId,
        search: searchQuery || undefined,
        minPrice: priceRange[0] || undefined,
        maxPrice: priceRange[1] || undefined,
      };

      const rawProducts = await productsApi.list(params);
      if (rawProducts && rawProducts.length > 0) {
        const mapped = rawProducts.map((p: any) => ({
          id: p.id,
          name: p.nameAr || p.name,
          image: p.images && p.images.length > 0 ? p.images[0] : 'https://via.placeholder.com/200x200/D4AF37/000000?text=قماش',
          price: p.price,
          merchantName: p.shop?.name || 'متجر الأقمشة',
          rating: p.rating || 4.5,
          inStock: p.stockQuantity > 0,
        }));
        setProducts(mapped);
      } else {
        setProducts(MOCK_PRODUCTS);
      }
    } catch (error) {
      console.warn('Failed to load products from API, falling back to mocks:', error);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, priceRange, dbCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as never, { productId } as never);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await productsApi.addToCart(productId, 1);
      // يمكن إضافة تنبيه نجاح هنا
    } catch (error) {
      console.warn('Failed to add item to cart on server:', error);
    }
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

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.productGrid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
                onPress={handleProductPress}
                onAddToCart={handleAddToCart}
              />
            ))}
          </View>
        </ScrollView>
      )}

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
          onPress={() => {
            setShowFilter(false);
            fetchProducts();
          }}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MarketplaceScreen;
