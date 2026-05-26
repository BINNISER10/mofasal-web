import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  onVoiceSearch?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'ابحث...',
  value,
  onChangeText,
  onSubmit,
  onClear,
  onVoiceSearch,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchIcon}>
        <Text style={styles.icon}>🔍</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textLight}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        textAlign="right"
      />
      {value.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
      {onVoiceSearch && (
        <TouchableOpacity style={styles.voiceButton} onPress={onVoiceSearch}>
          <Text style={styles.voiceIcon}>🎤</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    ...shadows.sm,
  },
  searchIcon: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
    paddingVertical: 8,
    textAlign: 'right',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textLight,
  },
  voiceButton: {
    padding: 4,
    marginLeft: 4,
  },
  voiceIcon: {
    fontSize: 16,
  },
});

export default SearchBar;
