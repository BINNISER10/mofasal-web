import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../../screens/customer/ProfileScreen';
import MeasurementsScreen from '../../screens/customer/MeasurementsScreen';
import AddMeasurementScreen from '../../screens/customer/AddMeasurementScreen';
import AddressesScreen from '../../screens/customer/AddressesScreen';
import NotificationsScreen from '../../screens/customer/NotificationsScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  Measurements: undefined;
  AddMeasurement: { measurementId?: string };
  Addresses: undefined;
  ProfileNotifications: undefined;
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
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="ProfileNotifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

export default ProfileStack;
