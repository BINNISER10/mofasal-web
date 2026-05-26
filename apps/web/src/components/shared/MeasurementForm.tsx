'use client';
import React from 'react';
import { cn } from '@/lib/utils/cn';
import { useAppStore } from '@/lib/stores/appStore';

interface MeasurementFormProps {
  measurements: Record<string, number | undefined>;
  onChange: (key: string, value: number) => void;
  readOnly?: boolean;
  className?: string;
}

const measurementFields = [
  {
    key: 'chest',
    labelAr: 'محيط الصدر',
    labelEn: 'Chest Circumference',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'shoulderWidth',
    labelAr: 'عرض الكتف',
    labelEn: 'Shoulder Width',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'sleeveLength',
    labelAr: 'طول الكم',
    labelEn: 'Sleeve Length',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'armLength',
    labelAr: 'طول الذراع',
    labelEn: 'Arm Length',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'neckCircumference',
    labelAr: 'محيط الرقبة',
    labelEn: 'Neck Circumference',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'bicepsCircumference',
    labelAr: 'محيط العضد',
    labelEn: 'Biceps Circumference',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'wristCircumference',
    labelAr: 'محيط المعصم',
    labelEn: 'Wrist Circumference',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'shirtLength',
    labelAr: 'طول القميص',
    labelEn: 'Shirt Length',
    unit: 'سم',
    category: 'upper',
  },
  {
    key: 'waist',
    labelAr: 'محيط الخصر',
    labelEn: 'Waist Circumference',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'hips',
    labelAr: 'محيط الورك',
    labelEn: 'Hips Circumference',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'thighCircumference',
    labelAr: 'محيط الفخذ',
    labelEn: 'Thigh Circumference',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'pantLength',
    labelAr: 'طول البنطلون',
    labelEn: 'Pant Length',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'inseam',
    labelAr: 'طول الدرز الداخلي',
    labelEn: 'Inseam',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'outseam',
    labelAr: 'طول الدرز الخارجي',
    labelEn: 'Outseam',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'kneeCircumference',
    labelAr: 'محيط الركبة',
    labelEn: 'Knee Circumference',
    unit: 'سم',
    category: 'lower',
  },
  {
    key: 'ankleCircumference',
    labelAr: 'محيط الكاحل',
    labelEn: 'Ankle Circumference',
    unit: 'سم',
    category: 'lower',
  },
];

export function MeasurementForm({
  measurements,
  onChange,
  readOnly = false,
  className,
}: MeasurementFormProps) {
  const { isRTL } = useAppStore();

  const upperFields = measurementFields.filter((f) => f.category === 'upper');
  const lowerFields = measurementFields.filter((f) => f.category === 'lower');

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h4 className="text-sm font-bold text-primary-700 mb-3 pb-2 border-b border-primary-100">
          {isRTL ? 'القياسات العلوية' : 'Upper Body Measurements'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {upperFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isRTL ? field.labelAr : field.labelEn}
              </label>
              {readOnly ? (
                <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm font-semibold text-gray-800">
                  {measurements[field.key] ? `${measurements[field.key]} ${field.unit}` : '-'}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={measurements[field.key] ?? ''}
                    onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min={0}
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {field.unit}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold text-primary-700 mb-3 pb-2 border-b border-primary-100">
          {isRTL ? 'القياسات السفلية' : 'Lower Body Measurements'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {lowerFields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {isRTL ? field.labelAr : field.labelEn}
              </label>
              {readOnly ? (
                <div className="px-3 py-2 rounded-lg bg-gray-50 text-sm font-semibold text-gray-800">
                  {measurements[field.key] ? `${measurements[field.key]} ${field.unit}` : '-'}
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={measurements[field.key] ?? ''}
                    onChange={(e) => onChange(field.key, parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                    min={0}
                  />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {field.unit}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
