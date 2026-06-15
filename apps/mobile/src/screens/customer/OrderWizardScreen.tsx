import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import apiClient from '../../services/api/client';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';

type WizardNav = NativeStackNavigationProp<OrdersStackParamList, 'OrderWizard'>;
type WizardRoute = RouteProp<OrdersStackParamList, 'OrderWizard'>;

// ─── Step 1: Measurements ────────────────────────────────────────────────────

interface Measurements {
  chest: string; waist: string; shoulder_width: string;
  sleeve_length: string; shirt_length: string; neck_circumference: string;
  pant_length: string; inseam: string;
}

const MEASURE_FIELDS: { key: keyof Measurements; label: string; required?: boolean }[] = [
  { key: 'chest', label: 'الصدر (سم)', required: true },
  { key: 'waist', label: 'الخصر (سم)', required: true },
  { key: 'shoulder_width', label: 'عرض الكتف (سم)', required: true },
  { key: 'sleeve_length', label: 'طول الكم (سم)', required: true },
  { key: 'shirt_length', label: 'طول الثوب (سم)', required: true },
  { key: 'neck_circumference', label: 'محيط الرقبة (سم)', required: true },
  { key: 'pant_length', label: 'طول البنطال (سم)' },
  { key: 'inseam', label: 'الطرح الداخلي (سم)' },
];

// ─── Step 2: Services ─────────────────────────────────────────────────────────

const SERVICES = [
  { id: 'thobe', name_ar: 'ثوب رجالي', price: 350 },
  { id: 'bisht', name_ar: 'بشت', price: 800 },
  { id: 'suit', name_ar: 'بدلة رسمية', price: 1200 },
  { id: 'jalabia', name_ar: 'جلابية رجالية', price: 280 },
  { id: 'alteration', name_ar: 'تعديل ملبس', price: 80 },
  { id: 'kids_thobe', name_ar: 'ثوب أطفال', price: 220 },
];

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'نقداً', icon: '💵' },
  { id: 'CARD', label: 'بطاقة', icon: '💳' },
  { id: 'APPLE_PAY', label: 'Apple Pay', icon: '🍎' },
  { id: 'MOYASAR', label: 'مدى / ماستركارد', icon: '🏦' },
];

// ─── Step 3: Address ──────────────────────────────────────────────────────────

interface Address {
  street: string; district: string; city: string;
}

// ─── Wizard Component ─────────────────────────────────────────────────────────

const STEP_LABELS = ['اختر', 'أكد'];

