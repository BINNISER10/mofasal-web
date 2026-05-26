import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { AuthStackParamList } from '../../navigation/stacks/AuthStack';
import apiClient from '../../services/api/client';

type LoginNavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<LoginNavProp>();
  const { login } = useAuth();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 9) {
      setError('أدخل رقم جوال صحيح (9 أرقام)');
      return;
    }
    setLoading(true);
    setError('');
    const fullPhone = `+966${digits}`;
    try {
      await apiClient.post('/auth/otp/send', { phone: fullPhone });
      navigation.navigate('OTP', { phone: fullPhone });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'فشل إرسال الرمز، حاول مجدداً';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>مفصل</Text>
          </View>
          <Text style={styles.tagline}>خياطتك راقيه بتفاصيلها</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.title}>{t('auth.login')}</Text>

          <Input
            label="رقم الجوال"
            placeholder="5xxxxxxxx"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={9}
            isPhone
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            onPress={handleSendOTP}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          />

          <Text style={styles.otpNote}>
            سنرسل لك رمز تحقق مكوّن من 4 أرقام للتحقق من هويتك
          </Text>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orContinueWith')}</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>🍎</Text>
              <Text style={styles.socialText}>{t('auth.signInWithApple')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Text style={styles.socialIcon}>🔵</Text>
              <Text style={styles.socialText}>{t('auth.signInWithGoogle')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>{t('auth.registerNow')}</Text>
            </TouchableOpacity>
            <Text style={styles.registerText}>{t('auth.noAccount')}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logoSection: {
    backgroundColor: colors.primary,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  logoText: {
    fontSize: 28,
    color: colors.primary,
    ...fonts.bold,
  },
  tagline: {
    fontSize: 14,
    color: colors.white,
    marginTop: 12,
    opacity: 0.9,
  },
  formSection: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 28,
    ...fonts.bold,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 12,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    ...fonts.medium,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: colors.textLight,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialText: {
    fontSize: 13,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: colors.primary,
    ...fonts.bold,
  },
  otpNote: {
    fontSize: 13,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
});

export default LoginScreen;
