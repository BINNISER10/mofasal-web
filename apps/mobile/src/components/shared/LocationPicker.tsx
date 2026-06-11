import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../ui/Card';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  onLocationSelected: (location: Location) => void;
  initialLocation?: Location;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelected,
  initialLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null,
  );

  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 24.7136,
    longitude: initialLocation?.longitude || 46.6753,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const isWeb = Platform.OS === 'web';

  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'MofasalApp/1.0',
            'Accept-Language': 'ar,en',
          },
        }
      );
      const data = await response.json();
      return data.display_name || `موقع محدد (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    } catch {
      return `موقع محدد (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'MofasalApp/1.0',
            'Accept-Language': 'ar,en',
          },
        }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        const address = data[0].display_name || searchQuery;
        const newLoc = { latitude: lat, longitude: lon, address };
        setSelectedLocation(newLoc);
        onLocationSelected(newLoc);
        setRegion({
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      }
    } catch (err) {
      // Fallback
      const mockLocation = {
        latitude: region.latitude,
        longitude: region.longitude,
        address: searchQuery,
      };
      setSelectedLocation(mockLocation);
      onLocationSelected(mockLocation);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = async (e: any) => {
    if (isWeb) return;
    const { coordinate } = e.nativeEvent;
    const lat = coordinate.latitude;
    const lon = coordinate.longitude;

    const tempLoc = {
      latitude: lat,
      longitude: lon,
      address: 'جاري تحديد العنوان...',
    };
    setSelectedLocation(tempLoc);

    const address = await reverseGeocode(lat, lon);
    const newLoc = { latitude: lat, longitude: lon, address };
    setSelectedLocation(newLoc);
    onLocationSelected(newLoc);
    
    setRegion(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
    }));
  };

  const handleWebMapPress = () => {
    const lat = 24.7136 + (Math.random() - 0.5) * 0.05;
    const lon = 46.6753 + (Math.random() - 0.5) * 0.05;
    const newLoc = {
      latitude: lat,
      longitude: lon,
      address: 'الرياض، المملكة العربية السعودية (موقع محاكي)',
    };
    setSelectedLocation(newLoc);
    onLocationSelected(newLoc);
    setRegion(prev => ({
      ...prev,
      latitude: lat,
      longitude: lon,
    }));
  };

  return (
    <Card style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن عنوان..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          textAlign="right"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.searchIcon}>🔍</Text>
          )}
        </TouchableOpacity>
      </View>

      {!isWeb ? (
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={(r) => setRegion(r)}
            onPress={handleMapPress}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="موقع التوصيل"
                description={selectedLocation.address}
              />
            )}
          </MapView>
        </View>
      ) : (
        <TouchableOpacity style={styles.mapPlaceholder} onPress={handleWebMapPress}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>
            {selectedLocation
              ? 'اضغط لتغيير الموقع (محاكاة خريطة الويب)'
              : 'اختر الموقع على الخريطة (محاكاة خريطة الويب)'}
          </Text>
        </TouchableOpacity>
      )}

      {selectedLocation && (
        <View style={styles.selectedInfo}>
          <Text style={styles.coordinates}>
            {selectedLocation.latitude.toFixed(4)},{' '}
            {selectedLocation.longitude.toFixed(4)}
          </Text>
          {selectedLocation.address && (
            <Text style={styles.address} numberOfLines={2}>
              {selectedLocation.address}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    paddingRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  searchButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  mapContainer: {
    height: 200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
  },
  mapIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  mapText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  selectedInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
  },
  coordinates: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  address: {
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'right',
    marginTop: 4,
    ...fonts.medium,
  },
});

export default LocationPicker;
