import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { calculateDistance, formatDistance } from '../utils/helpers';

interface LocationState {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
}

interface LocationError {
  message: string;
  code?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);
      if (!granted) {
        setError({
          message: 'Location permission denied',
          code: 'PERMISSION_DENIED',
        });
      }
      return granted;
    } catch {
      setError({ message: 'Failed to request location permission' });
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: address
          ? `${address.street || ''}, ${address.district || ''}, ${address.city || ''}`
          : undefined,
        city: address?.city || undefined,
      });
    } catch (err: unknown) {
      setError({
        message: err instanceof Error ? err.message : 'Failed to get location',
      });
    } finally {
      setLoading(false);
    }
  }, [requestPermission]);

  const getDistanceFrom = useCallback(
    (lat: number, lng: number): number | null => {
      if (!location) return null;
      return calculateDistance(location.latitude, location.longitude, lat, lng);
    },
    [location],
  );

  const getFormattedDistance = useCallback(
    (lat: number, lng: number): string | null => {
      const distance = getDistanceFrom(lat, lng);
      if (distance === null) return null;
      return formatDistance(distance);
    },
    [getDistanceFrom],
  );

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    loading,
    error,
    permissionGranted,
    getCurrentLocation,
    getDistanceFrom,
    getFormattedDistance,
    requestPermission,
  };
};

export default useLocation;
