import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';

type PaymentMethod =
  | 'mada'
  | 'visa'
  | 'mastercard'
  | 'apple_pay'
  | 'google_pay'
  | 'stc_pay'
  | 'tamara'
  | 'tabby'
  | 'sadad'
  | 'bank_transfer'
  | 'cod';

interface PaymentMethodConfig {
  id: PaymentMethod;
  nameAr: string;
  nameEn: string;
  icon: string;
  description?: string;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  { id: 'mada', nameAr: 'مدى', nameEn: 'Mada', icon: '💳' },
  { id: 'visa', nameAr: 'فيزا', nameEn: 'Visa', icon: '💳' },
  { id: 'mastercard', nameAr: 'ماستركارد', nameEn: 'Mastercard', icon: '💳' },
  { id: 'apple_pay', nameAr: 'Apple Pay', nameEn: 'Apple Pay', icon: '🍎' },
  { id: 'google_pay', nameAr: 'Google Pay', nameEn: 'Google Pay', icon: '🔵' },
  { id: 'stc_pay', nameAr: 'STC Pay', nameEn: 'STC Pay', icon: '📱' },
  { id: 'tamara', nameAr: 'تمارا', nameEn: 'Tamara', icon: '💜', description: 'اشتر الآن وادفع لاحقاً' },
  { id: 'tabby', nameAr: 'طابي', nameEn: 'Tabby', icon: '💙', description: 'اشتر الآن وادفع لاحقاً' },
  { id: 'sadad', nameAr: 'سداد', nameEn: 'SADAD', icon: '🏦' },
  { id: 'bank_transfer', nameAr: 'تحويل بنكي', nameEn: 'Bank Transfer', icon: '🏛️' },
  { id: 'cod', nameAr: 'الدفع عند الاستلام', nameEn: 'Cash on Delivery', icon: '💵' },
];

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      {PAYMENT_METHODS.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodItem, isSelected && styles.selectedItem]}
            onPress={() => onSelect(method.id)}
            activeOpacity={0.8}
          >
            <View style={styles.radioOuter}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <View style={styles.methodInfo}>
              <Text style={[styles.methodName, isSelected && styles.selectedText]}>
                {method.nameAr}
              </Text>
              {method.description && (
                <Text style={styles.methodDesc}>{method.description}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selectedItem: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  methodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  methodName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  selectedText: {
    color: colors.primary,
    ...fonts.bold,
  },
  methodDesc: {
    fontSize: fonts.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default PaymentMethodSelector;
