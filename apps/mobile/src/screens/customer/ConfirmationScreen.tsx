import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmationSummary from '../../components/shared/ConfirmationSummary';
import { HomeStackParamList } from '../../navigation/stacks/HomeStack';
import { ordersApi, Order } from '../../services/api/orders';

type ConfirmationRouteProp = RouteProp<HomeStackParamList, 'Confirmation'>;

const ConfirmationScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ConfirmationRouteProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeText, setChangeText] = useState('');

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order confirmation details:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر تحميل تفاصيل الطلب للتأكيد.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderId, navigation, t]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await ordersApi.submitConfirmation(orderId, { confirmed: true });
      setShowSuccess(true);
      setTimeout(() => {
        navigation.navigate('Tracking' as never, { orderId } as never);
      }, 2500);
    } catch (error) {
      console.error('Failed to confirm order:', error);
      Alert.alert(t('common.error') || 'خطأ', 'فشل اعتماد الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changeText.trim()) {
      Alert.alert(t('common.validationError') || 'تنبيه', 'يرجى كتابة التعديلات المطلوبة.');
      return;
    }

    try {
      setSubmitting(true);
      await ordersApi.submitConfirmation(orderId, {
        confirmed: false,
        changesRequested: changeText,
      });
      setShowChangeModal(false);
      Alert.alert(t('common.success') || 'نجاح', 'تم إرسال طلب التعديل بنجاح.', [
        {
          text: t('common.ok') || 'موافق',
          onPress: () => {
            navigation.navigate('Marketplace' as never);
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to request changes:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر إرسال طلب التعديل.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successAnimation}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>{t('confirmation.orderConfirmed') || 'تم اعتماد الطلب!'}</Text>
        <Text style={styles.successMessage}>
          {t('confirmation.successMessage') || 'تم قبول مقاساتك وبند الطلب بنجاح. جاري المتابعة للتنفيذ.'}
        </Text>
      </View>
    );
  }

  if (!order) return null;

  // Map fabric from first item in order
  const firstItem = order.items?.[0];
  const fabricInfo = firstItem ? {
    name: firstItem.name,
    type: firstItem.fabricType || 'قماش ثوب رجالي',
    color: firstItem.color || 'أبيض كلاسيكي',
    pattern: firstItem.pattern || 'سادة',
    quantity: firstItem.quantity || 3.5,
    price: firstItem.price || 0,
  } : undefined;

  const priceInfo = {
    subtotal: order.subtotal || order.totalAmount * 0.85,
    vat: order.vat || order.totalAmount * 0.15,
    deliveryFee: order.deliveryFee || 0,
    grandTotal: order.totalAmount,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('confirmation.title') || 'مراجعة واعتماد الطلب'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <ConfirmationSummary
          measurements={order.measurements}
          fabric={fabricInfo}
          price={priceInfo}
          deliveryDate={order.confirmedDeliveryDate || order.scheduledDate}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('confirmation.requestChanges') || 'طلب تعديل'}
          onPress={() => setShowChangeModal(true)}
          variant="secondary"
          size="lg"
          disabled={submitting}
          style={styles.footerButton}
        />
        <Button
          title={t('confirmation.confirmOrder') || 'اعتماد الطلب'}
          onPress={handleConfirm}
          variant="primary"
          size="lg"
          disabled={submitting}
          style={styles.footerButton}
        />
      </View>

      <Modal visible={showChangeModal} onClose={() => setShowChangeModal(false)} title="طلب تعديلات">
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>يرجى تحديد التغييرات أو التعديلات المطلوبة على المقاسات أو الطلب:</Text>
          <TextInput
            style={styles.modalInput}
            multiline
            numberOfLines={4}
            placeholder="مثال: زيادة طول الكم ٢ سم..."
            placeholderTextColor={colors.textLight}
            value={changeText}
            onChangeText={setChangeText}
            textAlign="right"
          />
          <View style={styles.modalActions}>
            <Button
              title="إرسال الطلب"
              onPress={handleRequestChanges}
              variant="primary"
              size="md"
              disabled={submitting}
              style={{ flex: 1 }}
            />
            <Button
              title="إلغاء"
              onPress={() => setShowChangeModal(false)}
              variant="outline"
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </Modal>
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
    padding: spacing.xxl,
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  modalContent: { padding: spacing.lg },
  modalLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, textAlign: 'right', marginBottom: spacing.md },
  modalInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 15, color: colors.textPrimary, textAlign: 'right',
    height: 100, textAlignVertical: 'top', marginBottom: spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
});

export default ConfirmationScreen;
