import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MarketplaceScreen from '../../screens/customer/MarketplaceScreen';
import ProductDetailScreen from '../../screens/customer/ProductDetailScreen';
import CartScreen from '../../screens/customer/CartScreen';
import CheckoutScreen from '../../screens/customer/CheckoutScreen';
import PaymentScreen from '../../screens/customer/PaymentScreen';

export type MarketplaceStackParamList = {
  Marketplace: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  Payment: { orderId: string; amount: number; method: string };
};

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

const MarketplaceStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

export default MarketplaceStack;
