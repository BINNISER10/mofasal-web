import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Card from '../ui/Card';
import MeasurementView from './MeasurementView';

interface MeasurementData {
  neck?: number;
  shoulders?: number;
  chest?: number;
  waist?: number;
  bicep?: number;
  forearm?: number;
  wrist?: number;
  sleeveLength?: number;
  shirtLength?: number;
  waistLower?: number;
  hips?: number;
  thigh?: number;
  knee?: number;
  calf?: number;
  inseam?: number;
  outseam?: number;
  trouserLength?: number;
  [key: string]: number | undefined;
}

interface FabricInfo {
  name: string;
  type?: string;
  color?: string;
  pattern?: string;
  quantity: number;
  price: number;
}

interface PriceBreakdown {
  subtotal: number;
  vat: number;
  deliveryFee: number;
  grandTotal: number;
}

interface ConfirmationSummaryProps {
  measurements?: MeasurementData;
  fabric?: FabricInfo;
  price: PriceBreakdown;
  deliveryDate?: string;
}

const ConfirmationSummary: React.FC<ConfirmationSummaryProps> = ({
  measurements,
  fabric,
  price,
  deliveryDate,
}) => {
  return (
    <View style={styles.container}>
      {measurements && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص المقاسات</Text>
          <MeasurementView measurements={measurements} />
        </Card>
      )}

      {fabric && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل القماش</Text>
          <View style={styles.fabricRow}>
            <Text style={styles.fabricName}>{fabric.name}</Text>
          </View>
          {fabric.type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>النوع</Text>
              <Text style={styles.detailValue}>{fabric.type}</Text>
            </View>
          )}
          {fabric.color && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>اللون</Text>
              <Text style={styles.detailValue}>{fabric.color}</Text>
            </View>
          )}
          {fabric.pattern && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>النقش</Text>
              <Text style={styles.detailValue}>{fabric.pattern}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>الكمية</Text>
            <Text style={styles.detailValue}>{fabric.quantity} متر</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>سعر القماش</Text>
            <Text style={[styles.detailValue, styles.priceText]}>
              {formatCurrency(fabric.price)}
            </Text>
          </View>
        </Card>
      )}

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>تفاصيل السعر</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>المجموع الفرعي</Text>
          <Text style={styles.priceValue}>{formatCurrency(price.subtotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>ضريبة القيمة المضافة ١٥٪</Text>
          <Text style={styles.priceValue}>{formatCurrency(price.vat)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>رسوم التوصيل</Text>
          <Text style={styles.priceValue}>{formatCurrency(price.deliveryFee)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>الإجمالي الكلي</Text>
          <Text style={styles.totalValue}>{formatCurrency(price.grandTotal)}</Text>
        </View>
      </Card>

      {deliveryDate && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>تاريخ التوصيل</Text>
          <Text style={styles.deliveryDate}>{formatDate(deliveryDate)}</Text>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'right',
    ...fonts.bold,
  },
  fabricRow: {
    marginBottom: spacing.sm,
  },
  fabricName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    ...fonts.bold,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  priceText: {
    color: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
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
  deliveryDate: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    ...fonts.bold,
  },
});

export default ConfirmationSummary;
