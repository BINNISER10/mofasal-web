import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import SearchBar from '../../components/shared/SearchBar';
import ShopCard from '../../components/shared/ShopCard';
import ProductCard from '../../components/shared/ProductCard';
import EmptyState from '../../components/ui/EmptyState';

type SearchTab = 'shops' | 'products';

const MOCK_SHOPS = [
  { id: '1', name: 'خياط الرجال', image: 'https://via.placeholder.com/400x300/1B5E20/ffffff?text=خياط+الرجال', rating: 4.8, ratingCount: 124, distance: 1.2, estimatedArrival: 25, isFeatured: true, tags: ['خياطة رجالي'] },
  { id: '2', name: 'مشغل الأمير', image: 'https://via.placeholder.com/400x300/2E7D32/ffffff?text=مشغل+الأمير', rating: 4.6, ratingCount: 89, distance: 2.5, estimatedArrival: 35, tags: ['أطفال'] },
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'قماش صوف إيطالي', image: 'https://via.placeholder.com/200x200/D4AF37/000000?text=صوف', price: 180, merchantName: 'متجر الأقمشة', rating: 4.7 },
  { id: '2', name: 'قطن مصري فاخر', image: 'https://via.placeholder.com/200x200/1B5E20/ffffff?text=قطن', price: 95, merchantName: 'متجر الأقمشة', rating: 4.5 },
];

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('shops');

  const handleSearch = () => {
    // Perform search
  };

  const handleShopPress = (shopId: string) => {
    navigation.navigate('ShopDetail' as never, { shopId } as never);
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail' as never, { productId } as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder={t('common.search')}
            value={query}
            onChangeText={setQuery}
            onSubmit={handleSearch}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shops' && styles.tabActive]}
          onPress={() => setActiveTab('shops')}
        >
          <Text style={[styles.tabText, activeTab === 'shops' && styles.tabTextActive]}>
            المحلات
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            المنتجات
          </Text>
        </TouchableOpacity>
      </View>

      {query.trim() === '' ? (
        <EmptyState
          icon="🔍"
          title={t('common.search')}
          message="ابحث عن محلات الخياطة أو المنتجات"
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'shops' ? (
            MOCK_SHOPS.length === 0 ? (
              <EmptyState icon="🏪" title={t('common.noResults')} message="لا توجد محلات تطابق بحثك" />
            ) : (
              <View style={styles.shopsList}>
                {MOCK_SHOPS.map((shop) => (
                  <ShopCard key={shop.id} {...shop} onPress={handleShopPress} />
                ))}
              </View>
            )
          ) : (
            MOCK_PRODUCTS.length === 0 ? (
              <EmptyState icon="📦" title={t('common.noResults')} message="لا توجد منتجات تطابق بحثك" />
            ) : (
              <View style={styles.productsGrid}>
                {MOCK_PRODUCTS.map((product) => (
                  <ProductCard key={product.id} {...product} onPress={handleProductPress} />
                ))}
              </View>
            )
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.sm,
    backgroundColor: colors.white, gap: 12,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary },
  searchWrapper: { flex: 1 },
  tabs: {
    flexDirection: 'row', backgroundColor: colors.white,
    paddingHorizontal: spacing.lg, gap: 12,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  tab: { paddingVertical: spacing.md, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: fonts.sizes.md, color: colors.textSecondary, ...fonts.medium },
  tabTextActive: { color: colors.primary, ...fonts.bold },
  scrollContent: { padding: spacing.lg },
  shopsList: { flexDirection: 'column', gap: 12 },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
});

export default SearchScreen;
