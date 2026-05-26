import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import { formatCurrency, formatDistance, getETA } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import RatingStars from '../../components/shared/RatingStars';
import { HomeStackParamList } from '../../navigation/stacks/HomeStack';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COVER_HEIGHT = 220;

type ShopDetailRouteProp = RouteProp<HomeStackParamList, 'ShopDetail'>;

const MOCK_SHOP = {
  id: '1',
  name: 'خياط الرجال',
  description: 'أفضل محل خياطة رجالية في الرياض، نقدم خدمات الخياطة والتفصيل بأعلى جودة وأفضل الأسعار. نوفر خدمة القياس المنزلي المجانية.',
  logo: 'https://via.placeholder.com/100x100/1B5E20/ffffff?text=خ',
  coverImage: 'https://via.placeholder.com/800x400/1B5E20/ffffff?text=خياط+الرجال',
  rating: 4.8,
  ratingCount: 124,
  distance: 1.2,
  estimatedArrival: 25,
  isOpen: true,
  phone: '+966501234567',
  address: 'الرياض، حي النخيل، شارع الأمير محمد بن سلمان',
  openHours: {
    sat: { open: '09:00', close: '22:00' },
    sun: { open: '09:00', close: '22:00' },
    mon: { open: '09:00', close: '22:00' },
    tue: { open: '09:00', close: '22:00' },
    wed: { open: '09:00', close: '22:00' },
    thu: { open: '09:00', close: '23:00' },
    fri: { open: '14:00', close: '22:00' },
  },
  services: [
    { id: '1', name: 'القياس المنزلي', description: 'نرسل مندوب لأخذ المقاسات في منزلك', price: 0, duration: '٣٠ دقيقة' },
    { id: '2', name: 'خياطة بدلة كاملة', description: 'بدلة رسمية كاملة مع القماش', price: 800, duration: '٤ أيام' },
    { id: '3', name: 'خياطة ثوب', description: 'ثوب رجالي حسب المقاس', price: 250, duration: 'يومان' },
    { id: '4', name: 'تعديل', description: 'تعديل الملابس الجاهزة', price: 50, duration: 'يوم واحد' },
  ],
  reviews: [
    { id: '1', userName: 'أحمد', rating: 5, comment: 'تعامل راقي وخياطة ممتازة، أنصح بالتعامل معهم', createdAt: '2024-01-15' },
    { id: '2', userName: 'خالد', rating: 4, comment: 'خدمة ممتازة والتوصيل في الوقت المحدد', createdAt: '2024-01-10' },
  ],
};

const ShopDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ShopDetailRouteProp>();

  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'about'>('services');

  const handleCall = () => {
    Linking.openURL(`tel:${MOCK_SHOP.phone}`);
  };

  const handleRequestService = () => {
    navigation.navigate('OrderWizard', { shopId: route.params.shopId });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: MOCK_SHOP.coverImage }} style={styles.cover} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.logoContainer}>
            <Image source={{ uri: MOCK_SHOP.logo }} style={styles.logo} />
          </View>
        </View>

        {/* Shop Info */}
        <View style={styles.infoSection}>
          <Text style={styles.shopName}>{MOCK_SHOP.name}</Text>
          <View style={styles.ratingRow}>
            <RatingStars rating={MOCK_SHOP.rating} />
            <Text style={styles.ratingText}>
              {MOCK_SHOP.rating} ({MOCK_SHOP.ratingCount} {t('shop.reviewsCount')})
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Badge label={MOCK_SHOP.isOpen ? 'مفتوح' : 'مغلق'}
              color={MOCK_SHOP.isOpen ? colors.success : colors.error} size="sm" />
            <Text style={styles.metaText}>
              {formatDistance(MOCK_SHOP.distance)} • {getETA(MOCK_SHOP.estimatedArrival)}
            </Text>
          </View>
          <Text style={styles.address}>{MOCK_SHOP.address}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['services', 'reviews', 'about'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'services' ? 'الخدمات' : tab === 'reviews' ? 'التقييمات' : 'حول المحل'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <View style={styles.section}>
            {MOCK_SHOP.services.map((service) => (
              <Card key={service.id} style={styles.serviceCard}>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.servicePrice}>
                    {service.price === 0 ? 'مجاني' : formatCurrency(service.price)}
                  </Text>
                </View>
                <Text style={styles.serviceDesc}>{service.description}</Text>
                <Text style={styles.serviceDuration}>{service.duration}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.section}>
            {MOCK_SHOP.reviews.map((review) => (
              <Card key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{review.userName}</Text>
                  <RatingStars rating={review.rating} size={14} />
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </Card>
            ))}
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.section}>
            <Card>
              <Text style={styles.aboutText}>{MOCK_SHOP.description}</Text>
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>{t('shop.location')}</Text>
                <Text style={styles.aboutValue}>{MOCK_SHOP.address}</Text>
              </View>
              <TouchableOpacity style={styles.callRow} onPress={handleCall}>
                <Text style={styles.callLabel}>{t('shop.call')}</Text>
                <Text style={styles.callValue}>{MOCK_SHOP.phone}</Text>
              </TouchableOpacity>
              <Text style={styles.hoursTitle}>{t('shop.openHours')}</Text>
              {Object.entries(MOCK_SHOP.openHours).map(([day, hours]) => (
                <View key={day} style={styles.hoursRow}>
                  <Text style={styles.hoursTime}>{hours.open} - {hours.close}</Text>
                  <Text style={styles.hoursDay}>{day}</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Button */}
      <View style={styles.floatingButton}>
        <Button
          title={t('shop.requestService')}
          onPress={handleRequestService}
          variant="primary"
          size="lg"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  coverContainer: {
    height: COVER_HEIGHT,
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -30,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.white,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.md,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: 40,
    paddingBottom: spacing.lg,
  },
  shopName: {
    fontSize: fonts.sizes.xxl,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  ratingText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  metaText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  address: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginTop: 1,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    ...fonts.medium,
  },
  tabTextActive: {
    color: colors.primary,
    ...fonts.bold,
  },
  section: {
    padding: spacing.lg,
  },
  serviceCard: {
    marginBottom: spacing.md,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  serviceName: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  servicePrice: {
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    ...fonts.bold,
  },
  serviceDesc: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: fonts.sizes.sm,
    color: colors.textLight,
    textAlign: 'right',
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewerName: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  reviewComment: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 22,
  },
  aboutText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    textAlign: 'right',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  aboutLabel: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  aboutValue: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.medium,
    textAlign: 'right',
    flex: 1,
    marginRight: 8,
  },
  callRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  callLabel: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    ...fonts.bold,
  },
  callValue: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    direction: 'ltr',
  },
  hoursTitle: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  hoursDay: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
  hoursTime: {
    fontSize: fonts.sizes.sm,
    color: colors.textPrimary,
    direction: 'ltr',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 30,
    backgroundColor: colors.white,
    ...shadows.lg,
  },
});

export default ShopDetailScreen;