const OrderWizardScreen: React.FC = () => {
  const navigation = useNavigation<WizardNav>();
  const route = useRoute<WizardRoute>();
  const shopId = route.params?.shopId || '';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fabricChoice, setFabricChoice] = useState<'shop' | 'marketplace'>('shop');

  const [measurements, setMeasurements] = useState<Measurements>({
    chest: '', waist: '', shoulder_width: '', sleeve_length: '',
    shirt_length: '', neck_circumference: '', pant_length: '', inseam: '',
  });

  const [selectedServices, setSelectedServices] = useState<typeof SERVICES>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState<Address>({ street: '', district: '', city: 'الرياض' });

  const toggleService = (s: typeof SERVICES[0]) => {
    setSelectedServices(prev =>
      prev.find(x => x.id === s.id)
        ? prev.filter(x => x.id !== s.id)
        : [...prev, s]
    );
  };

  const totalAmount = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const vatAmount = Math.round(totalAmount * 0.15);

  const canProceed = () => {
    if (step === 1) return selectedServices.length > 0;
    if (step === 2) return address.street.trim() && address.district.trim() && address.city.trim();
    return false;
  };

  const handleNext = () => {
    if (step < 2) setStep((s) => s + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!shopId) {
      Alert.alert('خطأ', 'يرجى اختيار متجر أولاً');
      return;
    }
    setLoading(true);
    try {
      const meas: Record<string, number> = {};
      Object.entries(measurements).forEach(([k, v]) => {
        const n = parseFloat(v);
        if (!isNaN(n)) meas[k] = n;
      });
      const payload = {
        shopId,
        fabricSource: fabricChoice,
        measurements: Object.keys(meas).length ? meas : undefined,
        deliveryAddress: {
          label: 'عنوان العميل',
          street: address.street,
          district: address.district,
          city: address.city,
        },
        items: selectedServices.map((s) => ({
          name: s.name_ar,
          quantity: 1,
          unitPrice: s.price,
        })),
        paymentMethod: paymentMethod === 'CARD' ? 'MADA' : paymentMethod,
        customerNotes: notes || undefined,
        totalAmount: totalAmount,
      };
      const res = await apiClient.post('/orders', payload);
      const order = res.data?.data || res.data;
      Alert.alert('تم إرسال الطلب', `رقم طلبك: ${order.orderNumber || order.id}`, [
        { text: 'تابع الطلب', onPress: () => navigation.replace('OrderDetail', { orderId: order.id }) },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'حدث خطأ، حاول مجدداً';
      Alert.alert('خطأ', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>طلب جديد</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {STEP_LABELS.map((label, i) => (
          <View key={i} style={styles.stepItem}>
            <View style={[styles.stepDot, step > i ? styles.stepDone : step === i + 1 ? styles.stepActive : {}]}>
              <Text style={[styles.stepNum, (step > i || step === i + 1) && styles.stepNumActive]}>
                {step > i ? '✓' : String(i + 1)}
              </Text>
            </View>
            <Text style={[styles.stepLabel, step === i + 1 && styles.stepLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>اختر خدمتك</Text>
            <Text style={styles.stepHint}>ثوب · بدلة · بشت · أطفال</Text>
            {SERVICES.map(s => (
              <TouchableOpacity
                key={s.id}
                style={[styles.serviceCard, selectedServices.find(x => x.id === s.id) && styles.serviceCardSelected]}
                onPress={() => toggleService(s)}
              >
                <Text style={styles.serviceName}>{s.name_ar}</Text>
                <Text style={styles.servicePrice}>{s.price} ر.س</Text>
                {selectedServices.find(x => x.id === s.id) && <Text style={styles.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>مصدر القماش</Text>
            <View style={styles.paymentRow}>
              {[
                { id: 'shop' as const, label: 'من المتجر' },
                { id: 'marketplace' as const, label: 'من السوق' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.payBtn, fabricChoice === opt.id && styles.payBtnActive]}
                  onPress={() => setFabricChoice(opt.id)}
                >
                  <Text style={[styles.payLabel, fabricChoice === opt.id && styles.payLabelActive]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>المقاسات (اختياري)</Text>
            {MEASURE_FIELDS.filter(f => f.required).map(f => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={measurements[f.key]}
                  onChangeText={v => setMeasurements(prev => ({ ...prev, [f.key]: v }))}
                  keyboardType="numeric"
                  placeholder="0.0"
                  placeholderTextColor={colors.textLight}
                  textAlign="right"
                />
              </View>
            ))}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>أكد طلبك</Text>
            {([
              { key: 'city', label: 'المدينة' },
              { key: 'district', label: 'الحي *' },
              { key: 'street', label: 'الشارع *' },
            ] as { key: keyof Address; label: string }[]).map(f => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={address[f.key]}
                  onChangeText={v => setAddress(prev => ({ ...prev, [f.key]: v }))}
                  placeholder={f.label}
                  placeholderTextColor={colors.textLight}
                  textAlign="right"
                />
              </View>
            ))}

            <Text style={styles.sectionTitle}>طريقة الدفع</Text>
            <View style={styles.paymentRow}>
              {PAYMENT_METHODS.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.payBtn, paymentMethod === p.id && styles.payBtnActive]}
                  onPress={() => setPaymentMethod(p.id)}
                >
                  <Text style={styles.payIcon}>{p.icon}</Text>
                  <Text style={[styles.payLabel, paymentMethod === p.id && styles.payLabelActive]}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="ملاحظات (اختياري)"
              placeholderTextColor={colors.textLight}
              multiline
              textAlign="right"
            />

            <View style={styles.summaryBox}>
              {selectedServices.map(s => (
                <View key={s.id} style={styles.summaryRow}>
                  <Text style={styles.summaryVal}>{s.price} ر.س</Text>
                  <Text style={styles.summaryKey}>{s.name_ar}</Text>
                </View>
              ))}
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalVal}>{totalAmount + vatAmount} ر.س</Text>
                <Text style={styles.totalKey}>الإجمالي شامل الضريبة</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || loading}
        >
          {loading
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.nextBtnText}>
                {step < 2 ? 'التالي ←' : 'أكد واطلب'}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.white, ...shadows.sm,
  },
  backBtn: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold },

  stepRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: spacing.lg, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 20,
  },
  stepItem: { alignItems: 'center', gap: 6 },
  stepDot: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    borderColor: colors.divider, justifyContent: 'center', alignItems: 'center',
  },
  stepActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  stepDone: { borderColor: colors.success || '#22C55E', backgroundColor: colors.success || '#22C55E' },
  stepNum: { fontSize: 13, color: colors.textLight, ...fonts.bold },
  stepNumActive: { color: colors.white },
  stepLabel: { fontSize: fonts.sizes.xs, color: colors.textLight },
  stepLabelActive: { color: colors.primary, ...fonts.medium },

  content: { padding: spacing.lg },
  stepTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', marginBottom: 4 },
  stepHint: { fontSize: fonts.sizes.sm, color: colors.textLight, textAlign: 'right', marginBottom: spacing.lg },
  sectionTitle: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', marginTop: spacing.lg, marginBottom: spacing.sm },

  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'right', marginBottom: 6 },
  input: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.divider,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: 12,
    fontSize: fonts.sizes.md, color: colors.textPrimary, ...shadows.xs,
  },
  notesInput: { height: 80, textAlignVertical: 'top', paddingTop: 10 },

  serviceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1.5, borderColor: colors.divider, borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.sm,
    ...shadows.xs,
  },
  serviceCardSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '08' },
  serviceName: { flex: 1, fontSize: fonts.sizes.md, color: colors.textPrimary, textAlign: 'right' },
  servicePrice: { fontSize: fonts.sizes.sm, color: colors.primary, ...fonts.medium },
  checkMark: { fontSize: 18, color: colors.primary, marginLeft: spacing.sm },

  paymentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  payBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderWidth: 1.5, borderColor: colors.divider, borderRadius: borderRadius.md,
    alignItems: 'center', gap: 4, minWidth: 80,
  },
  payBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
  payIcon: { fontSize: 20 },
  payLabel: { fontSize: fonts.sizes.xs, color: colors.textSecondary },
  payLabelActive: { color: colors.primary, ...fonts.bold },

  summaryBox: {
    backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.lg, ...shadows.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryKey: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  summaryVal: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium },
  summaryTotal: { borderTopWidth: 1, borderTopColor: colors.divider, marginTop: 6, paddingTop: 12 },
  totalKey: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold },
  totalVal: { fontSize: fonts.sizes.lg, color: colors.primary, ...fonts.bold },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, backgroundColor: colors.white,
    borderTopWidth: 1, borderTopColor: colors.divider, ...shadows.md,
  },
  nextBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.lg,
    paddingVertical: 16, alignItems: 'center',
  },
  nextBtnDisabled: { backgroundColor: colors.textLight },
  nextBtnText: { fontSize: fonts.sizes.lg, color: colors.white, ...fonts.bold },
});

export default OrderWizardScreen;
