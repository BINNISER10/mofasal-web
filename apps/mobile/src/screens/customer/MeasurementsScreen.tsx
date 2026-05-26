import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import MeasurementView from '../../components/shared/MeasurementView';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';

type MeasurementsNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Measurements'>;

const MOCK_MEASUREMENTS = [
  {
    id: '1', name: 'مقاسات العيد', date: '٢٠٢٤/٠١/١٥',
    data: { neck: 40, shoulders: 48, chest: 100, waist: 85, bicep: 32, forearm: 28, wrist: 17, sleeveLength: 62, shirtLength: 78, waistLower: 90, hips: 98, thigh: 55, knee: 38, calf: 36, inseam: 78, outseam: 104, trouserLength: 105 },
  },
  {
    id: '2', name: 'مقاسات الصيف', date: '٢٠٢٣/٠٦/١٠',
    data: { neck: 39, shoulders: 47, chest: 98, waist: 83, bicep: 31, forearm: 27, wrist: 16.5, sleeveLength: 61, shirtLength: 77, waistLower: 88, hips: 96, thigh: 54, knee: 37, calf: 35, inseam: 77, outseam: 103, trouserLength: 104 },
  },
];

const MeasurementsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MeasurementsNavProp>();

  const measurements = MOCK_MEASUREMENTS;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('measurements.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {measurements.length === 0 ? (
          <EmptyState
            icon="📏"
            title={t('profile.noMeasurements')}
            actionLabel={t('profile.addMeasurements')}
            onAction={() => navigation.navigate('AddMeasurement', {})}
          />
        ) : (
          <>
            {measurements.map((ms) => (
              <TouchableOpacity
                key={ms.id}
                onPress={() => navigation.navigate('AddMeasurement', { measurementId: ms.id })}
              >
                <MeasurementView
                  measurements={ms.data}
                  title={ms.name}
                  date={ms.date}
                />
              </TouchableOpacity>
            ))}

            <Button
              title={t('profile.addMeasurements')}
              onPress={() => navigation.navigate('AddMeasurement', {})}
              variant="primary"
              size="lg"
              fullWidth
              style={styles.addButton}
            />
          </>
        )}
      </ScrollView>
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
  scrollContent: { padding: spacing.lg, paddingBottom: 40 },
  addButton: { marginTop: spacing.xxl },
});

export default MeasurementsScreen;
