import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';
import Badge from '../ui/Badge';
import * as Progress from 'react-native-progress';

interface OrderCardProps {
  id: string;
  orderNumber: string;
  shopName: string;
  shopLogo?: string;
  status: string;
  statusLabel: string;
  totalAmount: number;
  createdAt: string;
  trackingProgress: number;
  onPress: (id: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  id,
  orderNumber,
  shopName,
  shopLogo,
  status,
  statusLabel,
  totalAmount,
  createdAt,
  trackingProgress,
  onPress,
}) => {
  const statusColor = getStatusColor(status);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(id)}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.shopInfo}>
          {shopLogo && (
            <Image source={{ uri: shopLogo }} style={styles.logo} />
          )}
          <View style={styles.shopText}>
            <Text style={styles.shopName}>{shopName}</Text>
            <Text style={styles.orderNum}>{orderNumber}</Text>
          </View>
        </View>
        <Badge label={statusLabel} color={statusColor} size="sm" />
      </View>
      <View style={styles.body}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>التاريخ</Text>
          <Text style={styles.infoValue}>{formatDate(createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>المبلغ</Text>
          <Text style={[styles.infoValue, styles.amount]}>
            {formatCurrency(totalAmount)}
          </Text>
        </View>
      </View>
      <View style={styles.progressSection}>
        <Progress.Bar
          progress={trackingProgress}
          width={null}
          height={4}
          color={statusColor}
          unfilledColor={colors.border}
          borderWidth={0}
          borderRadius={2}
        />
        <Text style={styles.progressLabel}>
          {Math.round(trackingProgress * 100)}% مكتمل
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  shopText: {
    alignItems: 'flex-end',
  },
  shopName: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  orderNum: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
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
  amount: {
    color: colors.primary,
    ...fonts.bold,
  },
  progressSection: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
  },
});

export default OrderCard;
