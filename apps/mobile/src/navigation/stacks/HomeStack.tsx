import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/customer/HomeScreen';
import ShopDetailScreen from '../../screens/customer/ShopDetailScreen';
import ServiceRequestScreen from '../../screens/customer/ServiceRequestScreen';
import ConfirmationScreen from '../../screens/customer/ConfirmationScreen';
import TrackingScreen from '../../screens/customer/TrackingScreen';

export type HomeStackParamList = {
  Home: undefined;
  ShopDetail: { shopId: string };
  OrderNow: { shopId: string };
  ServiceRequest: { shopId: string; serviceType?: string };
  Confirmation: { orderId: string };
  Tracking: { orderId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
      <Stack.Screen name="ServiceRequest" component={ServiceRequestScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;
