'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { servicesApi } from '@/lib/api/services';
import toast from 'react-hot-toast';
import {
  MapPin, Clock, Star, User, Phone, Calendar, Ruler,
  ChevronRight, CheckCircle2, ArrowRight, Car, Search,
} from 'lucide-react';

const STEPS = [
  { id: 1, ar: 'اختر المنطقة', en: 'Select Area' },
  { id: 2, ar: 'اختر المندوب', en: 'Choose Rep' },
  { id: 3, ar: 'حدد الموعد', en: 'Pick Time' },
  { id: 4, ar: 'تأكيد الحجز', en: 'Confirm' },
];

const [reps, setReps] = useState<any[]>([]);
const [loadingReps, setLoadingReps] = useState(false);

const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00',
];

const DATE_OPTIONS = [
  { label: 'اليوم', date: new Date().toLocaleDateString('ar-SA') },
  { label: 'غداً', date: new Date(Date.now() + 86400000).toLocaleDateString('ar-SA') },
  { label: 'بعد غد', date: new Date(Date.now() + 172800000).toLocaleDateString('ar-SA') },
];

export default function BookMeasurementPage() {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState('');
  const [selectedRep, setSelectedRep] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (step === 2) {
      setLoadingReps(true);
      servicesApi.list({ status: 'available' })
        .then((data: any[]) => {
          const mapped = (Array.isArray(data) ? data : []).map((r: any) => ({
            id: r.id,
            name: r.name || r.representative?.name || 'مندوب',
            rating: r.rating || 4.5,
            completedJobs: r.completedJobs || 0,
            distanceKm: r.distanceKm || r.distance || 0,
            availableToday: true,
            avatar: (r.name || 'م')[0],
            pricePerVisit: r.pricePerVisit || 30,
          }));
          setReps(mapped.length > 0 ? mapped : [
            { id: 'r1', name: 'ماجد الشمري', rating: 4.9, completedJobs: 342, distanceKm: 1.2, availableToday: true, avatar: 'م', pricePerVisit: 30 },
            { id: 'r2', name: 'فهد العتيبي', rating: 4.8, completedJobs: 218, distanceKm: 2.5, availableToday: true, avatar: 'ف', pricePerVisit: 25 },
          ]);
        })
        .catch(() => {
          setReps([
            { id: 'r1', name: 'ماجد الشمري', rating: 4.9, completedJobs: 342, distanceKm: 1.2, availableToday: true, avatar: 'م', pricePerVisit: 30 },
            { id: 'r2', name: 'فهد العتيبي', rating: 4.8, completedJobs: 218, distanceKm: 2.5, availableToday: true, avatar: 'ف', pricePerVisit: 25 },
          ]);
        })
        .finally(() => setLoadingReps(false));
    }
  }, [step]);

  const handleConfirm = async () => {
    if (!selectedRep || !selectedDate || !selectedTime) return;
    setIsSubmitting(true);
    try {
      const service = await servicesApi.create({
        shopId: 'default',
        serviceType: 'ON_SITE_MEASUREMENT',
        customAddress: address || undefined,
        scheduledDate: new Date(`${selectedDate}T${selectedTime}:00`).toISOString(),
        preferredTime: selectedTime || undefined,
        notes: rep ? `المندوب المفضل: ${rep.name}` : undefined,
      });
      if (service?.service?.id) {
        await servicesApi.dispatch(service.service.id);
      }
      setConfirmed(true);
      toast.success(isRTL ? 'تم حجز موعد القياس بنجاح!' : 'Measurement appointment booked!');
    } catch (err) {
      console.error('Booking failed', err);
      toast.error(isRTL ? 'فشل حجز الموعد' : 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const rep = reps.find(r => r.id === selectedRep);

  if (confirmed) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-6">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-2">{isRTL ? 'تم الحجز!' : 'Booked!'}</h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm mb-4">
            {isRTL ? `سيصلك ${rep?.name} في الموعد المحدد` : `${rep?.name} will arrive at your scheduled time`}
          </p>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{isRTL ? 'المندوب' : 'Rep'}</span><span className="font-bold dark:text-slate-200">{rep?.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{isRTL ? 'التاريخ' : 'Date'}</span><span className="font-bold dark:text-slate-200">{selectedDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{isRTL ? 'الوقت' : 'Time'}</span><span className="font-bold dark:text-slate-200">{selectedTime}</span></div>
          </div>
          <Button variant="primary" fullWidth onClick={() => router.push('/dashboard/customer/orders')}>
            {isRTL ? 'متابعة الطلبات' : 'View Orders'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-32">
      {/* Back */}
      <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()} className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 mb-4">
        <ArrowRight size={16} />
        <span>{isRTL ? 'رجوع' : 'Back'}</span>
      </button>

      <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-1">{isRTL ? 'حجز موعد قياس' : 'Book Measurement'}</h1>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{isRTL ? 'يأتي إليك مندوب متخصص في القياس' : 'A specialist rep comes to you'}</p>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'
              }`}>
                {step > s.id ? '✓' : s.id}
              </div>
              <span className={`text-[10px] font-semibold ${step === s.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500'}`}>
                {isRTL ? s.ar : s.en}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${step > s.id ? 'bg-green-400' : 'bg-gray-100 dark:bg-slate-700'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Address */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="p-5 dark:bg-slate-800/60">
            <h2 className="font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary-600" />
              {isRTL ? 'أين تريد الموعد؟' : 'Where do you want the appointment?'}
            </h2>
            <div className="relative mb-4">
              <Search size={16} className="absolute top-3 start-3 text-gray-400" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isRTL ? 'أدخل عنوانك...' : 'Enter your address...'}
                className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-slate-600">
              <div className="text-center">
                <MapPin size={32} className="text-primary-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الخريطة التفاعلية' : 'Interactive Map'}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'سيتم تكاملها مع Google Maps' : 'Google Maps integration'}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              {['المنزل - شارع الملك فهد', 'العمل - طريق الملك عبدالله'].map(a => (
                <button key={a} onClick={() => setAddress(a)} className="text-xs px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700">
                  {a}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Step 2: Choose Rep */}
      {step === 2 && (
        <div className="space-y-3">
          {loadingReps ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-3">
                {isRTL ? `${reps.length} مندوبين متاحون بالقرب منك` : `${reps.length} reps available near you`}
              </p>
              {reps.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRep(r.id)}
                  className={`w-full text-start p-4 rounded-2xl border-2 transition-all ${
                    selectedRep === r.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xl font-black flex-shrink-0">
                      {r.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-slate-100">{r.name}</p>
                        {r.availableToday && <Badge variant="success" size="sm">متاح اليوم</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Star size={11} className="text-yellow-400 fill-yellow-400" />{r.rating}</span>
                        <span>{r.completedJobs} قياس</span>
                        <span className="flex items-center gap-1"><MapPin size={11} />{r.distanceKm} كم</span>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-black text-primary-700 dark:text-primary-400">{r.pricePerVisit} ر.س</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'زيارة' : 'visit'}</p>
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="p-5 dark:bg-slate-800/60">
            <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary-600" />{isRTL ? 'اختر اليوم' : 'Select Day'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {DATE_OPTIONS.map(d => (
                <button key={d.label} onClick={() => setSelectedDate(d.date)} className={`p-3 rounded-xl text-center border-2 transition-all ${selectedDate === d.date ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-slate-700'}`}>
                  <p className={`text-sm font-bold ${selectedDate === d.date ? 'text-primary-700 dark:text-primary-300' : 'text-gray-800 dark:text-slate-200'}`}>{d.label}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5" dir="ltr">{d.date}</p>
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-5 dark:bg-slate-800/60">
            <h3 className="font-bold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-primary-600" />{isRTL ? 'اختر الوقت' : 'Select Time'}
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map(t => (
                <button key={t} onClick={() => setSelectedTime(t)} className={`p-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${selectedTime === t ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-100 dark:border-slate-700 text-gray-700 dark:text-slate-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && rep && (
        <Card className="p-5 dark:bg-slate-800/60 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{isRTL ? 'ملخص الحجز' : 'Booking Summary'}</h3>
          {[
            { icon: <User size={16} />, label: isRTL ? 'المندوب' : 'Rep', value: rep.name },
            { icon: <MapPin size={16} />, label: isRTL ? 'العنوان' : 'Address', value: address || 'المنزل - شارع الملك فهد' },
            { icon: <Calendar size={16} />, label: isRTL ? 'التاريخ' : 'Date', value: selectedDate || '' },
            { icon: <Clock size={16} />, label: isRTL ? 'الوقت' : 'Time', value: selectedTime || '' },
            { icon: <Ruler size={16} />, label: isRTL ? 'تكلفة الزيارة' : 'Visit Cost', value: `${rep.pricePerVisit} ر.س` },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 dark:border-slate-700 last:border-0">
              <div className="text-primary-600">{row.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 dark:text-slate-500">{row.label}</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{row.value}</p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800 p-4">
        <div className="max-w-2xl mx-auto">
          {step < 4 ? (
            <Button
              variant="primary" fullWidth size="lg"
              icon={<ChevronRight size={18} />}
              disabled={(step === 1 && !address) || (step === 2 && !selectedRep) || (step === 3 && (!selectedDate || !selectedTime))}
              onClick={() => setStep(s => s + 1)}
            >
              {isRTL ? 'التالي' : 'Next'}
            </Button>
          ) : (
            <Button variant="primary" fullWidth size="lg" isLoading={isSubmitting} onClick={handleConfirm}
              icon={<CheckCircle2 size={18} />}>
              {isRTL ? 'تأكيد الحجز' : 'Confirm Booking'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
