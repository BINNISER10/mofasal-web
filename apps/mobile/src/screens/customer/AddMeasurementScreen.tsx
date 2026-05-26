import React, { useState } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { MEASUREMENT_CATEGORIES, MEASUREMENT_LABELS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const AddMeasurementScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [measurements, setMeasurements] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setMeasurements((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    navigation.goBack();
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
                <Text style={styles.unit}>{t('measurements.unit')}</Text>
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
        <Text style={styles.headerTitle}>{t('measurements.addNew')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.nameCard}>
          <Text style={styles.nameLabel}>{t('measurements.measurementName')}</Text>
          <TextInput
            style={styles.nameInput}
            placeholder={t('measurements.namePlaceholder')}
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
            textAlign="right"
          />
        </Card>

        {renderCategory('upper_body')}
        {renderCategory('lower_body')}

        <Button
          title={t('measurements.saveMeasurements')}
          onPress={handleSave}
          variant="primary"
          size="lg"
          fullWidth
          style={styles.saveButton}
        />
      </ScrollView>
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
});

export default AddMeasurementScreen;
