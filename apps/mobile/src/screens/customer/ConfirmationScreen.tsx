import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import ConfirmationSummary from '../../components/shared/ConfirmationSummary';
import { HomeStackParamList } from '../../navigation/stacks/HomeStack';

type ConfirmationRouteProp = RouteProp<HomeStackParamList, 'Confirmation'>;

const MOCK_MEASUREMENTS = {
  neck: 40, shoulders: 48, chest: 100, waist: 85, bicep: 32,
  forearm: 28, wrist: 17, sleeveLength: 62, shirtLength: 78,
  waistLower: 90, hips: 98, thigh: 55, knee: 38, calf: 36,
  inseam: 78, outseam: 104, trouserLength: 105,
};

const MOCK_FABRIC = {
  name: 'قماش صوف إيطالي فاخر',
  type: 'صوف',
  color: 'كحلي غامق',
  pattern: 'سادة',
  quantity: 3,
  price: 540,
};

const MOCK_PRICE = {
  subtotal: 800,
  vat: 120,
  deliveryFee: 30,
  grandTotal: 950,
};

const ConfirmationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ConfirmationRouteProp>();
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = () => {
    setShowSuccess(true);
    setTimeout(() => {
      navigation.navigate('Tracking', { orderId: route.params.orderId || '1' });
    }, 2500);
  };

  const handleRequestChanges = () => {
    setConfirmed(false);
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successAnimation}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>{t('confirmation.orderConfirmed')}</Text>
        <Text style={styles.successMessage}>
          {t('confirmation.successMessage')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('confirmation.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ConfirmationSummary
          measurements={MOCK_MEASUREMENTS}
          fabric={MOCK_FABRIC}
          price={MOCK_PRICE}
          deliveryDate="2024-02-01"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('confirmation.requestChanges')}
          onPress={handleRequestChanges}
          variant="secondary"
          size="lg"
          style={styles.footerButton}
        />
        <Button
          title={t('confirmation.confirmOrder')}
          onPress={handleConfirm}
          variant="primary"
          size="lg"
          style={styles.footerButton}
        />
      </View>
    </View>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: 30,
    backgroundColor: colors.white,
    gap: 12,
    ...shadows.lg,
  },
  footerButton: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  successAnimation: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  successCheck: {
    fontSize: 48,
    color: colors.primary,
    ...fonts.bold,
  },
  successTitle: {
    fontSize: fonts.sizes.title,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    ...fonts.bold,
  },
  successMessage: {
    fontSize: fonts.sizes.lg,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
  },
});

export default ConfirmationScreen;
