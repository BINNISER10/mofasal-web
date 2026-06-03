import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, shadows, spacing } from '../../utils/theme';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { serviceRequestsApi, ServiceRequest } from '../../services/api/serviceRequests';
import { useAuthContext } from '../../services/auth/AuthContext';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'بانتظار التعيين',
  ASSIGNED: 'تم التعيين (لم تبدأ)',
  EN_ROUTE: 'في الطريق',
  ARRIVED: 'وصلت للموقع',
  COMPLETED: 'اكتملت الخدمة',
};

const RepresentativeHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthContext();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // الرياض كموقع افتراضي
  const [simLat, setSimLat] = useState(24.7136);
  const [simLng, setSimLng] = useState(46.6753);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const list = await serviceRequestsApi.list();
      // عرض الطلبات المنسوبة لهذا المندوب فقط، أو الطلبات المعلقة التي تتبع لمتجره
      const filtered = list.filter(
        (r) => r.representativeId === user?.id || (r.status === 'PENDING' && r.shopId === user?.shopId)
      );
      setRequests(filtered);
    } catch (e) {
      console.error('Failed to fetch representative tasks', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // محاكاة تحرك المندوب لتحديث الموقع كل 5 ثوانٍ عند وجود طلب في الطريق
  useEffect(() => {
    const hasEnRoute = requests.some((r) => r.status === 'EN_ROUTE');
    if (!hasEnRoute) return;

    const interval = setInterval(async () => {
      // إحداث تغييرات طفيفة بالاحداثيات لمحاكاة الحركة
      const newLat = simLat + (Math.random() - 0.5) * 0.002;
      const newLng = simLng + (Math.random() - 0.5) * 0.002;
      setSimLat(newLat);
      setSimLng(newLng);

      const activeReq = requests.find((r) => r.status === 'EN_ROUTE');
      if (activeReq) {
        try {
          await serviceRequestsApi.updateLocation(activeReq.id, newLat, newLng);
        } catch (e) {
          // ignore background update fails
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [requests, simLat, simLng]);

  const handleStartRoute = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await serviceRequestsApi.updateLocation(requestId, simLat, simLng);
      Alert.alert('تم البدء', 'أنت الآن في الطريق إلى موقع العميل. يتم تحديث موقعك تلقائياً.');
      fetchRequests();
    } catch (e) {
      Alert.alert('خطأ', 'فشل تغيير حالة الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArrive = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await serviceRequestsApi.markArrived(requestId);
      Alert.alert('تم الوصول', 'تم تسجيل وصولك لموقع العميل بنجاح. يمكنك الآن أخذ قياساته.');
      fetchRequests();
    } catch (e) {
      Alert.alert('خطأ', 'فشل تسجيل الوصول');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTakeMeasurement = (req: ServiceRequest) => {
    // الانتقال لمعالج القياس وتمرير المعرفات
    navigation.navigate('RepProfileTab', {
      screen: 'MeasurementWizard',
      params: {
        customerId: req.customerId,
        serviceRequestId: req.id,
      },
    });
  };

  const handleSelfAssign = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await serviceRequestsApi.dispatch(requestId);
      Alert.alert('نجاح', 'تم إسناد الطلب إليك بنجاح.');
      fetchRequests();
    } catch (e) {
      Alert.alert('خطأ', 'تعذر إسناد الطلب');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مهام القياس المنزلي</Text>
      </View>

      {loading && requests.length === 0 ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} colors={[colors.primary]} />
          }
        >
          <Text style={styles.sectionTitle}>المهام الحالية ({requests.filter(r => r.status !== 'COMPLETED').length})</Text>

          {requests.filter(r => r.status !== 'COMPLETED').length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>لا توجد مهام نشطة حالياً. اسحب للأسفل للتحديث.</Text>
            </Card>
          ) : (
            requests.filter(r => r.status !== 'COMPLETED').map((req) => {
              const isEnRoute = req.status === 'EN_ROUTE';
              const isAssigned = req.status === 'ASSIGNED';
              const isArrived = req.status === 'ARRIVED';
              const isPending = req.status === 'PENDING';

              return (
                <Card key={req.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={[styles.statusBadge, isArrived && { backgroundColor: '#22C55E20' }]}>
                      <Text style={[styles.statusText, isArrived && { color: '#22C55E' }]}>
                        {STATUS_LABELS[req.status] || req.status}
                      </Text>
                    </View>
                    <Text style={styles.taskId}>طلب قياس #{req.id.substring(0, 8)}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.taskBody}>
                    <Text style={styles.infoLabel}>العنوان المطلوب:</Text>
                    <Text style={styles.infoValue}>{req.customAddress || 'لم يحدد'}</Text>

                    {req.notes ? (
                      <>
                        <Text style={styles.infoLabel}>ملاحظات العميل:</Text>
                        <Text style={styles.infoValue}>{req.notes}</Text>
                      </>
                    ) : null}
                  </View>

                  <View style={styles.taskActions}>
                    {isPending && (
                      <Button
                        title="إسناد المهمة لي 🙋‍♂️"
                        onPress={() => handleSelfAssign(req.id)}
                        variant="primary"
                        size="md"
                        fullWidth
                        loading={updatingId === req.id}
                        disabled={updatingId !== null}
                      />
                    )}
                    {isAssigned && (
                      <Button
                        title="بدء التحرك والمسار 🚗"
                        onPress={() => handleStartRoute(req.id)}
                        variant="primary"
                        size="md"
                        fullWidth
                        loading={updatingId === req.id}
                        disabled={updatingId !== null}
                      />
                    )}
                    {isEnRoute && (
                      <View style={{ width: '100%' }}>
                        <Text style={styles.simText}>
                          📍 محاكاة إرسال موقعك اللحظي: {simLat.toFixed(5)}, {simLng.toFixed(5)}
                        </Text>
                        <Button
                          title="تسجيل الوصول للموقع 📍"
                          onPress={() => handleArrive(req.id)}
                          variant="secondary"
                          size="md"
                          fullWidth
                          loading={updatingId === req.id}
                          disabled={updatingId !== null}
                        />
                      </View>
                    )}
                    {isArrived && (
                      <Button
                        title="بدء معالج أخذ القياسات 📏"
                        onPress={() => handleTakeMeasurement(req)}
                        variant="primary"
                        size="md"
                        fullWidth
                      />
                    )}
                  </View>
                </Card>
              );
            })
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>المهام المكتملة</Text>
          {requests.filter(r => r.status === 'COMPLETED').length === 0 ? (
            <Text style={styles.noHistory}>لا توجد مهام مكتملة مسبقاً.</Text>
          ) : (
            requests.filter(r => r.status === 'COMPLETED').map((req) => (
              <Card key={req.id} style={[styles.taskCard, { opacity: 0.7 }]}>
                <View style={styles.taskHeader}>
                  <View style={[styles.statusBadge, { backgroundColor: '#2E7D3220' }]}>
                    <Text style={[styles.statusText, { color: '#2E7D32' }]}>مكتمل</Text>
                  </View>
                  <Text style={styles.taskId}>طلب قياس #{req.id.substring(0, 8)}</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.infoValue}>{req.customAddress || 'لا يوجد عنوان'}</Text>
              </Card>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    color: colors.primary,
    ...fonts.bold,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
    ...fonts.bold,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
  taskCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: colors.gold + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fonts.sizes.sm,
    color: colors.gold,
    ...fonts.bold,
  },
  taskId: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    ...fonts.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.md,
  },
  taskBody: {
    marginBottom: spacing.lg,
  },
  infoLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 6,
  },
  infoValue: {
    fontSize: fonts.sizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
    ...fonts.medium,
  },
  taskActions: {
    marginTop: spacing.sm,
  },
  simText: {
    fontSize: fonts.sizes.xs,
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: spacing.md,
    ...fonts.medium,
  },
  noHistory: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textAlign: 'right',
    paddingRight: spacing.sm,
  },
});

export default RepresentativeHomeScreen;
