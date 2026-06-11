import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { addressesApi, UserAddress } from '../../services/api/addresses';

interface Address {
  id: string;
  label: string;
  type: string;
  details: string;
  buildingNo: string;
  street: string;
  district: string;
  city: string;
  isDefault: boolean;
}

const AddressesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', type: 'home', buildingNo: '', street: '', district: '', city: '',
  });

  const loadAddresses = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await addressesApi.list(user.id);
      const mapped = data.map((apiAddr) => {
        const details = [
          apiAddr.buildingNumber ? `مبنى ${apiAddr.buildingNumber}` : '',
          apiAddr.street,
          apiAddr.district,
          apiAddr.city,
        ].filter(Boolean).join('، ');

        return {
          id: apiAddr.id,
          label: apiAddr.label || 'عنوان',
          type: 'home',
          details: details || `${apiAddr.city}, ${apiAddr.street}`,
          buildingNo: apiAddr.buildingNumber || '',
          street: apiAddr.street,
          district: apiAddr.district || '',
          city: apiAddr.city,
          isDefault: apiAddr.isDefault,
        };
      });
      setAddresses(mapped);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر تحميل العناوين.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = () => {
    setShowAddForm(true);
  };

  const handleSaveAddress = async () => {
    if (!newAddress.street.trim() || !newAddress.city.trim()) {
      Alert.alert(t('common.validationError') || 'تنبيه', 'يرجى إدخال الشارع والمدينة.');
      return;
    }

    if (!user?.id) return;

    try {
      setSaving(true);
      await addressesApi.create(user.id, {
        label: newAddress.label || undefined,
        buildingNumber: newAddress.buildingNo || undefined,
        street: newAddress.street,
        district: newAddress.district || undefined,
        city: newAddress.city,
        country: 'السعودية',
        isDefault: addresses.length === 0,
      });

      setNewAddress({
        label: '', type: 'home', buildingNo: '', street: '', district: '', city: '',
      });
      setShowAddForm(false);
      await loadAddresses();
    } catch (error) {
      console.error('Error creating address:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر حفظ العنوان الجديد.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user?.id) return;
    try {
      setSaving(true);
      await addressesApi.update(user.id, id, { isDefault: true });
      await loadAddresses();
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert(t('common.error') || 'خطأ', 'تعذر تعيين العنوان كافتراضي.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      t('profile.deleteAddress') || 'حذف العنوان',
      'هل أنت متأكد من رغبتك في حذف هذا العنوان؟',
      [
        { text: t('common.cancel') || 'إلغاء', style: 'cancel' },
        {
          text: t('common.delete') || 'حذف',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              setSaving(true);
              await addressesApi.delete(user.id, id);
              await loadAddresses();
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert(t('common.error') || 'خطأ', 'تعذر حذف العنوان.');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.myAddresses') || 'عناويني'}</Text>
        <TouchableOpacity onPress={handleAddAddress} disabled={saving}>
          <Text style={styles.headerAdd}>+</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {addresses.length === 0 && !showAddForm ? (
            <EmptyState
              icon="📍"
              title={t('profile.noAddresses') || 'لا توجد عناوين مسجلة'}
              actionLabel={t('profile.addAddress') || 'إضافة عنوان جديد'}
              onAction={handleAddAddress}
            />
          ) : (
            addresses.map((addr) => (
              <Card key={addr.id} style={styles.addressCard}>
                <View style={styles.addressHeader}>
                  <View style={styles.addressLabelRow}>
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>{t('profile.defaultAddress') || 'الافتراضي'}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.addressActions}>
                    {!addr.isDefault && (
                      <TouchableOpacity onPress={() => handleSetDefault(addr.id)} disabled={saving}>
                        <Text style={styles.actionText}>{t('profile.setDefault') || 'تعيين كافتراضي'}</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleDelete(addr.id)} disabled={saving}>
                      <Text style={[styles.actionText, styles.deleteText]}>{t('common.delete') || 'حذف'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addressDetails}>{addr.details}</Text>
              </Card>
            ))
          )}

          {showAddForm && (
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>{t('profile.addAddress') || 'إضافة عنوان جديد'}</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.addressLabel') || 'اسم العنوان'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: المنزل، العمل"
                  placeholderTextColor={colors.textLight}
                  value={newAddress.label}
                  onChangeText={(v) => setNewAddress((p) => ({ ...p, label: v }))}
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.buildingNo') || 'رقم المبنى'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: ١٢٣٤"
                  value={newAddress.buildingNo}
                  onChangeText={(v) => setNewAddress((p) => ({ ...p, buildingNo: v }))}
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.street') || 'اسم الشارع'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: طريق الملك فهد"
                  value={newAddress.street}
                  onChangeText={(v) => setNewAddress((p) => ({ ...p, street: v }))}
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.district') || 'اسم الحي'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: حي العليا"
                  value={newAddress.district}
                  onChangeText={(v) => setNewAddress((p) => ({ ...p, district: v }))}
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('profile.cityAddress') || 'المدينة'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="مثال: الرياض"
                  value={newAddress.city}
                  onChangeText={(v) => setNewAddress((p) => ({ ...p, city: v }))}
                  textAlign="right"
                  editable={!saving}
                />
              </View>

              <Button
                title={saving ? (t('common.saving') || 'جاري الحفظ...') : (t('profile.saveAddress') || 'حفظ العنوان')}
                onPress={handleSaveAddress}
                variant="primary"
                size="md"
                disabled={saving}
                fullWidth
              />
            </Card>
          )}

          {!showAddForm && addresses.length > 0 && (
            <Button
              title={t('profile.addAddress') || 'إضافة عنوان جديد'}
              onPress={handleAddAddress}
              variant="outline"
              size="lg"
              fullWidth
              style={styles.addButton}
              disabled={saving}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  headerBack: { fontSize: 24, color: colors.textPrimary, width: 40 },
  headerTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold },
  headerAdd: { fontSize: 28, color: colors.primary, ...fonts.bold },
  scrollContent: { padding: spacing.lg, paddingBottom: 40 },
  addressCard: { padding: spacing.lg, marginBottom: spacing.md },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  addressLabel: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold },
  defaultBadge: { backgroundColor: colors.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  defaultText: { fontSize: 10, color: colors.primary, ...fonts.bold },
  addressActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  actionText: { fontSize: fonts.sizes.sm, color: colors.primary, ...fonts.medium },
  deleteText: { color: colors.error },
  addressDetails: { fontSize: fonts.sizes.md, color: colors.textSecondary, textAlign: 'right', lineHeight: 22 },
  formCard: { padding: spacing.lg, marginBottom: spacing.md },
  formTitle: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold, textAlign: 'center', marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium, marginBottom: spacing.sm, textAlign: 'right' },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 15, color: colors.textPrimary, textAlign: 'right',
  },
  addButton: { marginTop: spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AddressesScreen;
