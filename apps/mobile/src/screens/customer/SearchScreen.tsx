import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import SearchBar from '../../components/shared/SearchBar';
import ShopCard from '../../components/shared/ShopCard';
import ProductCard from '../../components/shared/ProductCard';
import EmptyState from '../../components/ui/EmptyState';
import { shopsApi } from '../../services/api/shops';
import { productsApi } from '../../services/api/products';

type SearchTab = 'shops' | 'products';

const FALLBACK_SHOPS = [
  { id: '1', name: 'خياط الرجال', image: 'https://via.placeholder.com/400x300/1B5E20/ffffff?text=خياط+الرجال', rating: 4.8, ratingCount: 124, distance: 1.2, estimatedArrival: 25, tags: ['خياطة رجالي'] },
  { id: '2', name: 'مشغل الأمير', image: 'https://via.placeholder.com/400x300/2E7D32/ffffff?text=مشغل+الأمير', rating: 4.6, ratingCount: 89, distance: 2.5, estimatedArrival: 35, tags: ['أطفال'] },
];

const FALLBACK_PRODUCTS = [
  { id: '1', name: 'قماش صوف إيطالي', image: 'https://via.placeholder.com/200x200/D4AF37/000000?text=صوف', price: 180, merchantName: 'متجر الأقمشة', rating: 4.7 },
  { id: '2', name: 'قطن مصري فاخر', image: 'https://via.placeholder.com/200x200/1B5E20/ffffff?text=قطن', price: 95, merchantName: 'متجر الأقمشة', rating: 4.5 },
];

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('shops');
  const [shops, setShops] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setShops([]); setProducts([]); return; }
    setLoading(true);
    const search = query.trim();
    Promise.all([
      shopsApi.list({ search, limit: 10 }).catch(() => []),
      productsApi.list({ search, limit: 10 }).catch(() => []),
    ]).then(([sRes, pRes]) => {
      const sData = Array.isArray(sRes) ? sRes : (sRes as any)?.shops || [];
      const pData = Array.isArray(pRes) ? pRes : (pRes as any)?.products || [];
      setShops(sData.length > 0 ? sData : []);
      setProducts(pData.length > 0 ? pData : []);
    }).catch(() => {
      setShops(FALLBACK_SHOPS.filter(s => s.name.includes(search)));
      setProducts(FALLBACK_PRODUCTS.filter(p => p.name.includes(search)));
    }).finally(() => setLoading(false));
  }, [query]);

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
      ) : loading ? (
        <ActivityIndicator size="large" color={colors.primary[500]} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'shops' ? (
            shops.length === 0 ? (
              <EmptyState icon="🏪" title={t('common.noResults')} message="لا توجد محلات تطابق بحثك" />
            ) : (
              <View style={styles.shopsList}>
                {shops.map((shop) => (
                  <ShopCard key={shop.id} {...shop} onPress={handleShopPress} />
                ))}
              </View>
            )
          ) : (
            products.length === 0 ? (
              <EmptyState icon="📦" title={t('common.noResults')} message="لا توجد منتجات تطابق بحثك" />
            ) : (
              <View style={styles.productsGrid}>
                {products.map((product) => (
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
