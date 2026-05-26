import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useAuthContext } from '../../services/auth/AuthContext';
import { ProfileStackParamList } from '../../navigation/stacks/ProfileStack';

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

const MENU_ITEMS = [
  { id: 'measurements', label: 'مقاساتي', icon: '📏', screen: 'Measurements' as const },
  { id: 'addresses', label: 'عناويني', icon: '📍', screen: 'Addresses' as const },
  { id: 'notifications', label: 'الإشعارات', icon: '🔔', screen: 'ProfileNotifications' as const },
  { id: 'language', label: 'اللغة', icon: '🌐', screen: null },
  { id: 'about', label: 'حول التطبيق', icon: 'ℹ️', screen: null },
];

const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNavProp>();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    Alert.alert(t('auth.logout'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('auth.logout'), style: 'destructive', onPress: logout },
    ]);
  };

  const handleMenuPress = (item: typeof MENU_ITEMS[0]) => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name_ar?.charAt(0) || 'م'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name_ar || 'مستخدم مفصل'}</Text>
          <Text style={styles.userPhone}>{user?.phone || '+9665XXXXXXXX'}</Text>
          <Text style={styles.userRole}>
            {user?.role === 'CUSTOMER' ? 'عميل' : user?.role === 'SHOP_OWNER' ? 'محل خياطة' : user?.role === 'TAILOR' ? 'خياط' : 'تاجر'}
          </Text>
        </Card>

        {/* Menu Items */}
        <Card style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => handleMenuPress(item)}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>←</Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <Text style={styles.version}>{t('profile.appVersion')} ١.٠.٠</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerTitle: { fontSize: fonts.sizes.xxl, color: colors.textPrimary, ...fonts.bold },
  scrollContent: { padding: spacing.lg },
  profileCard: {
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: 32, color: colors.white, ...fonts.bold },
  userName: { fontSize: fonts.sizes.xxl, color: colors.textPrimary, ...fonts.bold, marginBottom: 4 },
  userPhone: { fontSize: fonts.sizes.md, color: colors.textSecondary, marginBottom: 4 },
  userRole: {
    fontSize: fonts.sizes.sm, color: colors.primary, ...fonts.medium,
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.md, paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  menuCard: { padding: 0, marginBottom: spacing.md, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.lg, paddingHorizontal: spacing.lg,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  menuIcon: { fontSize: 22, marginLeft: spacing.md },
  menuLabel: { flex: 1, fontSize: fonts.sizes.lg, color: colors.textPrimary, textAlign: 'right' },
  menuArrow: { fontSize: 18, color: colors.textLight },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, backgroundColor: colors.white,
    borderRadius: borderRadius.lg, marginBottom: spacing.md, gap: 8,
    ...shadows.sm,
  },
  logoutIcon: { fontSize: 20 },
  logoutText: { fontSize: fonts.sizes.lg, color: colors.error, ...fonts.bold },
  version: { fontSize: fonts.sizes.sm, color: colors.textLight, textAlign: 'center', marginBottom: 40 },
});

export default ProfileScreen;
