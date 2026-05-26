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
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Role = 'customer' | 'tailor_shop' | 'fabric_merchant';

const ROLES: { id: Role; label: string; icon: string }[] = [
  { id: 'customer', label: 'عميل', icon: '👤' },
  { id: 'tailor_shop', label: 'محل خياطة', icon: '✂️' },
  { id: 'fabric_merchant', label: 'تاجر أقمشة', icon: '🧵' },
];

const RegisterScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 1 && !role) {
      setError('يرجى اختيار نوع الحساب');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleRegister = async () => {
    if (!fullName || !phone || !password) {
      setError('يرجى ملء جميع الحقول');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون ٦ أحرف على الأقل');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullPhone = `+966${phone}`;
      await register({
        fullName,
        phone: fullPhone,
        password,
        role: role || 'customer',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.steps}>
      <View style={[styles.stepDot, step >= 1 && styles.stepActive]} />
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, step >= 2 && styles.stepActive]} />
    </View>
  );

  const renderRoleSelection = () => (
    <>
      <Text style={styles.stepTitle}>{t('auth.selectRole')}</Text>
      <View style={styles.rolesContainer}>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.roleCard, role === r.id && styles.roleSelected]}
            onPress={() => { setRole(r.id); setError(''); }}
          >
            <Text style={styles.roleIcon}>{r.icon}</Text>
            <Text style={[styles.roleLabel, role === r.id && styles.roleLabelSelected]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );

  const renderUserInfo = () => (
    <>
      <Text style={styles.stepTitle}>المعلومات الشخصية</Text>
      <Input
        label={t('auth.fullName')}
        placeholder="الاسم الكامل"
        value={fullName}
        onChangeText={setFullName}
      />
      <Input
        label={t('auth.phone')}
        placeholder="٥xxxxxxxx"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={9}
        isPhone
      />
      <Input
        label={t('auth.password')}
        placeholder="********"
        value={password}
        onChangeText={setPassword}
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
          <Text style={styles.headerTitle}>{t('auth.createAccount')}</Text>
          <View style={styles.backIcon} />
        </View>

        {renderStepIndicator()}

        <View style={styles.formSection}>
          {step === 1 && renderRoleSelection()}
          {step === 2 && renderUserInfo()}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {step === 1 && (
            <Button
              title={t('common.next')}
              onPress={handleNext}
              variant="primary"
              size="lg"
              fullWidth
            />
          )}
          {step === 2 && (
            <Button
              title={t('auth.createAccount')}
              onPress={handleRegister}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            />
          )}

          <View style={styles.loginRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>{t('auth.loginNow')}</Text>
            </TouchableOpacity>
            <Text style={styles.loginText}>{t('auth.hasAccount')}</Text>
          </View>
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
    paddingBottom: spacing.lg,
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
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: 60,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
  },
  stepActive: {
    backgroundColor: colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    ...fonts.bold,
  },
  rolesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  roleCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  roleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
  },
  roleIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  roleLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    ...fonts.medium,
  },
  roleLabelSelected: {
    color: colors.primary,
    ...fonts.bold,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 12,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  loginText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    ...fonts.bold,
  },
});

export default RegisterScreen;
