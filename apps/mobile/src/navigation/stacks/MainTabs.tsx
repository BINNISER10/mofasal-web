import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { colors, fonts, shadows } from '../../utils/theme';
import { useNotifications } from '../../hooks/useNotifications';
import HomeStack from './HomeStack';
import MarketplaceStack from './MarketplaceStack';
import OrdersStack from './OrdersStack';
import ProfileStack from './ProfileStack';
import NotificationsScreen from '../../screens/customer/NotificationsScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  MarketplaceTab: undefined;
  OrdersTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon: React.FC<{ name: string; focused: boolean; badge?: number }> = ({
  name,
  focused,
  badge,
}) => {
  const iconMap: Record<string, string> = {
    home: '🏠',
    marketplace: '🛍️',
    orders: '📋',
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

const MainTabs: React.FC = () => {
  const { t } = useTranslation();
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
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MarketplaceTab"
        component={MarketplaceStack}
        options={{
          tabBarLabel: t('tabs.marketplace'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="marketplace" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          tabBarLabel: t('tabs.orders'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="orders" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: t('tabs.notifications'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="notifications" focused={focused} badge={unreadCount} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: t('tabs.profile'),
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

export default MainTabs;
