'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { MeasurementForm } from '@/components/shared/MeasurementForm';
import { useAppStore } from '@/lib/stores/appStore';
import { Ruler, Plus, Edit2, Trash2 } from 'lucide-react';

export default function CustomerMeasurementsPage() {
  const { isRTL } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [measurements, setMeasurements] = useState({
    nameAr: 'المقاسات الشخصية',
    nameEn: 'Personal Measurements',
    data: { chest: 102, waist: 88, shoulderWidth: 46, sleeveLength: 62, shirtLength: 76, neckCircumference: 40, pantLength: 106, inseam: 82 },
  });

  const savedMeasurements = [
    { id: '1', name: 'المقاسات الشخصية', type: isRTL ? 'رجالي' : 'Men', updated: '2024-03-01' },
    { id: '2', name: 'مقاسات الأطفال', type: isRTL ? 'أطفال' : 'Kids', updated: '2024-02-15' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المقاسات المحفوظة' : 'Saved Measurements'}</h2>
        <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
          {isRTL ? 'إضافة مقاسات' : 'Add Measurements'}
        </Button>
      </div>

      {savedMeasurements.map((m) => (
        <Card key={m.id} className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-slate-100">{m.name}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{m.type} - {isRTL ? 'آخر تحديث:' : 'Updated:'} {m.updated}</p>
            </div>
            <div className="flex gap-1">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"><Edit2 size={16} className="text-gray-500 dark:text-slate-400" /></button>
              <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-500" /></button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(measurements.data).map(([key, val]) => (
              <div key={key} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg text-center">
                <p className="text-xs text-gray-500 dark:text-slate-400">{key}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-slate-100">{val} <span className="text-xs text-gray-400 dark:text-slate-500">سم</span></p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={isRTL ? 'إضافة مقاسات جديدة' : 'Add New Measurements'}
        size="xl"
        footer={<Button variant="primary" fullWidth onClick={() => setShowAddModal(false)}>{isRTL ? 'حفظ المقاسات' : 'Save Measurements'}</Button>}
      >
        <MeasurementForm
          measurements={{}}
          onChange={(key, value) => {}}
        />
      </Modal>
    </div>
  );
}
