'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { servicesApi, ServiceRequest } from '@/lib/api/services';
import toast from 'react-hot-toast';
import {
  MapPin, Clock, User, Phone, Navigation, CheckCircle2, Loader2,
  Ruler, Calendar, ChevronDown, ChevronUp, MessageSquare,
} from 'lucide-react';

const MEASURE_FIELDS = [
  { key: 'chest', ar: 'الصدر', hint: 'حول أعرض جزء من الصدر', range: [70, 160] },
  { key: 'waist', ar: 'الخصر', hint: 'حول أضيق جزء من الخصر', range: [50, 150] },
  { key: 'hips', ar: 'الأرداف', hint: 'حول أعرض جزء من الأرداف', range: [60, 160] },
  { key: 'shoulders', ar: 'عرض الكتف', hint: 'بين أعلى الكتفين', range: [30, 70] },
  { key: 'sleeve', ar: 'طول الكم', hint: 'من الكتف إلى المعصم', range: [40, 80] },
  { key: 'neck', ar: 'محيط الرقبة', hint: 'حول قاعدة الرقبة', range: [25, 55] },
  { key: 'height', ar: 'الطول الكلي', hint: 'من الكتف إلى الكعب', range: [80, 200] },
];

const STATUS_LABELS: Record<string, { ar: string; color: 'info' | 'success' | 'gold' | 'danger' | 'primary' }> = {
  PENDING: { ar: 'قيد الانتظار', color: 'gold' },
  ASSIGNED: { ar: 'تم التعيين', color: 'primary' },
  EN_ROUTE: { ar: 'في الطريق', color: 'info' },
  ARRIVED: { ar: 'وصل', color: 'success' },
  COMPLETED: { ar: 'مكتمل', color: 'success' },
  CANCELLED: { ar: 'ملغي', color: 'danger' },
};

