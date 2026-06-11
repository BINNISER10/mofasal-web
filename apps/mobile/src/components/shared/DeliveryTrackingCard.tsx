import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../ui/Card';

interface DeliveryTrackingCardProps {
  providerName: string;
  driverName?: string;
  driverPhone?: string;
  vehicleType?: string;
  plateNumber?: string;
  estimatedMinutes: number;
  trackingUrl?: string;
}

const DeliveryTrackingCard: React.FC<DeliveryTrackingCardProps> = ({
  providerName,
  driverName,
  driverPhone,
  vehicleType,
  plateNumber,
  estimatedMinutes,
  trackingUrl,
}) => {
  const handleCall = () => {
    if (driverPhone) {
      Linking.openURL(`tel:${driverPhone}`);
    }
  };

  const handleOpenTracking = () => {
    if (trackingUrl) {
      Linking.openURL(trackingUrl);
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.providerName}>{providerName}</Text>
        <View style={styles.etaBadge}>
          <Text style={styles.etaText}>{estimatedMinutes} دقيقة</Text>
        </View>
      </View>

      {driverName && (
        <View style={styles.driverSection}>
          <View style={styles.driverInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {driverName.charAt(0)}
              </Text>
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driverName}</Text>
              {vehicleType && (
                <Text style={styles.vehicleInfo}>
                  {vehicleType} {plateNumber ? `| ${plateNumber}` : ''}
                </Text>
              )}
            </View>
          </View>
          {driverPhone && (
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {trackingUrl && (
        <TouchableOpacity
          style={styles.trackingLink}
          onPress={handleOpenTracking}
        >
          <Text style={styles.trackingLinkText}>تتبع عبر {providerName}</Text>
          <Text style={styles.trackingArrow}>←</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  providerName: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  etaBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  etaText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    ...fonts.bold,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    ...fonts.bold,
  },
  driverDetails: {
    alignItems: 'flex-end',
  },
  driverName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  vehicleInfo: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 18,
  },
  trackingLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  trackingLinkText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.medium,
  },
  trackingArrow: {
    fontSize: 16,
    color: colors.primary,
  },
});

export default DeliveryTrackingCard;
