import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, spacing } from '../../utils/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { productsApi, Product } from '../../services/api/products';
import { useAuthContext } from '../../services/auth/AuthContext';

type RouteParams = RouteProp<{ Params: { product?: Product } }, 'Params'>;

const MerchantProductFormScreen: React.FC = () => {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const productToEdit = route.params?.product;

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setNameAr(productToEdit.nameAr || '');
      setPrice(productToEdit.price ? String(productToEdit.price) : '');
      setStockQuantity(productToEdit.stockQuantity ? String(productToEdit.stockQuantity) : '0');
      setDescription(productToEdit.description || '');
      setDescriptionAr(productToEdit.descriptionAr || '');
    }
  }, [productToEdit]);

  const handleSave = async () => {
    if (!name || !nameAr || !price) {
      Alert.alert('تنبيه', 'يرجى ملء الاسم والسعر');
      return;
    }

    const priceNum = Number(price);
    const stockNum = Number(stockQuantity || '0');

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('تنبيه', 'يرجى إدخال سعر صحيح');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Product> = {
        name,
        nameAr,
        price: priceNum,
        stockQuantity: stockNum,
        description,
        descriptionAr,
        category: 'fabrics', // افتراضي للمخزن
        unit: 'meter', // افتراضي لوحدة البيع
        merchantId: user?.id,
        merchantName: user?.name_ar || 'تاجر مفصل',
        inStock: stockNum > 0,
      };

      if (productToEdit) {
        await productsApi.update(productToEdit.id, payload);
        Alert.alert('نجاح', 'تم تحديث منتج القماش بنجاح');
      } else {
        await productsApi.create(payload);
        Alert.alert('نجاح', 'تم إضافة منتج القماش الجديد بنجاح');
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('خطأ', e?.response?.data?.error?.message || 'فشل حفظ بيانات المنتج');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {productToEdit ? 'تعديل منتج القماش' : 'إضافة قماش جديد'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input
          label="الاسم (إنجليزي)*"
          placeholder="Egyptian Cotton"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="الاسم (عربي)*"
          placeholder="قطن مصري فاخر"
          value={nameAr}
          onChangeText={setNameAr}
        />
        <Input
          label="السعر للمتر الواحد (ر.س)*"
          placeholder="95"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
        <Input
          label="المخزون المتوفر (أمتار)"
          placeholder="50"
          value={stockQuantity}
          onChangeText={setStockQuantity}
          keyboardType="number-pad"
        />
        <Input
          label="الوصف (عربي)"
          placeholder="قماش قطني ناعم ومناسب للصيف..."
          value={descriptionAr}
          onChangeText={setDescriptionAr}
          multiline
        />
        <Input
          label="الوصف (إنجليزي)"
          placeholder="Egyptian cotton fabric, soft and breathable..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.footer}>
          <Button
            title="حفظ ومزامنة المعروض ✓"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backBtn: {
    fontSize: 24,
    color: colors.textPrimary,
    width: 40,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  footer: {
    marginTop: spacing.xl,
  },
});

export default MerchantProductFormScreen;
