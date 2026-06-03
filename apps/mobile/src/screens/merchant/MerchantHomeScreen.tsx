import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { productsApi, Product } from '../../services/api/products';
import { useAuthContext } from '../../services/auth/AuthContext';

const MerchantHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // جلب المنتجات الخاصة بالتاجر الحالي
      const list = await productsApi.list();
      const filtered = list.filter((p) => p.merchantId === user?.id);
      setProducts(filtered);
    } catch (e) {
      console.error('Failed to fetch merchant products', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = (id: string) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد من رغبتك في حذف هذا المنتج؟', [
      { text: 'تراجع', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            await productsApi.remove(id);
            Alert.alert('نجاح', 'تم حذف المنتج بنجاح');
            fetchProducts();
          } catch (e) {
            Alert.alert('خطأ', 'فشل حذف المنتج');
          }
        },
      },
    ]);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <Card style={styles.productCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.productPrice}>{item.price} ر.س / م</Text>
          <Text style={styles.productName}>{item.nameAr || item.name}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <Text style={styles.stockText}>
            المخزون المتوفر: {item.stockQuantity} متر |{' '}
            <Text style={{ color: item.stockQuantity > 0 ? colors.success : colors.error }}>
              {item.stockQuantity > 0 ? 'متوفر' : 'منفذ'}
            </Text>
          </Text>
          {item.descriptionAr || item.description ? (
            <Text style={styles.descText} numberOfLines={2}>
              {item.descriptionAr || item.description}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.error }]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={[styles.actionText, { color: colors.error }]}>حذف</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { borderColor: colors.primary }]}
            onPress={() => navigation.navigate('MerchantProfileTab', {
              screen: 'MerchantProductForm',
              params: { product: item }
            })}
          >
            <Text style={[styles.actionText, { color: colors.primary }]}>تعديل</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة الأقمشة والمخزون</Text>
      </View>

      <View style={styles.subheader}>
        <Button
          title="إضافة منتج قماش جديد ➕"
          onPress={() => navigation.navigate('MerchantProfileTab', {
            screen: 'MerchantProductForm'
          })}
          variant="primary"
          size="md"
        />
        <Text style={styles.countText}>إجمالي المعروض: {products.length} أقمشة</Text>
      </View>

      {loading && products.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchProducts(); }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لم تقم بإضافة أي أقمشة بعد.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.primary,
    ...fonts.bold,
  },
  subheader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  countText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    ...fonts.bold,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  productCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  productPrice: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  cardBody: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  stockText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    ...fonts.medium,
    marginBottom: 4,
  },
  descText: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
  },
  actionText: {
    fontSize: fonts.sizes.sm,
    ...fonts.bold,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
});

export default MerchantHomeScreen;
