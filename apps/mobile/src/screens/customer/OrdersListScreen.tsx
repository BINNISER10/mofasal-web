import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import OrderCard from '../../components/shared/OrderCard';
import EmptyState from '../../components/ui/EmptyState';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';
import apiClient from '../../services/api/client';

type OrdersNavProp = NativeStackNavigationProp<OrdersStackParamList, 'OrdersList'>;

const DONE_STATUSES = ['DELIVERED', 'CANCELLED', 'REJECTED'];

const statusLabel = (s: string) => ({
  PENDING: 'قيد المراجعة', CONFIRMED: 'مقبول', MEASURING: 'أخذ القياسات',
  CUTTING: 'قص القماش', SEWING: 'خياطة وتجميع', FINISHING: 'كي وتشطيب',
  READY: 'جاهز للتوصيل', ON_WAY: 'في الطريق إليك', DELIVERED: 'تم التوصيل',
  CANCELLED: 'ملغى', REJECTED: 'مرفوض',
}[s] || s);

const OrdersListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<OrdersNavProp>();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await apiClient.get('/orders');
      setAllOrders(res.data || []);
    } catch {
      setAllOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const activeOrders = allOrders.filter(o => !DONE_STATUSES.includes(o.status));
  const historyOrders = allOrders.filter(o => DONE_STATUSES.includes(o.status));
  const orders = activeTab === 'active' ? activeOrders : historyOrders;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.title')}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            {t('orders.active')} ({activeOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            {t('orders.history')} ({historyOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchOrders(); }} colors={[colors.primary]} />}
      >
        {!loading && orders.length === 0 ? (
          <EmptyState
            icon={activeTab === 'active' ? '📋' : '📦'}
            title={activeTab === 'active' ? t('orders.noActiveOrders') : t('orders.noOrderHistory')}
            message={activeTab === 'active' ? t('orders.browseShops') : undefined}
            actionLabel={activeTab === 'active' ? t('orders.browseShops') : undefined}
            onAction={() => navigation.getParent()?.navigate('HomeTab')}
          />
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              {...order}
              onPress={(id) => navigation.navigate('OrderDetail', { orderId: id })}
            />
          ))
        )}
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
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: fonts.sizes.xxl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: {
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    ...fonts.medium,
  },
  tabTextActive: {
    color: colors.primary,
    ...fonts.bold,
  },
  scrollContent: {
    padding: spacing.lg,
  },
});

export default OrdersListScreen;
