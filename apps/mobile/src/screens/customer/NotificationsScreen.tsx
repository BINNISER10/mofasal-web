import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatDateTime } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';
import Card from '../../components/ui/Card';
import { useNotifications } from '../../hooks/useNotifications';

const NOTIFICATION_ICONS: Record<string, string> = {
  order_status: '📦',
  order_confirmed: '✅',
  order_shipped: '🚚',
  order_delivered: '🎉',
  new_message: '💬',
  promotional: '🏷️',
  measurement_reminder: '📏',
  payment_received: '💰',
  driver_assigned: '🚗',
  changes_requested: '✏️',
  rating_request: '⭐',
};

const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllRead}>{t('notifications.markAllRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title={t('notifications.noNotifications')}
          />
        ) : (
          notifications.map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifItem, !notif.read && styles.notifUnread]}
              onPress={() => markAsRead(notif.id)}
            >
              <Text style={styles.notifIcon}>
                {NOTIFICATION_ICONS[notif.type] || '🔔'}
              </Text>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]}>
                  {notif.titleAr || notif.title}
                </Text>
                <Text style={styles.notifBody} numberOfLines={2}>
                  {notif.bodyAr || notif.body}
                </Text>
                <Text style={styles.notifTime}>
                  {formatDateTime(notif.createdAt)}
                </Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary, width: 40 },
  headerTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold },
  markAllRead: { fontSize: fonts.sizes.sm, color: colors.primary, ...fonts.medium },
  scrollContent: { padding: spacing.lg },
  notifItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: spacing.md, paddingHorizontal: spacing.md,
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    marginBottom: spacing.sm, ...shadows.sm,
  },
  notifUnread: { backgroundColor: colors.primary + '05' },
  notifIcon: { fontSize: 24, marginLeft: spacing.md, marginTop: 2 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium, textAlign: 'right', marginBottom: 4 },
  notifTitleUnread: { ...fonts.bold },
  notifBody: { fontSize: fonts.sizes.sm, color: colors.textSecondary, textAlign: 'right', lineHeight: 20, marginBottom: 4 },
  notifTime: { fontSize: fonts.sizes.xs, color: colors.textLight, textAlign: 'right' },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary, marginTop: 6,
  },
});

export default NotificationsScreen;
