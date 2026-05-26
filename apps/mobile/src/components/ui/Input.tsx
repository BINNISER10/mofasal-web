import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { colors, fonts, borderRadius, spacing } from '../../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isPhone?: boolean;
  showPasswordToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  isPhone,
  showPasswordToggle,
  style,
  secureTextEntry,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {isPhone && <Text style={styles.prefix}>+966</Text>}
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            isPhone && styles.inputWithPrefix,
            icon && styles.inputWithIcon,
            props.multiline && styles.multiline,
            style,
          ]}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          textAlign="right"
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'right',
    ...fonts.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  prefix: {
    fontSize: 15,
    color: colors.textPrimary,
    ...fonts.medium,
    marginRight: 4,
  },
  iconContainer: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 12,
    textAlign: 'right',
    ...fonts.regular,
  },
  inputWithPrefix: {
    textAlign: 'left',
  },
  inputWithIcon: {
    textAlign: 'right',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  toggle: {
    padding: 4,
  },
  toggleText: {
    fontSize: 18,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default Input;
