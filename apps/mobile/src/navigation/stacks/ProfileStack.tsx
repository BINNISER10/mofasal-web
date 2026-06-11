import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../screens/customer/ProfileScreen';
import MeasurementsScreen from '../../screens/customer/MeasurementsScreen';
import AddMeasurementScreen from '../../screens/customer/AddMeasurementScreen';
import MeasurementWizardScreen from '../../screens/customer/MeasurementWizardScreen';
import AddressesScreen from '../../screens/customer/AddressesScreen';
import NotificationsScreen from '../../screens/customer/NotificationsScreen';
import TailorOrderDetailScreen from '../../screens/tailor/TailorOrderDetailScreen';
import MerchantProductFormScreen from '../../screens/merchant/MerchantProductFormScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  Measurements: undefined;
  AddMeasurement: { measurementId?: string };
  MeasurementWizard: { measurementId?: string; customerId?: string; serviceRequestId?: string };
  Addresses: undefined;
  ProfileNotifications: undefined;
  TailorOrderDetail: { orderId: string };
  MerchantProductForm: { product?: any };
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Measurements" component={MeasurementsScreen} />
      <Stack.Screen name="AddMeasurement" component={AddMeasurementScreen} />
      <Stack.Screen name="MeasurementWizard" component={MeasurementWizardScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="ProfileNotifications" component={NotificationsScreen} />
      <Stack.Screen name="TailorOrderDetail" component={TailorOrderDetailScreen} />
      <Stack.Screen name="MerchantProductForm" component={MerchantProductFormScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
