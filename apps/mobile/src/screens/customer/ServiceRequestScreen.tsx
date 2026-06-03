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
} from 'react-native';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { serviceRequestsApi, ServiceRequestType } from '../../services/api/serviceRequests';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LocationPicker from '../../components/shared/LocationPicker';

type ServiceType = 'on_site_measurement' | 'in_shop_measurement' | 'tailoring' | 'alteration' | 'consultation';

interface ServiceOption {
  id: ServiceType;
  label: string;
  icon: string;
  price: string;
}

const SERVICE_TYPES: ServiceOption[] = [
  { id: 'on_site_measurement', label: 'القياس المنزلي', icon: '🏠', price: 'مجاني' },
  { id: 'in_shop_measurement', label: 'القياس في المحل', icon: '🏪', price: 'مجاني' },
  { id: 'tailoring', label: 'خياطة', icon: '✂️', price: 'يبدأ من ٢٥٠ ر.س' },
  { id: 'alteration', label: 'تعديل', icon: '🔧', price: 'يبدأ من ٥٠ ر.س' },
  { id: 'consultation', label: 'استشارة', icon: '💬', price: 'مجاني' },
];

const LOCATION_TYPES = [
  { id: 'home', label: 'منزل', icon: '🏠' },
  { id: 'work', label: 'عمل', icon: '🏢' },
  { id: 'rest_house', label: 'استراحة', icon: '🌴' },
  { id: 'other', label: 'أخرى', icon: '📍' },
];

// تحويل النوع المحلي إلى عقد Express
const SERVICE_TYPE_MAP: Record<ServiceType, ServiceRequestType> = {
  on_site_measurement: 'ON_SITE_MEASUREMENT',
  in_shop_measurement: 'IN_SHOP_MEASUREMENT',
  tailoring: 'TAILORING',
  alteration: 'ALTERATION',
  consultation: 'CONSULTATION',
};
const LOCATION_TYPE_MAP: Record<string, 'HOME' | 'WORK' | 'OTHER' | 'SHOP_VISIT'> = {
  home: 'HOME',
  work: 'WORK',
  rest_house: 'OTHER',
  other: 'OTHER',
};

type ServiceRequestRoute = RouteProp<{ ServiceRequest: { shopId: string; serviceType?: string } }, 'ServiceRequest'>;

const ServiceRequestScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<ServiceRequestRoute>();
  const shopId = route.params?.shopId;

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [locationType, setLocationType] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  const handleSubmit = async () => {
    if (!shopId || !selectedService) {
      Alert.alert('تنبيه', 'يرجى اختيار الخدمة');
      return;
    }
    setSubmitting(true);
    try {
      // 1) إنشاء طلب الخدمة
      const request = await serviceRequestsApi.create({
        shopId,
        serviceType: SERVICE_TYPE_MAP[selectedService],
        locationType: locationType ? LOCATION_TYPE_MAP[locationType] : undefined,
        customAddress: selectedLocation?.address,
        lat: selectedLocation?.latitude,
        lng: selectedLocation?.longitude,
        preferredTime: scheduledTime || undefined,
        notes: notes || undefined,
      });

      // 2) إن كانت خدمة قياس منزلي، نوزّع أقرب مندوب تلقائياً
      const isOnSite = selectedService === 'on_site_measurement';
      if (isOnSite) {
        try {
          await serviceRequestsApi.dispatch(request.id);
        } catch {
          // لا يوجد مندوب متاح الآن — يبقى الطلب PENDING ويُعيّن لاحقاً
        }
      }

      // 3) الانتقال لشاشة التتبّع
      Alert.alert('تم بنجاح', isOnSite ? 'تم إرسال طلبك وجارٍ تعيين مندوب القياس' : 'تم إرسال طلبك بنجاح', [
        {
          text: 'تتبّع الطلب',
          onPress: () => navigation.navigate('Tracking', { serviceRequestId: request.id }),
        },
      ]);
    } catch (e: any) {
      Alert.alert('تعذّر إرسال الطلب', e?.response?.data?.error?.message || 'حدث خطأ، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const renderProgress = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View key={i} style={styles.progressRow}>
          <View style={[styles.progressDot, i < step && styles.progressDotActive, i === step - 1 && styles.progressDotCurrent]}>
            <Text style={[styles.progressDotText, (i < step || i === step - 1) && styles.progressDotTextActive]}>
              {i + 1}
            </Text>
          </View>
          {i < totalSteps - 1 && (
            <View style={[styles.progressLine, i < step - 1 && styles.progressLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>{t('services.selectService')}</Text>
      <View style={styles.servicesGrid}>
        {SERVICE_TYPES.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[styles.serviceCard, selectedService === service.id && styles.serviceSelected]}
            onPress={() => setSelectedService(service.id)}
          >
            <Text style={styles.serviceIcon}>{service.icon}</Text>
            <Text style={[styles.serviceLabel, selectedService === service.id && styles.serviceLabelSelected]}>
              {service.label}
            </Text>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>{t('services.selectLocationType')}</Text>
      <View style={styles.locationGrid}>
        {LOCATION_TYPES.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            style={[styles.locationCard, locationType === loc.id && styles.locationSelected]}
            onPress={() => setLocationType(loc.id)}
          >
            <Text style={styles.locationIcon}>{loc.icon}</Text>
            <Text style={[styles.locationLabel, locationType === loc.id && styles.locationLabelSelected]}>
              {loc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.mapSection}>
        <Text style={styles.mapTitle}>{t('services.pickLocation')}</Text>
        <LocationPicker onLocationSelected={setSelectedLocation} />
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>{t('services.scheduleDate')} و {t('services.scheduleTime')}</Text>
      <Input
        label={t('services.scheduleDate')}
        placeholder="١٤٤٦/٠٨/١٥"
        value={scheduledDate}
        onChangeText={setScheduledDate}
      />
      <Input
        label={t('services.scheduleTime')}
        placeholder="٠٩:٠٠ مساءً"
        value={scheduledTime}
        onChangeText={setScheduledTime}
      />
      <Input
        label={t('services.notes')}
        placeholder={t('services.notesPlaceholder')}
        value={notes}
        onChangeText={setNotes}
        multiline
      />
    </>
  );

  const renderStep4 = () => (
    <>
      <Text style={styles.stepTitle}>مراجعة الطلب</Text>
      <Card style={styles.reviewCard}>
        <Text style={styles.reviewLabel}>الخدمة:</Text>
        <Text style={styles.reviewValue}>
          {SERVICE_TYPES.find((s) => s.id === selectedService)?.label}
        </Text>
        <View style={styles.reviewDivider} />
        <Text style={styles.reviewLabel}>الموقع:</Text>
        <Text style={styles.reviewValue}>
          {LOCATION_TYPES.find((l) => l.id === locationType)?.label}
        </Text>
        <View style={styles.reviewDivider} />
        <Text style={styles.reviewLabel}>التاريخ:</Text>
        <Text style={styles.reviewValue}>{scheduledDate}</Text>
        <View style={styles.reviewDivider} />
        <Text style={styles.reviewLabel}>الوقت:</Text>
        <Text style={styles.reviewValue}>{scheduledTime}</Text>
      </Card>
    </>
  );

  const steps = [renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('shop.requestService')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {renderProgress()}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {steps[step - 1]()}
      </ScrollView>

      <View style={styles.footer}>
        {step < totalSteps ? (
          <Button
            title={t('common.next')}
            onPress={handleNext}
            variant="primary"
            size="lg"
            fullWidth
            disabled={
              (step === 1 && !selectedService) ||
              (step === 2 && (!locationType || !selectedLocation))
            }
          />
        ) : (
          <Button
            title={t('common.submit')}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={submitting}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerBack: {
    fontSize: 24,
    color: colors.textPrimary,
    width: 40,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    paddingHorizontal: 40,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  progressDotCurrent: {
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  progressDotText: {
    fontSize: 12,
    color: colors.textLight,
    ...fonts.bold,
  },
  progressDotTextActive: {
    color: colors.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  stepTitle: {
    fontSize: fonts.sizes.xxl,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    ...fonts.bold,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  serviceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  serviceIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
    textAlign: 'center',
  },
  serviceLabelSelected: {
    color: colors.primary,
    ...fonts.bold,
  },
  servicePrice: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: 4,
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.xxl,
  },
  locationCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  locationSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  locationIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  locationLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  locationLabelSelected: {
    color: colors.primary,
    ...fonts.bold,
  },
  mapSection: {
    marginTop: spacing.md,
  },
  mapTitle: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  reviewCard: {
    padding: spacing.xl,
  },
  reviewLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  reviewValue: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 30,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
});

export default ServiceRequestScreen;
