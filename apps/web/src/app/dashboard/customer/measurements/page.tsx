'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MeasurementForm } from '@/components/shared/MeasurementForm';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { usersApi, Measurement } from '@/lib/api/users';
import { Ruler, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const LABEL_MAP: Record<string, string> = {
  chest: 'الصدر', waist: 'الخصر', hips: 'الوركين', shoulderWidth: 'الكتفين',
  sleeveLength: 'طول الكم', armLength: 'طول الذراع', neckCircumference: 'الرقبة',
  shirtLength: 'طول القميص', thighCircumference: 'الفخذين', pantLength: 'طول البنطلون',
  inseam: 'الداخلية', outseam: 'الخارجية', kneeCircumference: 'الركبة',
  ankleCircumference: 'الكاحل', bicepsCircumference: 'العضد', wristCircumference: 'المعصم',
};

export default function CustomerMeasurementsPage() {
  const { isRTL } = useAppStore();
  const { user } = useAuthStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedMeasurements, setSavedMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formData, setFormData] = useState<Record<string, number>>({});

  const fetchMeasurements = useCallback(async () => {
    if (!user) return;
    try {
      const res = await usersApi.getMeasurements(user.id);
      setSavedMeasurements(res.measurements || []);
    } catch {
      // لا بيانات
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchMeasurements(); }, [fetchMeasurements]);

  const handleSave = async () => {
    if (!user || !formName.trim()) {
      toast.error(isRTL ? 'أدخل اسم المقاسات' : 'Enter a name');
      return;
    }
    setSaving(true);
    try {
      await usersApi.createMeasurement(user.id, { name: formName.trim(), data: formData });
      toast.success(isRTL ? 'تم حفظ المقاسات' : 'Measurements saved');
      setShowAddModal(false);
      setFormName('');
      setFormData({});
      fetchMeasurements();
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      await usersApi.deleteMeasurement(user.id, id);
      setSavedMeasurements((prev) => prev.filter((m) => m.id !== id));
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الحذف' : 'Failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'}</h2>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          {isRTL ? 'إضافة مقاسات' : 'Add Measurements'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : savedMeasurements.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4"><Ruler size={28} className="text-gray-400" /></div>
          <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد مقاسات محفوظة' : 'No saved measurements'}</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowAddModal(true)}>{isRTL ? 'أضف مقاساتك الأولى' : 'Add Your First Measurements'}</Button>
        </Card>
      ) : (
        savedMeasurements.map((m) => (
          <Card key={m.id} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100">{m.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'تمت الإضافة:' : 'Added:'} {m.createdAt?.slice(0, 10)}</p>
              </div>
              <button onClick={() => handleDelete(m.id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-500" /></button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(m.data || {}).map(([key, val]) => (
                <div key={key} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-center">
                  <p className="text-xs text-gray-500 dark:text-slate-400">{LABEL_MAP[key] || key}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-slate-100">{val} <span className="text-xs text-gray-400 dark:text-slate-500">سم</span></p>
                </div>
              ))}
            </div>
          </Card>
        ))
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isRTL ? 'إضافة مقاسات جديدة' : 'Add New Measurements'}
        size="xl"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="primary" onClick={handleSave} isLoading={saving} disabled={saving || !formName.trim()}>{isRTL ? 'حفظ المقاسات' : 'Save Measurements'}</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder={isRTL ? 'اسم المقاسات (مثال: المقاسات الشخصية)' : 'Name (e.g., Personal Measurements)'}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm"
          />
          <MeasurementForm
            measurements={formData}
            onChange={(key, value) => setFormData((prev) => ({ ...prev, [key]: value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
