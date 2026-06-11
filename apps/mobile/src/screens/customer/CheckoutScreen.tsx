import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency, calculateVAT } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PaymentMethodSelector from '../../components/shared/PaymentMethodSelector';
import { useAuth } from '../../hooks/useAuth';
import { addressesApi } from '../../services/api/addresses';
import { productsApi } from '../../services/api/products';
import { ordersApi, CreateOrderRequest } from '../../services/api/orders';
import { shopsApi } from '../../services/api/shops';

type PaymentMethod = 'mada' | 'visa' | 'mastercard' | 'apple_pay' | 'google_pay' | 'stc_pay' | 'tamara' | 'tabby' | 'sadad' | 'bank_transfer' | 'cod';

const CheckoutScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // جلب العناوين وسلة التسوق
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        
        // 1. جلب السلة
        let items: any[] = [];
        try {
          const cart = await productsApi.getCart();
          if (cart && cart.items && cart.items.length > 0) {
            items = cart.items;
            setCartItems(cart.items);
            const sub = cart.items.reduce(
              (sum: number, it: any) => sum + (it.product?.price || 0) * it.quantity,
              0
            );
            setSubtotal(sub);
            if (cart.items[0].product?.shopId) {
              setShopId(cart.items[0].product.shopId);
            }
          } else {
            setSubtotal(0);
          }
        } catch (cartErr) {
          console.warn('Failed to load cart for checkout:', cartErr);
          setSubtotal(0);
        }

        // 2. جلب العناوين
        if (user && user.id) {
          try {
            const userAddresses = await addressesApi.list(user.id);
            if (userAddresses && userAddresses.length > 0) {
              const mapped = userAddresses.map((addr) => ({
                id: addr.id,
                label: addr.label || 'عنوان',
                details: `${addr.city}، ${addr.street}، ${addr.buildingNumber || ''}`,
              }));
              setAddresses(mapped);
              setSelectedAddress(mapped[0].id);
            } else {
              setAddresses([]);
              setSelectedAddress('');
            }
          } catch (addrErr) {
            console.warn('Failed to load user addresses:', addrErr);
            setAddresses([]);
            setSelectedAddress('');
          }
        }

        // 3. جلب معرّف المتجر البديل إذا لم يتوفر بالسلع
        if (items.length === 0 || !items[0].product?.shopId) {
          try {
            const shops = await shopsApi.list({ limit: 1 });
            if (shops && shops.length > 0) {
              setShopId(shops[0].id);
            }
          } catch (shopErr) {
            console.warn('Failed to fetch default shop ID:', shopErr);
          }
        }

      } catch (err) {
        console.warn('General checkout loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [user]);

  const vat = calculateVAT(subtotal);
  const deliveryFee = subtotal > 0 ? 30 : 0;
  const total = subtotal + vat + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert(t('common.validationError') || 'تنبيه', 'يرجى اختيار أو إضافة عنوان التوصيل أولاً.');
      return;
    }

    if (!paymentMethod) {
      Alert.alert(t('common.validationError') || 'تنبيه', 'يرجى اختيار طريقة الدفع.');
      return;
    }

    if (!user?.id) return;

    // تحويل طريقة الدفع لعقد خادم Express
    let backendPaymentMethod = 'CASH';
    switch (paymentMethod) {
      case 'mada':
        backendPaymentMethod = 'MADA';
        break;
      case 'visa':
      case 'mastercard':
        backendPaymentMethod = 'VISA_MASTERCARD';
        break;
      case 'apple_pay':
        backendPaymentMethod = 'APPLE_PAY';
        break;
      case 'stc_pay':
        backendPaymentMethod = 'STC_PAY';
        break;
      case 'tamara':
        backendPaymentMethod = 'TAMARA';
        break;
      case 'tabby':
        backendPaymentMethod = 'TABBY';
        break;
      case 'sadad':
        backendPaymentMethod = 'SADAD';
        break;
      case 'cod':
      default:
        backendPaymentMethod = 'CASH';
        break;
    }

    try {
      const itemsPayload = cartItems.map((it: any) => ({
        name: it.product?.nameAr || it.product?.name || 'منتج',
        quantity: it.quantity,
        price: it.product?.price || 0, // استخدام price هنا لتقوم ordersApi.create بتحويلها لـ unitPrice بشكل صحيح
      }));

      const finalShopId = shopId || '00000000-0000-0000-0000-000000000000'; // معرف وهمي احتياطي

      const payload: CreateOrderRequest = {
        shopId: finalShopId,
        serviceType: 'FABRIC',
        items: itemsPayload,
        deliveryAddressId: selectedAddress,
        notes: 'تم الطلب من الجوال',
        paymentMethod: backendPaymentMethod,
      };

      const order = await ordersApi.create(payload);

      // تنظيف السلة بالخلفية
      try {
        await productsApi.clearCart();
      } catch (clearErr) {
        console.warn('Failed to clear cart on server:', clearErr);
      }

      navigation.navigate('Payment' as never, {
        orderId: order.id,
        amount: total,
        method: paymentMethod,
      } as never);

    } catch (error) {
      console.error('Failed to place order:', error);
      Alert.alert(t('common.error') || 'خطأ', 'فشل إنشاء الطلب، يرجى إعادة المحاولة.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>إتمام الطلب</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Delivery Address */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('delivery.deliveryAddress')}</Text>
          {addresses.length === 0 ? (
            <View style={styles.noAddressContainer}>
              <Text style={styles.noAddressText}>لم تقم بإضافة أي عنوان بعد.</Text>
              <Button
                title="إضافة عنوان جديد"
                onPress={() => navigation.navigate('Addresses' as never)}
                variant="outline"
                size="sm"
                style={styles.noAddressBtn}
              />
            </View>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[styles.addressItem, selectedAddress === addr.id && styles.addressSelected]}
                onPress={() => setSelectedAddress(addr.id)}
              >
                <View style={styles.radioOuter}>
                  {selectedAddress === addr.id && <View style={styles.radioInner} />}
                </View>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  <Text style={styles.addressDetails}>{addr.details}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* Payment Method */}
        <Card style={styles.section}>
          <TouchableOpacity onPress={() => setShowPaymentModal(true)}>
            <View style={styles.paymentSelector}>
              <Text style={styles.sectionTitle}>{t('payment.selectMethod')}</Text>
              {paymentMethod ? (
                <Text style={styles.selectedPayment}>
                  {paymentMethod === 'mada' ? 'مدى' :
                   paymentMethod === 'stc_pay' ? 'STC Pay' :
                   paymentMethod === 'tamara' ? 'تمارا' :
                   paymentMethod === 'tabby' ? 'طابي' :
                   paymentMethod === 'cod' ? 'الدفع عند الاستلام' :
                   paymentMethod === 'sadad' ? 'سداد' :
                   paymentMethod === 'bank_transfer' ? 'تحويل بنكي' :
                   paymentMethod === 'apple_pay' ? 'Apple Pay' :
                   paymentMethod === 'google_pay' ? 'Google Pay' :
                   paymentMethod === 'visa' ? 'فيزا' : 'ماستركارد'}
                </Text>
              ) : (
                <Text style={styles.selectPaymentHint}>اختر طريقة الدفع</Text>
              )}
            </View>
          </TouchableOpacity>
        </Card>

        {/* Order Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payment.orderSummary')}</Text>
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
        <Button
          title={t('payment.payNow')}
          onPress={handlePlaceOrder}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!paymentMethod}
        />
      </View>

      <Modal visible={showPaymentModal} onClose={() => setShowPaymentModal(false)} title={t('payment.selectMethod')}>
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onSelect={(method) => {
            setPaymentMethod(method);
            setShowPaymentModal(false);
          }}
        />
      </Modal>
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
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  section: { padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.md },
  addressItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  addressSelected: { backgroundColor: colors.primary + '08', borderRadius: borderRadius.sm, padding: spacing.sm },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium, textAlign: 'right' },
  addressDetails: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'right', marginTop: 4 },
  paymentSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedPayment: { fontSize: fonts.sizes.md, color: colors.primary, ...fonts.bold },
  selectPaymentHint: { fontSize: fonts.sizes.md, color: colors.textLight },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  summaryValue: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium },
  totalRow: { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: spacing.sm, paddingTop: spacing.md },
  totalLabel: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold },
  totalValue: { fontSize: fonts.sizes.lg, color: colors.primary, ...fonts.bold },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, paddingBottom: 30,
    backgroundColor: colors.white, ...shadows.lg,
  },
  noAddressContainer: { alignItems: 'center', paddingVertical: spacing.md },
  noAddressText: { fontSize: fonts.sizes.md, color: colors.textSecondary, marginBottom: spacing.md, textAlign: 'center' },
  noAddressBtn: { marginTop: spacing.xs, width: '60%' },
});

export default CheckoutScreen;
