import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { MarketplaceStackParamList } from '../../navigation/stacks/MarketplaceStack';
import { paymentsApi } from '../../services/api/payments';

type PaymentRouteProp = RouteProp<MarketplaceStackParamList, 'Payment'>;

const PaymentScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<PaymentRouteProp>();
  const { amount, method, orderId } = route.params;

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [stcPhone, setStcPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!orderId) return;

    // Convert method to match Express backend validation enum (MADA, VISA_MASTERCARD, APPLE_PAY, etc.)
    let backendPaymentMethod = 'CASH';
    switch (method) {
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
      setProcessing(true);

      const splitExpiry = expiryDate.split('/');
      const expiryMonth = splitExpiry[0] || '';
      const expiryYear = splitExpiry[1] || '';

      const payload = {
        orderId,
        method: backendPaymentMethod as any,
        amount,
        cardDetails: method === 'mada' || method === 'visa' || method === 'mastercard' ? {
          cardNumber: cardNumber.replace(/\s?/g, ''),
          expiryMonth,
          expiryYear,
          cvv,
          cardHolder,
        } : undefined,
        stcPayPhone: method === 'stc_pay' ? stcPhone : undefined,
      };

      const result = await paymentsApi.process(payload as any);

      if (result && result.success) {
        Alert.alert(t('payment.success') || 'نجاح', 'تمت عملية الدفع بنجاح!', [
          {
            text: t('common.ok') || 'موافق',
            onPress: () => {
              // Navigate to Marketplace or Orders
              navigation.navigate('Marketplace' as never);
            },
          },
        ]);
      } else {
        Alert.alert(t('common.error') || 'خطأ', result?.message || 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      Alert.alert(t('common.error') || 'خطأ', 'حدث خطأ أثناء معالجة عملية الدفع.');
    } finally {
      setProcessing(false);
    }
  };

  const renderMadaForm = () => (
    <>
      <Input
        label={t('payment.cardNumber')}
        placeholder="XXXX XXXX XXXX XXXX"
        value={cardNumber}
        onChangeText={setCardNumber}
        keyboardType="number-pad"
        maxLength={19}
      />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input
            label={t('payment.cvv')}
            placeholder="XXX"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label={t('payment.expiryDate')}
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={setExpiryDate}
            maxLength={5}
          />
        </View>
      </View>
      <Input
        label={t('payment.cardHolder')}
        placeholder="اسم حامل البطاقة"
        value={cardHolder}
        onChangeText={setCardHolder}
      />
    </>
  );

  const renderSTCPayForm = () => (
    <>
      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrIcon}>📱</Text>
        <Text style={styles.qrText}>{t('payment.scanQR')}</Text>
      </View>
      <Input
        label="رقم STC Pay"
        placeholder="٥xxxxxxxx"
        value={stcPhone}
        onChangeText={setStcPhone}
        keyboardType="phone-pad"
        maxLength={9}
        isPhone
      />
    </>
  );

  const renderTamaraTabby = () => (
    <View style={styles.installmentSection}>
      <Text style={styles.installmentAmount}>
        {formatCurrency(amount / 4)} {t('payment.monthly')}
      </Text>
      <Text style={styles.installmentLabel}>٤ دفعات</Text>
      <View style={styles.installmentDetails}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.installmentRow}>
            <Text style={styles.installmentDate}>الدفعة {i}</Text>
            <Text style={styles.installmentPrice}>{formatCurrency(amount / 4)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCOD = () => (
    <View style={styles.codSection}>
      <Text style={styles.codIcon}>💵</Text>
      <Text style={styles.codText}>{t('payment.cod')}</Text>
      <Text style={styles.codDesc}>ادفع عند استلام الطلب</Text>
    </View>
  );

  const renderPaymentForm = () => {
    if (method === 'mada' || method === 'visa' || method === 'mastercard') return renderMadaForm();
    if (method === 'stc_pay') return renderSTCPayForm();
    if (method === 'tamara' || method === 'tabby') return renderTamaraTabby();
    if (method === 'cod') return renderCOD();
    return renderMadaForm();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payment.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>{t('payment.orderSummary')}</Text>
          <Text style={styles.amount}>{formatCurrency(amount)}</Text>
        </View>

        {renderPaymentForm()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('payment.payNow')}
          onPress={handlePayment}
          variant="primary"
          size="lg"
          fullWidth
          loading={processing}
        />
      </View>
    </KeyboardAvoidingView>
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
  amountCard: {
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xxl,
  },
  amountLabel: { fontSize: fonts.sizes.sm, color: colors.white, opacity: 0.9, marginBottom: spacing.sm },
  amount: { fontSize: fonts.sizes.title, color: colors.white, ...fonts.bold },
  row: { flexDirection: 'row', gap: 12 },
  qrPlaceholder: {
    backgroundColor: colors.background, borderRadius: borderRadius.lg,
    padding: spacing.xxxl, alignItems: 'center', marginBottom: spacing.lg,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
  },
  qrIcon: { fontSize: 64, marginBottom: spacing.md },
  qrText: { fontSize: fonts.sizes.md, color: colors.textSecondary, ...fonts.medium },
  installmentSection: { alignItems: 'center', padding: spacing.xl },
  installmentAmount: { fontSize: fonts.sizes.xxxl, color: colors.primary, ...fonts.bold, marginBottom: 4 },
  installmentLabel: { fontSize: fonts.sizes.md, color: colors.textSecondary, marginBottom: spacing.xxl },
  installmentDetails: { width: '100%' },
  installmentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  installmentDate: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  installmentPrice: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium },
  codSection: { alignItems: 'center', padding: spacing.xxxl },
  codIcon: { fontSize: 64, marginBottom: spacing.md },
  codText: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold, marginBottom: spacing.sm },
  codDesc: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, paddingBottom: 30,
    backgroundColor: colors.white, ...shadows.lg,
  },
});

export default PaymentScreen;
