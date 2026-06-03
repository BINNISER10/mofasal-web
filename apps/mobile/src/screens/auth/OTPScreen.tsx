import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import { AuthStackParamList } from '../../navigation/stacks/AuthStack';
import apiClient from '../../services/api/client';
import { setAuthToken, setRefreshToken } from '../../services/api/client';

type OTPNavProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;
type OTPRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

const OTP_LENGTH = 4;
const RESEND_SECONDS = 60;

const OTPScreen: React.FC = () => {
  const navigation = useNavigation<OTPNavProp>();
  const route = useRoute<OTPRouteProp>();
  const { phone } = route.params;
  const { login } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((d) => d !== '') && digit) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = async (code?: string) => {
    const otpCode = code || otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      setError('أدخل الرمز كاملاً');
      shake();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/auth/otp/verify', { phone, code: otpCode });
      const { access_token, refresh_token } = res.data;
      await setAuthToken(access_token);
      await setRefreshToken(refresh_token);
      await login(phone, 'otp_verified');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'رمز غير صحيح، حاول مرة أخرى';
      setError(msg);
      shake();
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setResendTimer(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    inputRefs.current[0]?.focus();
    try {
      await apiClient.post('/auth/otp/send', { phone });
    } catch {
      setError('فشل إعادة الإرسال');
    }
  };

  const maskedPhone = phone.replace(/(\+966)(\d{2})(\d+)(\d{2})/, '$1 $2*** $4');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Text style={styles.iconEmoji}>📱</Text>
        </View>

        <Text style={styles.title}>تحقق من رقمك</Text>
        <Text style={styles.subtitle}>
          أرسلنا رمز تحقق مكوّن من {OTP_LENGTH} أرقام إلى{'\n'}
          <Text style={styles.phoneText}>{maskedPhone}</Text>
        </Text>

        {/* OTP Inputs */}
        <Animated.View
          style={[
            styles.otpRow,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {Array(OTP_LENGTH).fill(0).map((_, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputRefs.current[i] = ref)}
              style={[
                styles.otpInput,
                otp[i] ? styles.otpInputFilled : {},
                error ? styles.otpInputError : {},
              ]}
              value={otp[i]}
              onChangeText={(text) => handleOtpChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={i === 0}
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyBtn, loading && styles.verifyBtnLoading]}
          onPress={() => handleVerify()}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyBtnText}>
            {loading ? 'جاري التحقق...' : 'تحقق والدخول'}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        <View style={styles.resendRow}>
          <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
            <Text style={[styles.resendLink, resendTimer > 0 && styles.resendLinkDisabled]}>
              إعادة الإرسال
            </Text>
          </TouchableOpacity>
          <Text style={styles.resendText}>لم تستلم الرمز؟ </Text>
        </View>
        {resendTimer > 0 && (
          <Text style={styles.timerText}>
            إعادة الإرسال بعد {resendTimer} ثانية
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 22,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    ...fonts.bold,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  phoneText: {
    color: colors.primary,
    ...fonts.bold,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  otpInput: {
    width: 64,
    height: 72,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    fontSize: 28,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    ...fonts.bold,
    ...shadows.sm,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  otpInputError: {
    borderColor: colors.error,
    backgroundColor: colors.error + '08',
  },
  errorText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  verifyBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginTop: 16,
    ...shadows.md,
  },
  verifyBtnLoading: {
    opacity: 0.7,
  },
  verifyBtnText: {
    fontSize: 17,
    color: colors.white,
    ...fonts.bold,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 4,
  },
  resendText: {
    fontSize: 14,
    color: colors.textLight,
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    ...fonts.bold,
  },
  resendLinkDisabled: {
    color: colors.textMuted,
  },
  timerText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  devHint: {
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warning + '15',
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  devHintText: {
    fontSize: 12,
    color: colors.warning,
    ...fonts.medium,
  },
});

export default OTPScreen;
