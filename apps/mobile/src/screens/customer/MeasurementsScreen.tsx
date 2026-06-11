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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import MeasurementView from '../../components/shared/MeasurementView';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';
import { useAuth } from '../../hooks/useAuth';
import { measurementsApi, SavedMeasurement } from '../../services/api/measurements';

type MeasurementsNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Measurements'>;

const MeasurementsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<MeasurementsNavProp>();
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeasurements = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await measurementsApi.list(user.id);
      setMeasurements(data);
    } catch (error) {
      console.error('Error loading measurements:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر تحميل المقاسات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useFocusEffect(
    useCallback(() => {
      loadMeasurements();
    }, [loadMeasurements])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('measurements.title') || 'المقاسات المحفوظة'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {measurements.length === 0 ? (
            <EmptyState
              icon="📏"
              title={t('profile.noMeasurements') || 'لا توجد مقاسات مسجلة بعد'}
              actionLabel={t('profile.addMeasurements') || 'إضافة مقاسات جديدة'}
              onAction={() => navigation.navigate('AddMeasurement', {})}
            />
          ) : (
            <>
              {measurements.map((ms) => (
                <TouchableOpacity
                  key={ms.id}
                  style={styles.cardContainer}
                  onPress={() => navigation.navigate('AddMeasurement', { measurementId: ms.id })}
                >
                  <MeasurementView
                    measurements={ms.data}
                    title={ms.name}
                    date={ms.createdAt ? new Date(ms.createdAt).toLocaleDateString('ar-SA') : undefined}
                  />
                </TouchableOpacity>
              ))}

              <Button
                title={t('profile.addMeasurements') || 'إضافة مقاسات جديدة'}
                onPress={() => navigation.navigate('AddMeasurement', {})}
                variant="primary"
                size="lg"
                fullWidth
                style={styles.addButton}
              />
            </>
          )}
        </ScrollView>
      )}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardContainer: { marginBottom: spacing.md },
});

export default MeasurementsScreen;

