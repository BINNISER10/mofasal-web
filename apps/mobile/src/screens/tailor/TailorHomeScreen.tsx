import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import { ordersApi, Order } from '../../services/api/orders';
import { useAuthContext } from '../../services/auth/AuthContext';

const TABS = [
  { id: 'ALL', label: 'الكل' },
  { id: 'PENDING', label: 'جديد' },
  { id: 'CONFIRMED', label: 'مؤكد' },
  { id: 'IN_PROGRESS', label: 'تحت التنفيذ' },
  { id: 'READY_FOR_DELIVERY', label: 'جاهز' },
];

const TailorHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      // جلب الطلبات الخاصة بمحل الخياط
      const list = await ordersApi.list();
      // تصفية الطلبات الخاصة بـ shopId التابع للخياط
      const filtered = list.filter((ord) => ord.shopId === user?.shopId);
      setOrders(filtered);
    } catch (e) {
      console.error('Failed to fetch tailor orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getFilteredOrders = () => {
    if (activeTab === 'ALL') return orders;
    return orders.filter((o) => o.status === activeTab);
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('ar-SA');
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('TailorProfileTab', {
          screen: 'TailorOrderDetail',
          params: { orderId: item.id }
        })}
      >
        <Card style={styles.orderCard}>
          <View style={styles.cardHeader}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text style={styles.orderNumber}>طلب #{item.orderNumber.substring(0, 8)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBody}>
            <Text style={styles.clientName}>الزبون: {item.shopName || 'عميل مفصل'}</Text>
            <Text style={styles.orderInfo}>التاريخ: {formattedDate}</Text>
            <Text style={styles.priceText}>الإجمالي: {item.totalAmount} ر.س</Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>طابور الخياطة والتنفيذ</Text>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && orders.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={getFilteredOrders()}
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
              <Text style={styles.emptyText}>لا توجد طلبات في هذا القسم حالياً.</Text>
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
  tabsContainer: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.primary + '12',
  },
  tabText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    ...fonts.medium,
  },
  activeTabText: {
    color: colors.primary,
    ...fonts.bold,
  },
  list: {
    padding: spacing.lg,
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

export default TailorHomeScreen;
