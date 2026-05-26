import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrdersListScreen from '../../screens/customer/OrdersListScreen';
import OrderDetailScreen from '../../screens/customer/OrderDetailScreen';
import TrackingScreen from '../../screens/customer/TrackingScreen';
import OrderWizardScreen from '../../screens/customer/OrderWizardScreen';

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  Tracking: { orderId: string };
  OrderWizard: { shopId: string };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

const OrdersStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OrdersList" component={OrdersListScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="OrderWizard" component={OrderWizardScreen} />
    </Stack.Navigator>
  );
};

export default OrdersStack;
