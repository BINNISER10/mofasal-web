import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LocationPicker from '../../components/shared/LocationPicker';

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

const MOCK_ADDRESSES: Address[] = [
  { id: '1', label: 'المنزل', type: 'home', details: 'الرياض، حي النخيل، شارع الأمير محمد بن سلمان، مبنى ٢٣', buildingNo: '٢٣', street: 'شارع الأمير محمد بن سلمان', district: 'حي النخيل', city: 'الرياض', isDefault: true },
  { id: '2', label: 'العمل', type: 'work', details: 'الرياض، حي العليا، طريق الملك فهد، برج المملكة', buildingNo: '١٢٣٤', street: 'طريق الملك فهد', district: 'حي العليا', city: 'الرياض', isDefault: false },
];

const AddressesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', type: 'home', buildingNo: '', street: '', district: '', city: '',
  });

  const handleAddAddress = () => {
    setShowAddForm(true);
  };

  const handleSaveAddress = () => {
    setShowAddForm(false);
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id })),
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('profile.deleteAddress'), 'هل أنت متأكد؟', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)) },
    ]);
  };

  if (addresses.length === 0 && !showAddForm) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.myAddresses')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <EmptyState
          icon="📍"
          title={t('profile.noAddresses')}
          actionLabel={t('profile.addAddress')}
          onAction={handleAddAddress}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.myAddresses')}</Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <Text style={styles.headerAdd}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {addresses.map((addr) => (
          <Card key={addr.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <View style={styles.addressLabelRow}>
                <Text style={styles.addressLabel}>{addr.label}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>{t('profile.defaultAddress')}</Text>
                  </View>
                )}
              </View>
              <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)}>
                  <Text style={styles.actionText}>{t('profile.setDefault')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(addr.id)}>
                  <Text style={[styles.actionText, styles.deleteText]}>{t('common.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.addressDetails}>{addr.details}</Text>
          </Card>
        ))}

        {showAddForm && (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{t('profile.addAddress')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.addressLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder="مثال: المنزل"
                placeholderTextColor={colors.textLight}
                value={newAddress.label}
                onChangeText={(v) => setNewAddress((p) => ({ ...p, label: v }))}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.buildingNo')}</Text>
              <TextInput
                style={styles.input}
                value={newAddress.buildingNo}
                onChangeText={(v) => setNewAddress((p) => ({ ...p, buildingNo: v }))}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.street')}</Text>
              <TextInput
                style={styles.input}
                value={newAddress.street}
                onChangeText={(v) => setNewAddress((p) => ({ ...p, street: v }))}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.district')}</Text>
              <TextInput
                style={styles.input}
                value={newAddress.district}
                onChangeText={(v) => setNewAddress((p) => ({ ...p, district: v }))}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('profile.cityAddress')}</Text>
              <TextInput
                style={styles.input}
                value={newAddress.city}
                onChangeText={(v) => setNewAddress((p) => ({ ...p, city: v }))}
                textAlign="right"
              />
            </View>

            <Button
              title={t('profile.saveAddress')}
              onPress={handleSaveAddress}
              variant="primary"
              size="md"
              fullWidth
            />
          </Card>
        )}

        <Button
          title={t('profile.addAddress')}
          onPress={handleAddAddress}
          variant="outline"
          size="lg"
          fullWidth
          style={styles.addButton}
        />
      </ScrollView>
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
  addressActions: { flexDirection: 'row', gap: 12 },
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
});

export default AddressesScreen;
