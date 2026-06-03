import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency, calculateVAT } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { productsApi } from '../../services/api/products';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  merchantName?: string;
}

const CartScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCartData = useCallback(async () => {
    try {
      setLoading(true);
      const cart = await productsApi.getCart();
      if (cart && cart.items && cart.items.length > 0) {
        const mapped = cart.items.map((item: any) => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.nameAr || item.product?.name || 'منتج',
          price: item.product?.price || 0,
          quantity: item.quantity,
          merchantName: item.product?.shop?.name || 'متجر الأقمشة',
          image: item.product?.images && item.product.images.length > 0 ? item.product.images[0] : undefined,
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Failed to load cart from API:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر تحميل سلة التسوق الخاصة بك.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      fetchCartData();
    }, [fetchCartData])
  );

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = calculateVAT(subtotal);
  const deliveryFee = items.length > 0 ? 30 : 0;
  const total = subtotal + vat + deliveryFee;

  const updateQuantity = async (id: string, change: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const newQty = item.quantity + change;

    try {
      if (newQty <= 0) {
        await productsApi.removeFromCart(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        await productsApi.updateCartItem(id, newQty);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      }
    } catch (error) {
      console.warn('Failed to update cart item quantity on server:', error);
      // التعديل محلياً كـ Fallback
      if (newQty <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('cart.title')}</Text>
        </View>
        <EmptyState
          icon="🛒"
          title={t('cart.emptyCart')}
          message={t('cart.emptyMessage')}
          actionLabel={t('cart.continueShopping')}
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('cart.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.name}</Text>
              <TouchableOpacity onPress={() => updateQuantity(item.id, -item.quantity)}>
                <Text style={styles.removeText}>{t('cart.removeItem')}</Text>
              </TouchableOpacity>
            </View>
            {item.merchantName && (
              <Text style={styles.merchantName}>{item.merchantName}</Text>
            )}
            <View style={styles.itemFooter}>
              <Text style={styles.itemPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        ))}

        {/* Price Summary */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.subtotal')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.vat')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(vat)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t('cart.deliveryFee')}</Text>
            <Text style={styles.summaryValue}>{formatCurrency(deliveryFee)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('cart.total')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>{t('cart.total')}</Text>
          <Text style={styles.footerPrice}>{formatCurrency(total)}</Text>
        </View>
        <Button
          title={t('cart.checkout')}
          onPress={() => navigation.navigate('Checkout' as never)}
          variant="primary"
          size="lg"
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary, width: 40 },
  headerTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold },
  scrollContent: { padding: spacing.lg, paddingBottom: 120 },
  itemCard: { padding: spacing.lg, marginBottom: spacing.md },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemName: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', flex: 1 },
  removeText: { fontSize: fonts.sizes.sm, color: colors.error },
  merchantName: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.md },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: spacing.md },
  itemPrice: { fontSize: fonts.sizes.lg, color: colors.primary, ...fonts.bold },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  qtyButtonText: { fontSize: 18, color: colors.textPrimary },
  qtyValue: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold, minWidth: 24, textAlign: 'center' },
  summaryCard: { padding: spacing.lg, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  summaryValue: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: spacing.sm, paddingTop: spacing.md },
  totalLabel: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold },
  totalValue: { fontSize: fonts.sizes.lg, color: colors.primary, ...fonts.bold },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, paddingBottom: 30,
    backgroundColor: colors.white, ...shadows.lg, gap: 12,
  },
  footerTotal: { flex: 1 },
  footerLabel: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  footerPrice: { fontSize: fonts.sizes.xl, color: colors.primary, ...fonts.bold },
  checkoutButton: { flex: 1 },
});

export default CartScreen;
