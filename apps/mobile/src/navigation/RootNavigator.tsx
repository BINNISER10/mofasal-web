import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../utils/theme';
import AuthStack from './stacks/AuthStack';
import MainTabs from './stacks/MainTabs';
import RepresentativeTabs from './stacks/RepresentativeTabs';
import TailorTabs from './stacks/TailorTabs';
import MerchantTabs from './stacks/MerchantTabs';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

const linking = {
  prefixes: ['mufasal://'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              ShopDetail: 'shop/:shopId',
              Tracking: 'tracking/:orderId',
            },
          },
          MarketplaceTab: {
            screens: {
              Marketplace: 'marketplace',
              ProductDetail: 'product/:productId',
              Cart: 'cart',
              Checkout: 'checkout',
              Payment: 'payment',
            },
          },
          OrdersTab: {
            screens: {
              OrdersList: 'orders',
              OrderDetail: 'orders/:orderId',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
              Measurements: 'measurements',
              Addresses: 'addresses',
            },
          },
        },
      },
    },
  },
};

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('onboarding_done').then((val) => {
      if (!val) setShowOnboarding(true);
    });
  }, []);

  const handleSplashDone = useCallback(() => setShowSplash(false), []);
  const handleOnboardingDone = useCallback(async () => {
    await AsyncStorage.setItem('onboarding_done', '1');
    setShowOnboarding(false);
  }, []);

  if (showSplash) return <SplashScreen onFinish={handleSplashDone} />;
  if (showOnboarding) return <OnboardingScreen onDone={handleOnboardingDone} />;

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderMainTabs = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'REPRESENTATIVE') {
      return <RepresentativeTabs />;
    }
    if (role === 'TAILOR' || role === 'TAILOR_SHOP') {
      return <TailorTabs />;
    }
    if (role === 'MERCHANT' || role === 'FABRIC_MERCHANT') {
      return <MerchantTabs />;
    }
    return <MainTabs />;
  };

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        dark: false,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.white,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.gold,
        },
      }}
    >
      {isAuthenticated ? renderMainTabs() : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default RootNavigator;
