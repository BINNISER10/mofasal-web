import React from 'react';
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
import { formatCurrency, formatDate } from '../../utils/helpers';
import OrderTrackingTimeline from '../../components/shared/OrderTrackingTimeline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { OrdersStackParamList } from '../../navigation/stacks/OrdersStack';

type OrderDetailRouteProp = RouteProp<OrdersStackParamList, 'OrderDetail'>;

const MOCK_TRACKING = [
  { status: 'received', timestamp: '2024-01-20 10:30', completed: true, active: false },
  { status: 'staff_on_way', timestamp: '2024-01-20 14:00', completed: true, active: false },
  { status: 'taking_measurements', timestamp: '2024-01-20 15:30', completed: true, active: false },
  { status: 'cutting_fabric', timestamp: '2024-01-21 09:00', completed: true, active: false },
  { status: 'sewing_assembly', timestamp: null, completed: false, active: true },
  { status: 'ironing_finishing', timestamp: null, completed: false, active: false },
  { status: 'packing_wrapping', timestamp: null, completed: false, active: false },
  { status: 'on_way_to_you', timestamp: null, completed: false, active: false },
  { status: 'delivered', timestamp: null, completed: false, active: false },
];

const OrderDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<OrderDetailRouteProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('orders.orderDetails')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.orderNumber}>طلب #MF-ABC123</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('orders.orderDate')}</Text>
            <Text style={styles.infoValue}>{formatDate('2024-01-20')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('orders.totalAmount')}</Text>
            <Text style={styles.infoValuePrice}>{formatCurrency(950)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('common.status')}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>قيد التنفيذ</Text>
            </View>
          </View>
        </Card>

        {/* Timeline */}
        <Card style={styles.timelineCard}>
          <OrderTrackingTimeline steps={MOCK_TRACKING} />
        </Card>

        {/* Items */}
        <Card style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>الخدمات المطلوبة</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>خياطة بدلة كاملة</Text>
            <Text style={styles.itemPrice}>{formatCurrency(800)}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>قياس منزلي</Text>
            <Text style={styles.itemPrice}>مجاني</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('orders.totalAmount')}</Text>
            <Text style={styles.totalValue}>{formatCurrency(950)}</Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={t('orders.trackOrder')}
          onPress={() => navigation.navigate('Tracking', { orderId: route.params.orderId })}
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
});

export default OrderDetailScreen;