export default function RepAssignmentsPage() {
  const { isRTL } = useAppStore();
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [measureNotes, setMeasureNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await servicesApi.list();
      setRequests(Array.isArray(data) ? data : []);
    } catch { setRequests([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleUpdateLocation = async (reqId: string) => {
    if (!navigator.geolocation) { toast.error(isRTL ? 'GPS غير متاح' : 'GPS not available'); return; }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        await servicesApi.updateLocation(reqId, pos.coords.latitude, pos.coords.longitude);
        toast.success(isRTL ? 'تم تحديث الموقع' : 'Location updated');
        fetchRequests();
      } catch { toast.error(isRTL ? 'فشل' : 'Failed'); }
    });
  };

  const handleMarkArrived = async (reqId: string) => {
    try {
      await servicesApi.markArrived(reqId);
      toast.success(isRTL ? 'تم تسجيل الوصول' : 'Arrived');
      fetchRequests();
    } catch { toast.error(isRTL ? 'فشل' : 'Failed'); }
  };

  const handleSaveMeasurements = async (reqId: string) => {
    setSaving(true);
    try {
      const numMeasurements: Record<string, number> = {};
      Object.entries(measurements).forEach(([k, v]) => {
        const n = parseFloat(v);
        if (!isNaN(n)) numMeasurements[k] = n;
      });
      await servicesApi.complete(reqId, {
        measurements: numMeasurements,
        notes: measureNotes || undefined,
        garmentType: 'thobe',
      });
      toast.success(isRTL ? 'تم حفظ القياسات وإنشاء الطلب' : 'Measurements saved & order created');
      setExpandedId(null);
      setMeasurements({});
      setMeasureNotes('');
      fetchRequests();
    } catch { toast.error(isRTL ? 'فشل الحفظ' : 'Save failed'); }
    finally { setSaving(false); }
  };

  const activeReq = requests.filter(r => ['ASSIGNED', 'EN_ROUTE', 'ARRIVED'].includes(r.status));
  const completed = requests.filter(r => ['COMPLETED'].includes(r.status));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-600" size={36} /></div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">{isRTL ? 'مهامي' : 'My Assignments'}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {isRTL ? `${activeReq.length} مهمة نشطة` : `${activeReq.length} active assignments`}
        </p>
      </div>

      {/* Active Assignments */}
      {activeReq.map((req) => (
        <Card key={req.id} className="p-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={STATUS_LABELS[req.status]?.color || 'primary'} size="sm">
                  {STATUS_LABELS[req.status]?.ar || req.status}
                </Badge>
                {req.estimatedArrivalMin != null && req.status === 'EN_ROUTE' && (
                  <Badge variant="info" size="sm">~{req.estimatedArrivalMin} د</Badge>
                )}
              </div>
              <p className="font-bold text-gray-900 dark:text-slate-100 text-lg">
                {req.customer?.name || (isRTL ? 'عميل' : 'Customer')}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-slate-400">
                {req.customAddress && <span className="flex items-center gap-1"><MapPin size={13} />{req.customAddress}</span>}
                {req.customer?.phone && <span className="flex items-center gap-1"><Phone size={13} />{req.customer.phone}</span>}
                {req.preferredTime && <span className="flex items-center gap-1"><Clock size={13} />{req.preferredTime}</span>}
                {req.distanceKm != null && <span className="flex items-center gap-1"><Navigation size={13} />{req.distanceKm} كم</span>}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" icon={<Navigation size={12} />} onClick={() => handleUpdateLocation(req.id)}>
                GPS
              </Button>
              {req.status !== 'ARRIVED' && (
                <Button variant="primary" size="sm" icon={<CheckCircle2 size={12} />} onClick={() => handleMarkArrived(req.id)}>
                  {isRTL ? 'وصلت' : 'Arrived'}
                </Button>
              )}
            </div>
          </div>

          {req.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
              {req.notes}
            </div>
          )}

          {/* Measurement entry (only after arrival) */}
          {req.status === 'ARRIVED' && (
            <>
              <button
                onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                className="w-full flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-primary-700 dark:text-primary-300 font-semibold text-sm"
              >
                <span className="flex items-center gap-2"><Ruler size={16} />{isRTL ? 'إدخال القياسات' : 'Enter Measurements'}</span>
                {expandedId === req.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {expandedId === req.id && (
                <div className="space-y-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'أدخل القياسات بالسنتيمتر' : 'Enter measurements in cm'}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {MEASURE_FIELDS.map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 flex items-center gap-1">
                          {field.ar}
                          <span className="text-[10px] text-gray-400">({field.range[0]}-{field.range[1]} سم)</span>
                        </label>
                        <input
                          type="number"
                          placeholder={field.hint}
                          value={measurements[field.key] || ''}
                          onChange={(e) => setMeasurements(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-400 block mb-1">
                      {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
                    </label>
                    <textarea
                      value={measureNotes}
                      onChange={(e) => setMeasureNotes(e.target.value)}
                      placeholder={isRTL ? 'أي ملاحظات عن المقاسات أو القماش...' : 'Any notes about measurements or fabric...'}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="primary" fullWidth size="sm"
                    icon={<CheckCircle2 size={14} />}
                    isLoading={saving}
                    onClick={() => handleSaveMeasurements(req.id)}
                  >
                    {isRTL ? 'حفظ وإنشاء الطلب' : 'Save & Create Order'}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      ))}

      {activeReq.length === 0 && (
        <Card className="p-12 text-center">
          <Ruler size={48} className="text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-slate-400 font-semibold">{isRTL ? 'لا توجد مهام نشطة' : 'No active assignments'}</p>
        </Card>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-500" />
            {isRTL ? 'مكتملة اليوم' : 'Completed Today'}
          </h3>
          {completed.map((req) => (
            <Card key={req.id} className="p-3 flex items-center justify-between opacity-70">
              <div>
                <p className="font-semibold text-sm text-gray-700 dark:text-slate-300">{req.customer?.name || 'عميل'}</p>
                <p className="text-xs text-gray-400">{req.customAddress?.slice(0, 30)}{req.scheduledDate && ` · ${new Date(req.scheduledDate).toLocaleDateString('ar-SA')}`}</p>
              </div>
              <Badge variant="success" size="sm">✓</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
