import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const OTP_LENGTH = 6;

const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendCode = async () => {
    if (!phone) {
      setError('يرجى إدخال رقم الجوال');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // API call would go here
      await new Promise((r) => setTimeout(r, 1000));
      setStep(2);
      setTimer(60);
    } catch {
      setError('فشل إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }
    setStep(3);
    setError('');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await new Promise((r) => setTimeout(r, 1000));
      navigation.goBack();
    } catch {
      setError('فشل إعادة تعيين كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const renderSendCode = () => (
    <>
      <Text style={styles.stepTitle}>{t('auth.forgotPasswordTitle')}</Text>
      <Text style={styles.description}>{t('auth.forgotPasswordDesc')}</Text>
      <Input
        label={t('auth.phone')}
        placeholder="٥xxxxxxxx"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={9}
        isPhone
      />
      <Button
        title={t('auth.verifyCode')}
        onPress={handleSendCode}
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      />
    </>
  );

  const renderVerifyCode = () => (
    <>
      <Text style={styles.stepTitle}>{t('auth.verifyPhone')}</Text>
      <Text style={styles.description}>
        {t('auth.codeSent')} +966{phone}
      </Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { otpRefs.current[index] = ref; }}
            style={styles.otpInput}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
          />
        ))}
      </View>
      <Button
        title={t('common.confirm')}
        onPress={handleVerifyCode}
        variant="primary"
        size="lg"
        fullWidth
      />
      <TouchableOpacity
        style={styles.resendContainer}
        onPress={handleSendCode}
        disabled={timer > 0}
      >
        <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
          {timer > 0 ? `إعادة الإرسال بعد ${timer} ثانية` : t('auth.resendCode')}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderNewPassword = () => (
    <>
      <Text style={styles.stepTitle}>{t('auth.resetPassword')}</Text>
      <Input
        label={t('auth.newPassword')}
        placeholder="********"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        showPasswordToggle
      />
      <Input
        label={t('auth.confirmPassword')}
        placeholder="********"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        showPasswordToggle
      />
      <Button
        title={t('auth.resetPassword')}
        onPress={handleResetPassword}
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('auth.forgotPasswordTitle')}
          </Text>
          <View style={styles.backIcon} />
        </View>

        <View style={styles.formSection}>
          {step === 1 && renderSendCode()}
          {step === 2 && renderVerifyCode()}
          {step === 3 && renderNewPassword()}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    width: 40,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
    ...fonts.bold,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  otpInput: {
    width: 48,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    fontSize: 20,
    ...fonts.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: colors.primary,
    ...fonts.medium,
  },
  resendDisabled: {
    color: colors.textLight,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 12,
  },
});

export default ForgotPasswordScreen;
