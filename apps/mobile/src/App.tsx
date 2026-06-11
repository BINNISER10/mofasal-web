import React, { useEffect } from 'react';
import { StatusBar, I18nManager, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nextProvider } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import i18n from './i18n';
import { AuthProvider } from './services/auth/AuthContext';
import RootNavigator from './navigation/RootNavigator';
import { colors } from './utils/theme';

LogBox.ignoreLogs(['Reanimated', 'ViewPropTypes']);

const App: React.FC = () => {
  useEffect(() => {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }, []);

  const toastConfig = {
    success: {
      style: {
        backgroundColor: colors.primary,
        borderLeftColor: colors.gold,
        borderLeftWidth: 4,
      },
    },
    error: {
      style: {
        backgroundColor: colors.error,
        borderLeftColor: colors.white,
        borderLeftWidth: 4,
      },
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <StatusBar
              barStyle="light-content"
              backgroundColor={colors.primary}
              translucent={false}
            />
            <RootNavigator />
            <Toast config={toastConfig} />
          </AuthProvider>
        </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
