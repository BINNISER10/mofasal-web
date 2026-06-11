'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { servicesApi, ServiceRequest } from '@/lib/api/services';
import { StatsCard } from '@/components/shared/StatsCard';
import toast from 'react-hot-toast';
import {
  MapPin, Clock, User, Phone, Navigation, CheckCircle2, Loader2,
  ArrowRight, AlertCircle, Car, Ruler, Calendar,
} from 'lucide-react';

const STATUS_LABELS: Record<string, { ar: string; color: 'info' | 'success' | 'gold' | 'danger' | 'primary' }> = {
  PENDING: { ar: 'قيد الانتظار', color: 'gold' },
  ASSIGNED: { ar: 'تم التعيين', color: 'primary' },
  EN_ROUTE: { ar: 'في الطريق', color: 'info' },
  ARRIVED: { ar: 'وصل', color: 'success' },
  COMPLETED: { ar: 'مكتمل', color: 'success' },
  CANCELLED: { ar: 'ملغي', color: 'danger' },
};

export default function RepDashboardPage() {
  const { isRTL } = useAppStore();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await servicesApi.list();
      const arr = Array.isArray(data) ? data : [];
      setRequests(arr.filter((r: ServiceRequest) =>
        r.representativeId === user?.id || r.status === 'PENDING'
      ));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); const t = setInterval(fetchRequests, 30000); return () => clearInterval(t); }, []);

  const handleUpdateLocation = async (reqId: string) => {
    if (!navigator.geolocation) {
      toast.error(isRTL ? 'GPS غير متاح' : 'GPS not available');
      return;
    }
    setUpdatingId(reqId);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await servicesApi.updateLocation(reqId, pos.coords.latitude, pos.coords.longitude);
          toast.success(isRTL ? 'تم تحديث الموقع' : 'Location updated');
          fetchRequests();
        } catch {
          toast.error(isRTL ? 'فشل تحديث الموقع' : 'Location update failed');
        } finally {
          setUpdatingId(null);
        }
      },
      () => {
        toast.error(isRTL ? 'تعذر الحصول على الموقع' : 'Cannot get location');
        setUpdatingId(null);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMarkArrived = async (reqId: string) => {
    setUpdatingId(reqId);
    try {
      await servicesApi.markArrived(reqId);
      toast.success(isRTL ? 'تم تسجيل الوصول' : 'Arrival recorded');
      fetchRequests();
    } catch {
      toast.error(isRTL ? 'فشل تسجيل الوصول' : 'Failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const activeJobs = requests.filter(r => ['ASSIGNED', 'EN_ROUTE'].includes(r.status));
  const pendingJobs = requests.filter(r => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">
            {isRTL ? 'لوحة المندوب' : 'Rep Dashboard'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {isRTL ? `مرحباً ${user?.name || ''} - طلبات القياس المنزلية` : `Welcome ${user?.name || ''} - Home measurement requests`}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Navigation size={14} />} onClick={() => navigator.geolocation && fetchRequests()}>
          {isRTL ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={<ClipboardList size={22} />} label={isRTL ? 'مهام نشطة' : 'Active Jobs'} value={String(activeJobs.length)} color="primary" />
        <StatsCard icon={<Clock size={22} />} label={isRTL ? 'بانتظار التعيين' : 'Pending'} value={String(pendingJobs.length)} color="gold" />
        <StatsCard icon={<CheckCircle2 size={22} />} label={isRTL ? 'مكتمل اليوم' : 'Completed Today'} value={String(requests.filter(r => r.status === 'COMPLETED').length)} color="success" />
      </div>

      {/* GPS Map Area */}
      <Card className="p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-900 p-4 border-b border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-slate-100">{isRTL ? 'خريطة الطلبات' : 'Requests Map'}</h3>
          </div>
        </div>
        <div className="h-72 bg-gray-50 dark:bg-slate-800 flex items-center justify-center">
          <div className="text-center p-6">
            <MapPin size={40} className="text-primary-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">
              {isRTL ? 'الخريطة التفاعلية' : 'Interactive Map'}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
              {isRTL ? 'سيتم تحميل خرائط Google عند تفعيل مفتاح API' : 'Google Maps will load when API key is configured'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {activeJobs.slice(0, 3).map((req) => (
                <div key={req.id} className="bg-white dark:bg-slate-700 rounded-xl px-3 py-2 text-xs shadow-sm border border-gray-100 dark:border-slate-600">
                  <span className="font-bold">{req.customer?.name || req.customAddress?.slice(0, 20) || 'عميل'}</span>
                  <span className="text-gray-400 mx-1">·</span>
                  <span>{req.distanceKm ? `${req.distanceKm} كم` : '--'}</span>
                </div>
              ))}
              {activeJobs.length === 0 && (
                <span className="text-xs text-gray-400">{isRTL ? 'لا توجد طلبات نشطة' : 'No active requests'}</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : (
        <>
          {/* Active Jobs */}
          {activeJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                <Car size={18} className="text-primary-600" />
                {isRTL ? 'مهامي النشطة' : 'My Active Jobs'}
              </h3>
              {activeJobs.map((req) => (
                <Card key={req.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_LABELS[req.status]?.color || 'gold'} size="sm">
                          {STATUS_LABELS[req.status]?.ar || req.status}
                        </Badge>
                        <span className="text-xs text-gray-400">#{req.id.slice(0, 8)}</span>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-slate-100">
                        {req.customer?.name || isRTL ? 'عميل' : 'Customer'}
                      </p>
                      {req.customAddress && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin size={12} />{req.customAddress}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                        {req.preferredTime && <span className="flex items-center gap-1"><Clock size={12} />{req.preferredTime}</span>}
                        {req.distanceKm != null && <span>{req.distanceKm} كم</span>}
                        {req.estimatedArrivalMin != null && <span className="text-primary-600 font-semibold">~{req.estimatedArrivalMin} د</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline" size="sm"
                        icon={<Navigation size={12} />}
                        isLoading={updatingId === req.id}
                        onClick={() => handleUpdateLocation(req.id)}
                      >
                        {isRTL ? 'موقعي' : 'GPS'}
                      </Button>
                      {req.status !== 'ARRIVED' && (
                        <Button
                          variant="primary" size="sm"
                          icon={<CheckCircle2 size={12} />}
                          isLoading={updatingId === req.id}
                          onClick={() => handleMarkArrived(req.id)}
                        >
                          {isRTL ? 'وصلت' : 'Arrived'}
                        </Button>
                      )}
                    </div>
                  </div>
                  {req.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-50 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
                        <AlertCircle size={12} />{req.notes}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Pending Jobs Pool */}
          {pendingJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                <Clock size={18} className="text-amber-500" />
                {isRTL ? 'طلبات بانتظار مندوب' : 'Pending Requests'}
              </h3>
              {pendingJobs.map((req) => (
                <Card key={req.id} className="p-4 border-dashed border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">
                        {req.customer?.name || (isRTL ? 'عميل' : 'Customer')}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                        {req.customAddress && <span className="flex items-center gap-1"><MapPin size={11} />{req.customAddress.slice(0, 30)}</span>}
                        {req.preferredTime && <span className="flex items-center gap-1"><Clock size={11} />{req.preferredTime}</span>}
                        {req.scheduledDate && <span className="flex items-center gap-1"><Calendar size={11} />{new Date(req.scheduledDate).toLocaleDateString('ar-SA')}</span>}
                      </div>
                    </div>
                    <Button
                      variant="primary" size="sm"
                      icon={<ArrowRight size={12} />}
                      onClick={async () => {
                        try {
                          await servicesApi.dispatch(req.id);
                          toast.success(isRTL ? 'تم قبول المهمة' : 'Job accepted');
                          fetchRequests();
                        } catch {
                          toast.error(isRTL ? 'فشل قبول المهمة' : 'Failed');
                        }
                      }}
                    >
                      {isRTL ? 'قبول' : 'Accept'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeJobs.length === 0 && pendingJobs.length === 0 && (
            <Card className="p-12 text-center">
              <Ruler size={40} className="text-gray-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-slate-400 font-semibold">
                {isRTL ? 'لا توجد طلبات قياس حالياً' : 'No measurement requests at the moment'}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                {isRTL ? 'ستظهر الطلبات الجديدة هنا تلقائياً' : 'New requests will appear here automatically'}
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
