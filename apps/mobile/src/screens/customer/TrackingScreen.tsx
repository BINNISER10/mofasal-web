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
import { serviceRequestsApi, TrackingData } from '../../services/api/serviceRequests';

type TrackingRouteProp = RouteProp<OrdersStackParamList, 'Tracking'>;

const SR_STATUS_LABELS: Record<string, string> = {
  PENDING: 'جارٍ تعيين مندوب',
  ASSIGNED: 'تم تعيين المندوب',
  EN_ROUTE: 'المندوب في الطريق إليك',
  ARRIVED: 'وصل المندوب',
  COMPLETED: 'اكتمل القياس',
};

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
  const serviceRequestId = (route.params as any)?.serviceRequestId as string | undefined;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [srTracking, setSrTracking] = useState<TrackingData | null>(null);

  // ─── تتبّع مندوب القياس (polling كل 10 ثوانٍ) ───
  const fetchSrTracking = useCallback(async () => {
    if (!serviceRequestId) return;
    try {
      const data = await serviceRequestsApi.getTracking(serviceRequestId);
      setSrTracking(data);
    } catch {
      // الإبقاء على آخر بيانات
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [serviceRequestId]);

  useEffect(() => {
    if (!serviceRequestId) return;
    fetchSrTracking();
    const interval = setInterval(fetchSrTracking, 10000);
    return () => clearInterval(interval);
  }, [serviceRequestId, fetchSrTracking]);

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
    if (!orderId) return;
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [orderId, fetchOrder]);

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

  // ═══ وضع تتبّع مندوب القياس ═══
  if (serviceRequestId) {
    const srStatus = srTracking?.status || 'PENDING';
    const eta = srTracking?.estimatedArrivalMin;
    const dist = srTracking?.distanceKm;
    const rep = srTracking?.representative;
    const arrived = srStatus === 'ARRIVED' || srStatus === 'COMPLETED';
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تتبّع مندوب القياس</Text>
          <View style={{ width: 40 }} />
        </View>
        {loading && !srTracking ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSrTracking(); }} colors={[colors.primary]} />
            }
          >
            {/* بطاقة الحالة + الوصول المقدّر */}
            <Card style={styles.orderInfoCard}>
              <View style={styles.orderStatusRow}>
                <View style={[styles.statusBadge, arrived && { backgroundColor: '#22C55E20' }]}>
                  <Text style={[styles.statusText, arrived && { color: '#22C55E' }]}>
                    {SR_STATUS_LABELS[srStatus] || srStatus}
                  </Text>
                </View>
                <Text style={styles.orderDate}>{srTracking?.shop?.nameAr || srTracking?.shop?.name || ''}</Text>
              </View>
              {!arrived && eta != null && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountVal}>{eta} دقيقة</Text>
                  <Text style={styles.amountLabel}>الوصول المتوقّع</Text>
                </View>
              )}
              {dist != null && (
                <View style={styles.amountRow}>
                  <Text style={styles.amountVal}>{dist} كم</Text>
                  <Text style={styles.amountLabel}>المسافة المتبقية</Text>
                </View>
              )}
            </Card>

            {/* بطاقة المندوب */}
            {rep && (
              <Card style={styles.timelineCard}>
                <Text style={styles.sectionTitle}>المندوب</Text>
                <View style={styles.repRow}>
                  <View style={styles.repAvatar}>
                    <Text style={styles.repAvatarText}>{(rep.name || 'م').charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repName}>{rep.name}</Text>
                    {rep.phone ? <Text style={styles.repPhone}>{rep.phone}</Text> : null}
                  </View>
                </View>
              </Card>
            )}

            {/* خريطة مبسّطة (إحداثيات) — تُستبدل بخريطة حقيقية لاحقاً */}
            <Card style={styles.timelineCard}>
              <Text style={styles.sectionTitle}>الموقع</Text>
              <View style={styles.mapPlaceholder}>
                <Text style={styles.mapEmoji}>🗺️</Text>
                <Text style={styles.mapText}>
                  {srTracking?.representativeLocation
                    ? `موقع المندوب: ${srTracking.representativeLocation.lat.toFixed(4)}, ${srTracking.representativeLocation.lng.toFixed(4)}`
                    : 'بانتظار تحديد موقع المندوب'}
                </Text>
                {arrived && <Text style={styles.arrivedText}>وصل المندوب — جاهز لأخذ القياس ✅</Text>}
              </View>
            </Card>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    );
  }

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
  repRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: spacing.md },
  repAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  repAvatarText: { color: colors.white, fontSize: fonts.sizes.xl, ...fonts.bold },
  repName: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold, textAlign: 'right' },
  repPhone: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'right', marginTop: 2 },
  mapPlaceholder: {
    backgroundColor: colors.surfaceWarm, borderRadius: borderRadius.md, padding: spacing.xl,
    alignItems: 'center',
  },
  mapEmoji: { fontSize: 40, marginBottom: spacing.sm },
  mapText: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'center' },
  arrivedText: { fontSize: fonts.sizes.md, color: colors.success, ...fonts.bold, textAlign: 'center', marginTop: spacing.md },
});

export default TrackingScreen;
