import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import {
  CUSTOMER_TYPES,
  GARMENT_TYPES,
  MEASUREMENT_ZONES,
  GARMENT_FIELDS,
  THOBE_SPECS,
  FABRIC_SOURCES,
  MeasurementField,
} from '../../utils/constants';
import { measurementsApi } from '../../services/api/measurements';
import { serviceRequestsApi } from '../../services/api/serviceRequests';
import { useAuthContext } from '../../services/auth/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const TOTAL_STEPS = 5;

const MeasurementWizardScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { user } = useAuthContext();

  const customerId = route.params?.customerId;
  const serviceRequestId = route.params?.serviceRequestId;

  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState<string | null>(null);
  const [age, setAge] = useState('');
  const [garmentType, setGarmentType] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [thobeSpecs, setThobeSpecs] = useState<Record<string, string>>({});
  const [hasPocket, setHasPocket] = useState(false);
  const [fabricSource, setFabricSource] = useState<string | null>(null);
  const [fabricNote, setFabricNote] = useState('');
  const [profileName, setProfileName] = useState('');

  // الحقول المطلوبة للقطعة المختارة، مجمّعة حسب المنطقة الملوّنة
  const activeZones = useMemo(() => {
    if (!garmentType) return [];
    const allowed = GARMENT_FIELDS[garmentType] || [];
    return MEASUREMENT_ZONES
      .map((zone) => ({
        ...zone,
        fields: zone.fields.filter((f) => allowed.includes(f.key)),
      }))
      .filter((zone) => zone.fields.length > 0);
  }, [garmentType]);

  const allFields: MeasurementField[] = useMemo(
    () => activeZones.flatMap((z) => z.fields),
    [activeZones],
  );

  const filledCount = allFields.filter((f) => measurements[f.key]?.trim()).length;
  const isThobe = garmentType === 'thobe' || garmentType === 'suit';
  const isAlteration = garmentType === 'alteration';

  const setMeasurement = (key: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [key]: value }));
  };
  const setSpec = (group: string, value: string) => {
    setThobeSpecs((prev) => ({ ...prev, [group]: value }));
  };

  const fieldError = (f: MeasurementField): string | null => {
    const raw = measurements[f.key];
    if (!raw) return null;
    const n = Number(raw);
    if (isNaN(n)) return 'قيمة غير صحيحة';
    if (n < f.min || n > f.max) return `النطاق المتوقّع ${f.min}-${f.max} سم`;
    return null;
  };

  const canProceed = (): boolean => {
    if (step === 1) return !!customerType && (customerType !== 'boy' || age.trim().length > 0);
    if (step === 2) return !!garmentType;
    if (step === 3) {
      if (isAlteration) return true;
      // على الأقل نصف الحقول مدخلة وبدون أخطاء نطاق
      const hasErrors = allFields.some((f) => fieldError(f));
      return filledCount >= Math.ceil(allFields.length / 2) && !hasErrors;
    }
    if (step === 4) return !!fabricSource;
    return true;
  };

  const next = () => { if (step < TOTAL_STEPS && canProceed()) setStep(step + 1); };
  const back = () => { if (step > 1) setStep(step - 1); else navigation.goBack(); };

  const submit = async () => {
    const targetUserId = customerId || user?.id;
    if (!targetUserId) {
      Alert.alert('تنبيه', 'يجب تسجيل الدخول لحفظ القياسات');
      return;
    }
    // تجميع كل بيانات القياس في كائن واحد
    const numericMeasurements: Record<string, number> = {};
    Object.entries(measurements).forEach(([k, v]) => {
      const s = String(v ?? '');
      const n = Number(s);
      if (s.trim() && !isNaN(n)) numericMeasurements[k] = n;
    });
    const payload = {
      ...numericMeasurements,
      _meta: {
        customerType,
        age: customerType === 'boy' ? age : undefined,
        garmentType,
        thobeSpecs,
        hasPocket,
        fabricSource,
        fabricNote,
      },
    };
    const name = profileName.trim()
      || `${GARMENT_TYPES.find((g) => g.id === garmentType)?.label || 'قياس'} - ${new Date().toLocaleDateString('ar')}`;

    setSaving(true);
    try {
      await measurementsApi.create(targetUserId, name, payload);
      
      // إذا كان هذا القياس مسجلاً كجزء من مهمة قياس للمندوب، يتم وضع علامة اكتمال على طلب الخدمة
      if (serviceRequestId) {
        try {
          await serviceRequestsApi.update(serviceRequestId, { status: 'COMPLETED' });
        } catch (e) {
          // خطأ خفيف في التحديث لا يعطل حفظ القياس
        }
      }

      Alert.alert('تم الحفظ', 'تم حفظ القياس بنجاح', [
        { text: 'حسناً', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('تعذّر الحفظ', e?.response?.data?.error?.message || 'حدث خطأ، حاول مجدداً');
    } finally {
      setSaving(false);
    }
  };

  // ─── شريط التقدّم ───
  const renderProgress = () => (
    <View style={styles.progressRow}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <View key={i} style={styles.progressItem}>
          <View style={[
            styles.progressDot,
            i + 1 < step && styles.progressDone,
            i + 1 === step && styles.progressCurrent,
          ]}>
            <Text style={[styles.progressNum, (i + 1 <= step) && styles.progressNumActive]}>
              {i + 1 < step ? '✓' : i + 1}
            </Text>
          </View>
          {i < TOTAL_STEPS - 1 && (
            <View style={[styles.progressBar, i + 1 < step && styles.progressBarDone]} />
          )}
        </View>
      ))}
    </View>
  );

  // ─── الخطوة 1: نوع الزبون ───
  const renderStep1 = () => (
    <View>
      <Text style={styles.stepTitle}>لمن هذا القياس؟</Text>
      <Text style={styles.stepSub}>اختر نوع الزبون لضبط نطاقات القياس</Text>
      <View style={styles.cardsRow}>
        {CUSTOMER_TYPES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.choiceCard, customerType === c.id && styles.choiceActive]}
            onPress={() => setCustomerType(c.id)}
          >
            <Text style={styles.choiceEmoji}>{c.emoji}</Text>
            <Text style={[styles.choiceLabel, customerType === c.id && styles.choiceLabelActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {customerType === 'boy' && (
        <Card style={styles.ageCard}>
          <Text style={styles.fieldLabel}>عمر الطفل (بالسنوات)</Text>
          <TextInput
            style={styles.ageInput}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="مثال: 8"
            placeholderTextColor={colors.textLight}
            textAlign="center"
          />
        </Card>
      )}
    </View>
  );

  // ─── الخطوة 2: نوع القطعة + مواصفات الثوب ───
  const renderStep2 = () => (
    <View>
      <Text style={styles.stepTitle}>ما القطعة المطلوبة؟</Text>
      <View style={styles.garmentGrid}>
        {GARMENT_TYPES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.garmentCard, garmentType === g.id && styles.choiceActive]}
            onPress={() => setGarmentType(g.id)}
          >
            <Text style={styles.choiceEmoji}>{g.emoji}</Text>
            <Text style={[styles.garmentLabel, garmentType === g.id && styles.choiceLabelActive]}>
              {g.label}
            </Text>
            {(g as { primary?: boolean }).primary && <View style={styles.primaryBadge}><Text style={styles.primaryBadgeText}>الأساسي</Text></View>}
          </TouchableOpacity>
        ))}
      </View>

      {isThobe && (
        <View style={styles.specsWrap}>
          <Text style={styles.specsTitle}>مواصفات الثوب السعودي</Text>
          {Object.entries(THOBE_SPECS).map(([group, cfg]) => (
            <View key={group} style={styles.specGroup}>
              <Text style={styles.specGroupLabel}>{cfg.label}</Text>
              <View style={styles.specOptions}>
                {cfg.options.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.specChip, thobeSpecs[group] === opt.id && styles.specChipActive]}
                    onPress={() => setSpec(group, opt.id)}
                  >
                    <Text style={[styles.specChipText, thobeSpecs[group] === opt.id && styles.specChipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.pocketRow} onPress={() => setHasPocket(!hasPocket)}>
            <View style={[styles.checkbox, hasPocket && styles.checkboxOn]}>
              {hasPocket && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.pocketLabel}>جيب الصدر</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // ─── الخطوة 3: القياسات الملوّنة ───
  const renderStep3 = () => {
    if (isAlteration) {
      return (
        <View>
          <Text style={styles.stepTitle}>تفاصيل التعديل</Text>
          <Card style={styles.alterCard}>
            <Text style={styles.fieldLabel}>صف التعديل المطلوب</Text>
            <TextInput
              style={styles.notesInput}
              value={fabricNote}
              onChangeText={setFabricNote}
              placeholder="مثال: تضييق الخصر، تقصير الكم 3 سم..."
              placeholderTextColor={colors.textLight}
              multiline
              textAlign="right"
            />
          </Card>
        </View>
      );
    }
    return (
      <View>
        <View style={styles.measureHeader}>
          <Text style={styles.stepTitle}>القياسات</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filledCount}/{allFields.length}</Text>
          </View>
        </View>
        {activeZones.map((zone) => (
          <View key={zone.id} style={styles.zoneCard}>
            <View style={[styles.zoneHeader, { backgroundColor: zone.color }]}>
              <Text style={styles.zoneEmoji}>{zone.emoji}</Text>
              <Text style={styles.zoneTitle}>{zone.label}</Text>
            </View>
            <View style={styles.zoneBody}>
              {zone.fields.map((f) => {
                const err = fieldError(f);
                const filled = measurements[f.key]?.trim();
                return (
                  <View key={f.key} style={styles.measureField}>
                    <View style={styles.measureTop}>
                      <View style={[styles.zoneDot, { backgroundColor: zone.color }]} />
                      <Text style={styles.measureName}>{f.label}</Text>
                      <View style={styles.measureInputWrap}>
                        <TextInput
                          style={[
                            styles.measureInput,
                            filled && { borderColor: zone.color },
                            err && styles.measureInputError,
                          ]}
                          value={measurements[f.key] || ''}
                          onChangeText={(v) => setMeasurement(f.key, v)}
                          keyboardType="decimal-pad"
                          textAlign="center"
                          placeholder="0"
                          placeholderTextColor={colors.textMuted}
                        />
                        <Text style={styles.unit}>سم</Text>
                      </View>
                    </View>
                    <Text style={[styles.measureHint, err && styles.measureHintError]}>
                      {err ? `⚠️ ${err}` : `💡 ${f.hint}`}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // ─── الخطوة 4: اختيار القماش ───
  const renderStep4 = () => (
    <View>
      <Text style={styles.stepTitle}>اختيار القماش</Text>
      <Text style={styles.stepSub}>كيف تريد اختيار قماش الثوب؟</Text>
      <View style={styles.cardsRow}>
        {FABRIC_SOURCES.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.fabricCard, fabricSource === s.id && styles.choiceActive]}
            onPress={() => setFabricSource(s.id)}
          >
            <Text style={styles.choiceEmoji}>{s.emoji}</Text>
            <Text style={[styles.choiceLabel, fabricSource === s.id && styles.choiceLabelActive]}>
              {s.label}
            </Text>
            <Text style={styles.fabricHint}>{s.hint}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {fabricSource && (
        <Card style={styles.fabricNoteCard}>
          <Text style={styles.fieldLabel}>
            {fabricSource === 'physical' ? 'ملاحظة عن القماش المختار' : 'نوع/لون القماش المطلوب'}
          </Text>
          <TextInput
            style={styles.notesInput}
            value={fabricNote}
            onChangeText={setFabricNote}
            placeholder={fabricSource === 'physical' ? 'مثال: نياقة أبيض رقم 5' : 'مثال: دورمى كحلي شتوي'}
            placeholderTextColor={colors.textLight}
            multiline
            textAlign="right"
          />
        </Card>
      )}
    </View>
  );

  // ─── الخطوة 5: المراجعة ───
  const renderStep5 = () => {
    const customerLabel = CUSTOMER_TYPES.find((c) => c.id === customerType)?.label;
    const garmentLabel = GARMENT_TYPES.find((g) => g.id === garmentType)?.label;
    const fabricLabel = FABRIC_SOURCES.find((s) => s.id === fabricSource)?.label;
    return (
      <View>
        <Text style={styles.stepTitle}>مراجعة وتأكيد</Text>
        <Card style={styles.reviewCard}>
          <Text style={styles.fieldLabel}>اسم القياس (للحفظ)</Text>
          <TextInput
            style={styles.ageInput}
            value={profileName}
            onChangeText={setProfileName}
            placeholder="مثال: ثوب صيفي 2026"
            placeholderTextColor={colors.textLight}
            textAlign="right"
          />
        </Card>
        <Card style={styles.reviewCard}>
          {[
            ['الزبون', customerType === 'boy' ? `${customerLabel} (${age} سنة)` : customerLabel],
            ['القطعة', garmentLabel],
            ['القماش', fabricLabel],
          ].map(([k, v]) => (
            <View key={k} style={styles.reviewRow}>
              <Text style={styles.reviewKey}>{k}</Text>
              <Text style={styles.reviewVal}>{v || '—'}</Text>
            </View>
          ))}
          {!isAlteration && (
            <View style={styles.reviewMeasures}>
              <Text style={styles.reviewSection}>القياسات ({filledCount})</Text>
              <View style={styles.reviewChips}>
                {allFields.filter((f) => measurements[f.key]?.trim()).map((f) => (
                  <View key={f.key} style={styles.reviewChip}>
                    <Text style={styles.reviewChipText}>{f.label}: {measurements[f.key]}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>
        <View style={styles.confirmNote}>
          <Text style={styles.confirmNoteText}>
            سيراجع العميل هذه التفاصيل ويؤكّدها قبل إرسالها للخياط.
          </Text>
        </View>
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={back} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>أخذ القياسات</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgress()}

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={step === TOTAL_STEPS ? 'حفظ القياس' : 'التالي'}
          onPress={step === TOTAL_STEPS ? submit : next}
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          disabled={!canProceed() || saving}
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
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headerTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold },

  progressRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md, backgroundColor: colors.white,
    borderBottomWidth: 1, borderBottomColor: colors.divider,
  },
  progressItem: { flexDirection: 'row', alignItems: 'center' },
  progressDot: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surfaceGrey,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDone: { backgroundColor: colors.success },
  progressCurrent: { backgroundColor: colors.primary },
  progressNum: { fontSize: fonts.sizes.sm, color: colors.textLight, ...fonts.bold },
  progressNumActive: { color: colors.white },
  progressBar: { width: 26, height: 3, backgroundColor: colors.surfaceGrey, marginHorizontal: 2 },
  progressBarDone: { backgroundColor: colors.success },

  scroll: { padding: spacing.lg, paddingBottom: 40 },
  stepTitle: { fontSize: fonts.sizes.xxl, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.xs },
  stepSub: { fontSize: fonts.sizes.md, color: colors.textSecondary, textAlign: 'right', marginBottom: spacing.lg },

  cardsRow: { flexDirection: 'row', gap: spacing.md },
  choiceCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', borderWidth: 2, borderColor: colors.border,
    ...shadows.sm,
  },
  choiceActive: { borderColor: colors.primary, backgroundColor: colors.primaryMuted },
  choiceEmoji: { fontSize: 40, marginBottom: spacing.sm },
  choiceLabel: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold },
  choiceLabelActive: { color: colors.primary },

  ageCard: { padding: spacing.lg, marginTop: spacing.lg },
  fieldLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium, textAlign: 'right', marginBottom: spacing.sm },
  ageInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 16, color: colors.textPrimary,
  },

  garmentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  garmentCard: {
    width: '30%', backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: colors.border,
    ...shadows.sm,
  },
  garmentLabel: { fontSize: fonts.sizes.sm, color: colors.textPrimary, ...fonts.medium, marginTop: spacing.xs, textAlign: 'center' },
  primaryBadge: { marginTop: 4, backgroundColor: colors.gold, borderRadius: borderRadius.full, paddingHorizontal: 6, paddingVertical: 1 },
  primaryBadgeText: { fontSize: 9, color: colors.primaryDark, ...fonts.bold },

  specsWrap: { marginTop: spacing.xl },
  specsTitle: { fontSize: fonts.sizes.lg, color: colors.secondary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.md },
  specGroup: { marginBottom: spacing.md },
  specGroupLabel: { fontSize: fonts.sizes.sm, color: colors.textSecondary, ...fonts.medium, textAlign: 'right', marginBottom: spacing.xs },
  specOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'flex-end' },
  specChip: {
    backgroundColor: colors.white, borderRadius: borderRadius.full, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderWidth: 1, borderColor: colors.border,
  },
  specChipActive: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  specChipText: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  specChipTextActive: { color: colors.white, ...fonts.medium },
  pocketRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.white, fontSize: 14, ...fonts.bold },
  pocketLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary },

  measureHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  countBadge: { backgroundColor: colors.primaryMuted, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  countText: { fontSize: fonts.sizes.md, color: colors.primary, ...fonts.bold },
  zoneCard: { borderRadius: borderRadius.lg, marginBottom: spacing.md, overflow: 'hidden', backgroundColor: colors.white, ...shadows.sm },
  zoneHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  zoneEmoji: { fontSize: 18 },
  zoneTitle: { fontSize: fonts.sizes.md, color: colors.white, ...fonts.bold },
  zoneBody: { padding: spacing.md },
  measureField: { marginBottom: spacing.md },
  measureTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.sm },
  zoneDot: { width: 10, height: 10, borderRadius: 5 },
  measureName: { flex: 1, fontSize: fonts.sizes.md, color: colors.textPrimary, textAlign: 'right' },
  measureInputWrap: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  measureInput: {
    width: 64, height: 40, borderWidth: 1.5, borderColor: colors.border, borderRadius: borderRadius.md,
    fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold,
  },
  measureInputError: { borderColor: colors.error },
  unit: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  measureHint: { fontSize: fonts.sizes.xs, color: colors.textLight, textAlign: 'right', marginTop: 2 },
  measureHintError: { color: colors.error },

  alterCard: { padding: spacing.lg },
  fabricCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: colors.border,
    ...shadows.sm,
  },
  fabricHint: { fontSize: fonts.sizes.xs, color: colors.textLight, textAlign: 'center', marginTop: spacing.xs },
  fabricNoteCard: { padding: spacing.lg, marginTop: spacing.lg },
  notesInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 15, color: colors.textPrimary, minHeight: 80, textAlignVertical: 'top',
  },

  reviewCard: { padding: spacing.lg, marginBottom: spacing.md },
  reviewRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.divider },
  reviewKey: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  reviewVal: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.bold },
  reviewMeasures: { marginTop: spacing.md },
  reviewSection: { fontSize: fonts.sizes.md, color: colors.primary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.sm },
  reviewChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'flex-end' },
  reviewChip: { backgroundColor: colors.surfaceWarm, borderRadius: borderRadius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  reviewChipText: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  confirmNote: { backgroundColor: colors.primaryMuted, borderRadius: borderRadius.md, padding: spacing.md },
  confirmNoteText: { fontSize: fonts.sizes.sm, color: colors.primaryDark, textAlign: 'right' },

  footer: { padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.divider },
});

export default MeasurementWizardScreen;
