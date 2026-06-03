import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, fonts, shadows } from '../../utils/theme';
import { useNotifications } from '../../hooks/useNotifications';
import MerchantHomeScreen from '../../screens/merchant/MerchantHomeScreen';
import MerchantOrdersScreen from '../../screens/merchant/MerchantOrdersScreen';
import ProfileStack from './ProfileStack';
import NotificationsScreen from '../../screens/customer/NotificationsScreen';

export type MerchantTabParamList = {
  MerchantHomeTab: undefined;
  MerchantOrdersTab: undefined;
  MerchantNotificationsTab: undefined;
  MerchantProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MerchantTabParamList>();

const TabIcon: React.FC<{ name: string; focused: boolean; badge?: number }> = ({
  name,
  focused,
  badge,
}) => {
  const iconMap: Record<string, string> = {
    products: '🧵',
    orders: '🛍️',
    notifications: '🔔',
    profile: '👤',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {iconMap[name] || '●'}
      </Text>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </View>
  );
};

const MerchantTabs: React.FC = () => {
  const { unreadCount } = useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tab.Screen
        name="MerchantHomeTab"
        component={MerchantHomeScreen}
        options={{
          tabBarLabel: 'المنتجات والمخزون',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="products" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MerchantOrdersTab"
        component={MerchantOrdersScreen}
        options={{
          tabBarLabel: 'مبيعات الأقمشة',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="orders" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MerchantNotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'الإشعارات',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="notifications" focused={focused} badge={unreadCount} />
          ),
        }}
      />
      <Tab.Screen
        name="MerchantProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'الملف الشخصي',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    ...shadows.md,
  },
  tabLabel: {
    ...fonts.sizes.xs,
    fontFamily: undefined,
    fontWeight: '500',
  },
  tabItem: {
    paddingVertical: 4,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconActive: {
    opacity: 1,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default MerchantTabs;
