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
import { formatCurrency, calculateVAT } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import PaymentMethodSelector from '../../components/shared/PaymentMethodSelector';

type PaymentMethod = 'mada' | 'visa' | 'mastercard' | 'apple_pay' | 'google_pay' | 'stc_pay' | 'tamara' | 'tabby' | 'sadad' | 'bank_transfer' | 'cod';

const MOCK_ADDRESSES = [
  { id: '1', label: 'المنزل', details: 'الرياض، حي النخيل، شارع الأمير محمد بن سلمان، مبنى ٢٣' },
  { id: '2', label: 'العمل', details: 'الرياض، حي العليا، طريق الملك فهد، برج المملكة' },
];

const CheckoutScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [selectedAddress, setSelectedAddress] = useState(MOCK_ADDRESSES[0].id);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const subtotal = 840;
  const vat = calculateVAT(subtotal);
  const deliveryFee = 30;
  const total = subtotal + vat + deliveryFee;

  const handlePlaceOrder = () => {
    if (paymentMethod) {
      navigation.navigate('Payment' as never, {
        orderId: 'new',
        amount: total,
        method: paymentMethod,
      } as never);
    }
  };

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
          {MOCK_ADDRESSES.map((addr) => (
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
          ))}
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
});

export default CheckoutScreen;
