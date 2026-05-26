import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import OrderTrackingTimeline from '../../components/shared/OrderTrackingTimeline';
import Card from '../../components/ui/Card';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';
import apiClient from '../../services/api/client';

type TrackingRouteProp = RouteProp<OrdersStackParamList, 'Tracking'>;

const STATUS_STEPS = [
  'PENDING', 'CONFIRMED', 'MEASURING', 'CUTTING',
  'SEWING', 'FINISHING', 'READY', 'ON_WAY', 'DELIVERED',
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد المراجعة', CONFIRMED: 'تم القبول', MEASURING: 'أخذ القياسات',
  CUTTING: 'قص القماش', SEWING: 'خياطة وتجميع', FINISHING: 'كي وتشطيب',
  READY: 'جاهز للتوصيل', ON_WAY: 'في الطريق إليك', DELIVERED: 'تم التوصيل',
};

const TrackingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<TrackingRouteProp>();
  const orderId = route.params?.orderId;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await apiClient.get(`/orders/${orderId}`);
      setOrder(res.data);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchOrder]);

  const currentIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;
  const timelineSteps = STATUS_STEPS.map((s, i) => ({
    status: s,
    label: STATUS_LABELS[s],
    timestamp: i <= currentIdx ? order?.updated_at || order?.created_at : null,
    completed: i < currentIdx,
    active: i === currentIdx,
  }));

  const isOnWay = order?.status === 'ON_WAY';
  const isDelivered = order?.status === 'DELIVERED';

  const orderDate = order?.created_at
    ? new Date(order.created_at).toLocaleDateString('ar-SA')
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('tracking.title', 'تتبع الطلب')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchOrder(); }}
              colors={[colors.primary]}
            />
          }
        >
          {/* Order Info */}
          <Card style={styles.orderInfoCard}>
            <Text style={styles.orderNumber}>
              طلب #{order?.order_number || '---'}
            </Text>
            <View style={styles.orderStatusRow}>
              <View style={[
                styles.statusBadge,
                isDelivered && { backgroundColor: '#22C55E20' },
              ]}>
                <Text style={[
                  styles.statusText,
                  isDelivered && { color: '#22C55E' },
                ]}>
                  {STATUS_LABELS[order?.status] || order?.status}
                </Text>
              </View>
              <Text style={styles.orderDate}>{orderDate}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountVal}>{order?.total_amount} ر.س</Text>
              <Text style={styles.amountLabel}>الإجمالي</Text>
            </View>
          </Card>

          {/* Timeline */}
          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>حالة الطلب</Text>
            <OrderTrackingTimeline steps={timelineSteps} />
          </Card>

          {/* On-way info */}
          {isOnWay && (
            <Card style={styles.deliveryCard}>
              <Text style={styles.sectionTitle}>🚗 في الطريق إليك</Text>
              <Text style={styles.etaText}>الوقت المتوقع للوصول: ٣٠-٤٥ دقيقة</Text>
            </Card>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  headerShare: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.medium,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  orderInfoCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  orderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  orderDate: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  etaLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  amountRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: spacing.md, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.divider,
  },
  amountLabel: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  amountVal: { fontSize: fonts.sizes.lg, color: colors.primary, ...fonts.bold },
  timelineCard: { padding: spacing.lg, marginBottom: spacing.md },
  deliveryCard: { padding: spacing.lg, marginBottom: spacing.md },
  etaText: { fontSize: fonts.sizes.md, color: colors.textSecondary, textAlign: 'right', marginTop: 6 },
  sectionTitle: {
    fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold,
    textAlign: 'right', marginBottom: spacing.md,
  },
  etaValue: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
  },
});

export default TrackingScreen;
