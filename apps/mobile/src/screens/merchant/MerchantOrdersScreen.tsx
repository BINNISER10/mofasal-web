import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { colors, fonts, borderRadius, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import { ordersApi, Order } from '../../services/api/orders';
import { useAuthContext } from '../../services/auth/AuthContext';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'انتظار القبول',
  CONFIRMED: 'مؤكد',
  IN_PROGRESS: 'تحت التجهيز',
  READY_FOR_DELIVERY: 'جاهز للشحن',
  OUT_FOR_DELIVERY: 'في الشحن',
  DELIVERED: 'تم التسليم',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
};

const MerchantOrdersScreen: React.FC = () => {
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // جلب جميع الطلبات التي تضم مبيعات الأقمشة
      const list = await ordersApi.list();
      // في سياق التاجر: نعرض الطلبات التي تضم منتجات التاجر
      // لمحاكاة ذلك، نفلتر الطلبات التي يطابق فيها اسم المتجر أو تفاصيل العناصر
      const merchantOrders = list.filter(
        (o) => o.items && o.items.some((item) => item.name.includes('قماش') || item.fabricType)
      );
      setOrders(merchantOrders.length > 0 ? merchantOrders : list);
    } catch (e) {
      console.error('Failed to fetch merchant sales orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const calculateTotalSales = () => {
    return orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.totalAmount, 0);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('ar-SA');
    return (
      <Card style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{STATUS_LABELS[item.status] || item.status}</Text>
          </View>
          <Text style={styles.orderNumber}>طلب #{item.orderNumber.substring(0, 8)}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <Text style={styles.clientName}>الزبون: {item.shopName || 'عميل مفصل'}</Text>
          <Text style={styles.orderInfo}>التاريخ: {formattedDate}</Text>
          <Text style={styles.priceText}>قيمة المبيعات: {item.totalAmount} ر.س</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مبيعات الأقمشة والطلبات</Text>
      </View>

      {/* لوحة المبيعات الإجمالية */}
      <View style={styles.summarySection}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>إجمالي المبيعات المحققة</Text>
          <Text style={styles.summaryVal}>{calculateTotalSales()} ر.س</Text>
        </Card>
      </View>

      {loading && orders.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchOrders(); }}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>لا توجد مبيعات أقمشة مسجلة حالياً.</Text>
            </View>
          }
        />
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
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.primary,
    ...fonts.bold,
  },
  summarySection: {
    padding: spacing.lg,
  },
  summaryCard: {
    padding: spacing.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.white,
    opacity: 0.85,
    marginBottom: spacing.xs,
  },
  summaryVal: {
    fontSize: fonts.sizes.xxxl,
    color: colors.white,
    ...fonts.bold,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  orderCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
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
  orderNumber: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  cardBody: {
    alignItems: 'flex-end',
  },
  clientName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    marginBottom: 4,
  },
  priceText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.bold,
    marginTop: 4,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textLight,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
});

export default MerchantOrdersScreen;
