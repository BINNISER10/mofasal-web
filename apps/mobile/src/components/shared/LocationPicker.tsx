import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../ui/Card';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null,
  );

  const handleSearch = () => {
    // Mock geocoding - in real app, use Google Maps Geocoding API
    if (searchQuery.trim()) {
      const mockLocation: Location = {
        latitude: 24.7136,
        longitude: 46.6753,
        address: searchQuery,
      };
      setSelectedLocation(mockLocation);
      onLocationSelected(mockLocation);
    }
  };

  const handleMapPress = () => {
    // In real app, this would open interactive map
    const mockLocation: Location = {
      latitude: 24.7136 + (Math.random() - 0.5) * 0.1,
      longitude: 46.6753 + (Math.random() - 0.5) * 0.1,
      address: 'Riyadh, Saudi Arabia',
    };
    setSelectedLocation(mockLocation);
    onLocationSelected(mockLocation);
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
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.mapPlaceholder} onPress={handleMapPress}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>
          {selectedLocation
            ? 'اضغط لتغيير الموقع'
            : 'اختر الموقع على الخريطة'}
        </Text>
      </TouchableOpacity>

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
  },
  searchIcon: {
    fontSize: 18,
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
    fontFamily: 'monospace',
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
