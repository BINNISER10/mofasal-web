import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { MEASUREMENT_CATEGORIES, MEASUREMENT_LABELS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { useAuth } from '../../hooks/useAuth';
import { measurementsApi } from '../../services/api/measurements';

type AddMeasurementScreenRouteProp = RouteProp<ProfileStackParamList, 'AddMeasurement'>;

const AddMeasurementScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<AddMeasurementScreenRouteProp>();
  const { measurementId } = route.params || {};
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing measurement if in edit mode
  useEffect(() => {
    const loadExisting = async () => {
      if (!measurementId || !user?.id) return;
      try {
        setLoading(true);
        const list = await measurementsApi.list(user.id);
        const item = list.find((m) => m.id === measurementId);
        if (item) {
          setName(item.name);
          const stringifiedData: Record<string, string> = {};
          Object.entries(item.data).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              stringifiedData[key] = String(val);
            }
          });
          setMeasurements(stringifiedData);
        } else {
          Alert.alert(t('common.error') || 'خطأ', 'لم يتم العثور على المقاس المطلوب.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading measurement detail:', error);
        Alert.alert(t('common.error') || 'خطأ', 'تعذر تحميل بيانات المقاس.');
      } finally {
        setLoading(false);
      }
    };

    loadExisting();
  }, [measurementId, user?.id, navigation, t]);

  const handleChange = (field: string, value: string) => {
    // Only allow numbers and decimal points
    const cleanValue = value.replace(/[^0-9.]/g, '');
    setMeasurements((prev) => ({ ...prev, [field]: cleanValue }));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t('common.validationError') || 'تنبيه', 'يرجى إدخال اسم للمقاس.');
      return;
    }

    if (!user?.id) return;

    try {
      setSaving(true);
      // Map string measurements to numbers
      const numericData: Record<string, number> = {};
      Object.entries(measurements).forEach(([key, val]) => {
        if (val.trim() !== '') {
          const num = parseFloat(val);
          if (!isNaN(num)) {
            numericData[key] = num;
          }
        }
      });

      if (measurementId) {
        await measurementsApi.update(user.id, measurementId, { name, data: numericData });
      } else {
        await measurementsApi.create(user.id, name, numericData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر حفظ المقاسات. يرجى المحاولة مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!measurementId || !user?.id) return;

    Alert.alert(
      t('profile.deleteAddress') || 'حذف المقاس',
      'هل أنت متأكد من رغبتك في حذف هذا المقاس نهائياً؟',
      [
        { text: t('common.cancel') || 'إلغاء', style: 'cancel' },
        {
          text: t('common.delete') || 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await measurementsApi.remove(user.id, measurementId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting measurement:', error);
              Alert.alert(t('common.error') || 'خطأ', 'تعذر حذف المقاس. يرجى المحاولة مرة أخرى.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const renderCategory = (category: keyof typeof MEASUREMENT_CATEGORIES) => {
    const config = MEASUREMENT_CATEGORIES[category];
    return (
      <Card key={category} style={styles.categoryCard}>
        <Text style={styles.categoryTitle}>{config.label}</Text>
        <View style={styles.fieldsGrid}>
          {config.fields.map((field) => (
            <View key={field} style={styles.fieldItem}>
              <Text style={styles.fieldLabel}>
                {MEASUREMENT_LABELS[field] || field}
              </Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.measurementInput}
                  value={measurements[field] || ''}
                  onChangeText={(val) => handleChange(field, val)}
                  keyboardType="decimal-pad"
                  textAlign="center"
                />
                <Text style={styles.unit}>{t('measurements.unit') || 'سم'}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>
    );
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
        <Text style={styles.headerTitle}>
          {measurementId ? (t('measurements.edit') || 'تعديل مقاس') : (t('measurements.addNew') || 'إضافة مقاس جديد')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card style={styles.nameCard}>
            <Text style={styles.nameLabel}>{t('measurements.measurementName') || 'اسم المقاس'}</Text>
            <TextInput
              style={styles.nameInput}
              placeholder={t('measurements.namePlaceholder') || 'مثال: مقاسات العيد، الصيف'}
              placeholderTextColor={colors.textLight}
              value={name}
              onChangeText={setName}
              textAlign="right"
            />
          </Card>

          {renderCategory('upper_body')}
          {renderCategory('lower_body')}

          <Button
            title={saving ? (t('common.saving') || 'جاري الحفظ...') : (t('measurements.saveMeasurements') || 'حفظ المقاسات')}
            onPress={handleSave}
            variant="primary"
            size="lg"
            disabled={saving}
            fullWidth
            style={styles.saveButton}
          />

          {measurementId && (
            <Button
              title={t('common.delete') || 'حذف المقاس'}
              onPress={handleDelete}
              variant="outline"
              size="lg"
              disabled={saving}
              fullWidth
              style={styles.deleteButton}
            />
          )}
        </ScrollView>
      )}
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
  scrollContent: { padding: spacing.lg, paddingBottom: 40 },
  nameCard: { padding: spacing.lg, marginBottom: spacing.md },
  nameLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium, marginBottom: spacing.sm, textAlign: 'right' },
  nameInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 15, color: colors.textPrimary, textAlign: 'right',
  },
  categoryCard: { padding: spacing.lg, marginBottom: spacing.md },
  categoryTitle: { fontSize: fonts.sizes.lg, color: colors.primary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.lg },
  fieldsGrid: { gap: spacing.md },
  fieldItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: spacing.sm,
  },
  fieldLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, textAlign: 'right', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  measurementInput: {
    width: 70, height: 36, borderWidth: 1, borderColor: colors.border,
    borderRadius: borderRadius.sm, fontSize: fonts.sizes.lg, color: colors.textPrimary,
    ...fonts.medium,
  },
  unit: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  saveButton: { marginTop: spacing.lg },
  deleteButton: { marginTop: spacing.md, borderColor: colors.error, textColor: colors.error } as any, // React Native styles can be relaxed
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AddMeasurementScreen;

