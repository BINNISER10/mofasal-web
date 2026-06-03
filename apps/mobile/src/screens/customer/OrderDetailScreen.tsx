import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency, formatDate } from '../../utils/helpers';
import OrderTrackingTimeline from '../../components/shared/OrderTrackingTimeline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';
import { ordersApi, Order } from '../../services/api/orders';

type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>;

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد المراجعة',
  CONFIRMED: 'تم القبول',
  IN_PROGRESS: 'قيد التنفيذ',
  READY_FOR_DELIVERY: 'جاهز للتوصيل',
  OUT_FOR_DELIVERY: 'خرج للتوصيل',
  DELIVERED: 'تم التوصيل',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

const OrderDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order details:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر تحميل تفاصيل الطلب.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderId, navigation, t]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('orders.orderDetails')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>لم يتم العثور على الطلب المطلوب.</Text>
        </View>
      </View>
    );
  }

  const timelineSteps = (order.tracking || []).map((step) => ({
    status: step.status,
    label: STATUS_LABELS[step.status] || step.label,
    timestamp: step.timestamp ? new Date(step.timestamp).toLocaleDateString('ar-SA') : null,
    completed: step.completed,
    active: step.active,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.orderDetails') || 'تفاصيل الطلب'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.orderNumber}>طلب #{order.orderNumber}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('orders.orderDate') || 'تاريخ الطلب'}</Text>
            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('orders.totalAmount') || 'المبلغ الإجمالي'}</Text>
            <Text style={styles.infoValuePrice}>{formatCurrency(order.totalAmount)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('common.status') || 'حالة الطلب'}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{STATUS_LABELS[order.status] || order.status}</Text>
            </View>
          </View>
        </Card>

        {/* Timeline */}
        {timelineSteps.length > 0 && (
          <Card style={styles.timelineCard}>
            <OrderTrackingTimeline steps={timelineSteps} />
          </Card>
        )}

        {/* Items */}
        <Card style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>الخدمات المطلوبة</Text>
          {order.items.map((item, idx) => (
            <View key={idx} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name} (x{item.quantity})</Text>
              <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('orders.totalAmount') || 'المبلغ الإجمالي'}</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.totalAmount)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('orders.trackOrder') || 'تتبع الطلب'}
          onPress={() => navigation.navigate('Tracking', { orderId: order.id })}
          variant="primary"
          size="lg"
          fullWidth
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
    paddingBottom: 100,
  },
  infoCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  infoValuePrice: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
  },
  statusBadge: {
    backgroundColor: colors.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    color: colors.gold,
    ...fonts.bold,
  },
  timelineCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    ...fonts.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  totalValue: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  errorText: { fontSize: fonts.sizes.lg, color: colors.textSecondary, textAlign: 'center' },
});

export default OrderDetailScreen;
