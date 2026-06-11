import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ordersApi, Order } from '../../services/api/orders';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'جديد (انتظار التأكيد)',
  CONFIRMED: 'تم القبول (بانتظار التفصيل)',
  IN_PROGRESS: 'تحت الخياطة والتنفيذ',
  READY_FOR_DELIVERY: 'جاهز للتسليم',
  OUT_FOR_DELIVERY: 'خرج مع المندوب للتوصيل',
  DELIVERED: 'تم تسليمه للعميل',
  COMPLETED: 'مكتمل ومغلق',
  CANCELLED: 'ملغى',
};

const NEXT_STATUS: Record<string, { status: string; label: string }> = {
  PENDING: { status: 'CONFIRMED', label: 'قبول وتأكيد الطلب ✓' },
  CONFIRMED: { status: 'IN_PROGRESS', label: 'بدء التفصيل والخياطة ✂️' },
  IN_PROGRESS: { status: 'READY_FOR_DELIVERY', label: 'تعليم كجاهز للتسليم 👕' },
  READY_FOR_DELIVERY: { status: 'OUT_FOR_DELIVERY', label: 'تسليم المندوب للتوصيل 🚚' },
  OUT_FOR_DELIVERY: { status: 'DELIVERED', label: 'تسجيل كتم التوصيل 🏁' },
  DELIVERED: { status: 'COMPLETED', label: 'إغلاق واكتمال الطلب 🔐' },
};

type RouteParams = RouteProp<{ Params: { orderId: string } }, 'Params'>;

const TailorOrderDetailScreen: React.FC = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const orderId = route.params?.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await ordersApi.getById(orderId);
      setOrder(data);
    } catch (e) {
      Alert.alert('خطأ', 'تعذر جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    const transition = NEXT_STATUS[order.status];
    if (!transition) return;

    setUpdating(true);
    try {
      await ordersApi.updateStatus(order.id, transition.status);
      Alert.alert('تم التحديث', `تم نقل حالة الطلب إلى: ${STATUS_LABELS[transition.status]}`);
      fetchOrder();
    } catch (e: any) {
      Alert.alert('تعذر التحديث', e?.response?.data?.error?.message || 'حدث خطأ أثناء نقل حالة الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    Alert.alert('تأكيد الإلغاء', 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟', [
      { text: 'تراجع', style: 'cancel' },
      {
        text: 'إلغاء الطلب',
        style: 'destructive',
        onPress: async () => {
          setUpdating(true);
          try {
            await ordersApi.cancel(order.id);
            Alert.alert('تم الإلغاء', 'تم إلغاء الطلب بنجاح');
            fetchOrder();
          } catch (e) {
            Alert.alert('خطأ', 'فشل إلغاء الطلب');
          } finally {
            setUpdating(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>لم يتم العثور على الطلب</Text>
      </View>
    );
  }

  const nextAction = NEXT_STATUS[order.status];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الطلب #{order.orderNumber.substring(0, 8)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* بطاقة معلومات الطلب */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>حالة الطلب</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{STATUS_LABELS[order.status] || order.status}</Text>
            </View>
            <Text style={styles.dateText}>التاريخ: {new Date(order.createdAt).toLocaleDateString('ar-SA')}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceVal}>{order.totalAmount} ر.س</Text>
            <Text style={styles.priceLabel}>قيمة الطلب الإجمالية:</Text>
          </View>
        </Card>

        {/* مواصفات الثوب والقطع المطلوبة */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>المواصفات المطلوبة</Text>
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemQty}>x{item.quantity}</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.fabricType || item.color ? (
                    <Text style={styles.itemSub}>
                      قماش: {item.fabricType || 'غير محدد'} | لون: {item.color || 'غير محدد'}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>تفصيل ثوب سعودي فاخر</Text>
          )}

          {order.notes ? (
            <View style={styles.notesWrap}>
              <Text style={styles.infoLabel}>ملاحظات العميل:</Text>
              <Text style={styles.infoValue}>{order.notes}</Text>
            </View>
          ) : null}
        </Card>

        {/* قياسات الزبون (المقاسات الاحترافية) */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>ورقة المقاسات</Text>
          {order.measurements ? (
            <View style={styles.measurementsGrid}>
              {Object.entries(order.measurements).map(([key, val]) => (
                <View key={key} style={styles.measureItem}>
                  <Text style={styles.measureLabel}>{key}</Text>
                  <Text style={styles.measureVal}>{val} سم</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noMeasureWrap}>
              <Text style={styles.noMeasureText}>لم يتم تسجيل المقاسات لهذا الطلب بعد.</Text>
            </View>
          )}
        </Card>

        {/* أزرار الإجراءات وتحديث الحالة */}
        <View style={styles.actionsWrap}>
          {nextAction ? (
            <Button
              title={nextAction.label}
              onPress={handleUpdateStatus}
              variant="primary"
              size="lg"
              fullWidth
              loading={updating}
              disabled={updating}
              style={styles.actionBtn}
            />
          ) : null}

          {['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(order.status) ? (
            <Button
              title="إلغاء الطلب 🚨"
              onPress={handleCancelOrder}
              variant="secondary"
              size="lg"
              fullWidth
              disabled={updating}
            />
          ) : null}
        </View>
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    fontSize: 24,
    color: colors.textPrimary,
    width: 40,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: fonts.sizes.md,
    color: colors.error,
    ...fonts.medium,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: colors.primary + '18',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    ...fonts.bold,
  },
  dateText: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  priceVal: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
  },
  priceLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemQty: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.bold,
    marginLeft: spacing.md,
  },
  itemName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
  },
  itemSub: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    textAlign: 'right',
  },
  notesWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  infoLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    ...fonts.medium,
  },
  measurementsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
  },
  measureItem: {
    width: '30%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    alignItems: 'center',
  },
  measureLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  measureVal: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  noMeasureWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  noMeasureText: {
    color: colors.textLight,
    fontSize: fonts.sizes.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    textAlign: 'right',
  },
  actionsWrap: {
    marginTop: spacing.lg,
  },
  actionBtn: {
    marginBottom: spacing.md,
  },
});

export default TailorOrderDetailScreen;
