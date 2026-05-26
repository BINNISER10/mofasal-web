import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import RatingStars from '../../components/shared/RatingStars';
import { MarketplaceStackParamList } from '../../navigation/stacks/MarketplaceStack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ProductDetailRouteProp = RouteProp<MarketplaceStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = {
    id: '1',
    name: 'قماش صوف إيطالي فاخر',
    description: 'قماش صوف إيطالي عالي الجودة، مناسب للبدلات الرسمية والثياب الفاخرة. نسيج ناعم ومتين مع لمسة نهائية أنيقة.',
    images: [
      'https://via.placeholder.com/400x400/1B5E20/ffffff?text=قماش+صوف+1',
      'https://via.placeholder.com/400x400/2E7D32/ffffff?text=قماش+صوف+2',
    ],
    price: 180,
    unit: 'المتر',
    merchantName: 'متجر الأقمشة الفاخرة',
    rating: 4.7,
    ratingCount: 89,
    composition: 'صوف ١٠٠٪',
    weight: '٢٨٠ جم/م²',
    width: '١٥٠ سم',
    inStock: true,
    colors: ['كحلي', 'أسود', 'رمادي', 'بني'],
  };

  const handleAddToCart = () => {
    // Add to cart logic
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.images[selectedImage] }} style={styles.mainImage} />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Name & Price */}
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            <Text style={styles.unit}>/ {product.unit}</Text>
          </View>
          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating} />
            <Text style={styles.ratingText}>({product.ratingCount})</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>{t('marketplace.quantity')}</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('common.details')}</Text>
            <Text style={styles.description}>{product.description}</Text>
          </Card>

          {/* Details */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>المواصفات</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('fabrics.composition')}</Text>
              <Text style={styles.detailValue}>{product.composition}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('fabrics.weight')}</Text>
              <Text style={styles.detailValue}>{product.weight}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>{t('fabrics.width')}</Text>
              <Text style={styles.detailValue}>{product.width}</Text>
            </View>
          </Card>

          {/* Merchant Info */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('marketplace.merchant')}</Text>
            <Text style={styles.merchantName}>{product.merchantName}</Text>
          </Card>
        </View>
      </ScrollView>

      {/* Add to Cart Bar */}
      <View style={styles.cartBar}>
        <View style={styles.totalPrice}>
          <Text style={styles.totalLabel}>{t('cart.total')}</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(product.price * quantity)}
          </Text>
        </View>
        <Button
          title={t('marketplace.addToCart')}
          onPress={handleAddToCart}
          variant="primary"
          size="lg"
          style={styles.addButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  imageContainer: { position: 'relative' },
  mainImage: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.9, resizeMode: 'cover' },
  backButton: {
    position: 'absolute', top: 50, right: 16,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center',
    ...shadows.md,
  },
  backIcon: { fontSize: 20, color: colors.textPrimary },
  content: { padding: spacing.lg },
  productName: { fontSize: fonts.sizes.xxl, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: spacing.sm },
  price: { fontSize: fonts.sizes.xxxl, color: colors.primary, ...fonts.bold },
  unit: { fontSize: fonts.sizes.md, color: colors.textSecondary, marginRight: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: 8 },
  ratingText: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  quantitySection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  sectionLabel: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  qtyButtonText: { fontSize: 20, color: colors.textPrimary, ...fonts.bold },
  qtyValue: { fontSize: fonts.sizes.xl, color: colors.textPrimary, ...fonts.bold, minWidth: 30, textAlign: 'center' },
  sectionCard: { padding: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontSize: fonts.sizes.lg, color: colors.textPrimary, ...fonts.bold, textAlign: 'right', marginBottom: spacing.md },
  description: { fontSize: fonts.sizes.md, color: colors.textSecondary, lineHeight: 24, textAlign: 'right' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.divider },
  detailLabel: { fontSize: fonts.sizes.md, color: colors.textSecondary },
  detailValue: { fontSize: fonts.sizes.md, color: colors.textPrimary, ...fonts.medium },
  merchantName: { fontSize: fonts.sizes.lg, color: colors.textPrimary, textAlign: 'right', ...fonts.medium },
  cartBar: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    paddingBottom: 30, backgroundColor: colors.white, ...shadows.lg, gap: 12,
  },
  totalPrice: { flex: 1 },
  totalLabel: { fontSize: fonts.sizes.sm, color: colors.textSecondary },
  totalValue: { fontSize: fonts.sizes.xl, color: colors.primary, ...fonts.bold },
  addButton: { flex: 1 },
});

export default ProductDetailScreen;
