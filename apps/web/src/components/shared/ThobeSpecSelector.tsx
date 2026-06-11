'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { Scissors, Shirt, Circle, Sun, Moon, Sparkles, PenTool } from 'lucide-react';

export interface ThobeSpec {
  season: 'summer' | 'winter' | 'formal';
  collarType: 'classic' | 'buttons' | 'double' | 'high';
  collarHeight?: number;
  cuffType: 'french' | 'button' | 'ironed';
  cutStyle: 'saudi_classic' | 'khaleeji' | 'slim';
  chestPocket: boolean;
  embroidery: boolean;
  embroideryThreadColor?: string;
  stitchingType: 'normal' | 'double';
  hasSuit?: boolean;
}

interface ThobeSpecSelectorProps {
  value: ThobeSpec;
  onChange: (spec: ThobeSpec) => void;
}

const SEASONS = [
  { id: 'summer' as const, ar: 'صيفي', icon: <Sun size={16} />, desc: 'قطن، نياقة خفيف' },
  { id: 'winter' as const, ar: 'شتوي', icon: <Moon size={16} />, desc: 'صوف، نياقة ثقيل' },
  { id: 'formal' as const, ar: 'رسمي/مناسبات', icon: <Sparkles size={16} />, desc: 'أقمشة فاخرة' },
];

const COLLAR_TYPES = [
  { id: 'classic' as const, ar: 'ياقة رسمية', desc: 'كلاسيكية واقفة' },
  { id: 'buttons' as const, ar: 'ياقة بأزرار', desc: 'زر للإغلاق' },
  { id: 'double' as const, ar: 'ياقة مكوّنة', desc: 'دبل للمناسبات' },
  { id: 'high' as const, ar: 'ياقة مرتفعة', desc: 'بارتفاع مخصص' },
];

const CUFF_TYPES = [
  { id: 'french' as const, ar: 'كبك فرنسي', desc: 'يحتاج أزرار كبك' },
  { id: 'button' as const, ar: 'زر عادي', desc: 'استخدام يومي' },
  { id: 'ironed' as const, ar: 'مكوى/مفتوح', desc: 'حسب الطلب' },
];

const CUT_STYLES = [
  { id: 'saudi_classic' as const, ar: 'سعودي كلاسيكي', desc: 'واسع ومريح' },
  { id: 'khaleeji' as const, ar: 'خليجي معاصر', desc: 'متوسط الاتساع' },
  { id: 'slim' as const, ar: 'مرني/ضيّق', desc: 'Slim Fit عصري' },
];

const THREAD_COLORS = ['أبيض', 'ذهبي', 'فضي', 'أسود', 'أزرق', 'عنّابي'];

export function ThobeSpecSelector({ value, onChange }: ThobeSpecSelectorProps) {
  const { isRTL } = useAppStore();

  const update = (partial: Partial<ThobeSpec>) => onChange({ ...value, ...partial });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Scissors size={18} className="text-primary-600" />
        <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{isRTL ? 'مواصفات الثوب السعودي' : 'Saudi Thobe Specifications'}</h3>
      </div>

      {/* Season / Fabric Type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'الموسم / نوع القماش' : 'Season / Fabric Type'}</p>
        <div className="grid grid-cols-3 gap-2">
          {SEASONS.map(s => (
            <button
              key={s.id}
              onClick={() => update({ season: s.id })}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                value.season === s.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-200'
              }`}
            >
              <div className="flex justify-center mb-1" style={{ color: value.season === s.id ? '#00373E' : '#9CA3AF' }}>{s.icon}</div>
              <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{s.ar}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Collar Type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'نوع الياقة' : 'Collar Type'}</p>
        <div className="grid grid-cols-2 gap-2">
          {COLLAR_TYPES.map(c => (
            <button
              key={c.id}
              onClick={() => update({ collarType: c.id })}
              className={`p-3 rounded-xl border-2 transition-all text-start ${
                value.collarType === c.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{c.ar}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cuff Type */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'نوع الكبك/الزند' : 'Cuff Type'}</p>
        <div className="grid grid-cols-3 gap-2">
          {CUFF_TYPES.map(c => (
            <button
              key={c.id}
              onClick={() => update({ cuffType: c.id })}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                value.cuffType === c.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{c.ar}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Cut Style */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'القصّة / الموديل' : 'Cut / Style'}</p>
        <div className="grid grid-cols-3 gap-2">
          {CUT_STYLES.map(c => (
            <button
              key={c.id}
              onClick={() => update({ cutStyle: c.id })}
              className={`p-3 rounded-xl border-2 transition-all text-center ${
                value.cutStyle === c.id
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <Shirt size={18} className="mx-auto mb-1" style={{ color: value.cutStyle === c.id ? '#00373E' : '#9CA3AF' }} />
              <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{c.ar}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{isRTL ? 'تفاصيل إضافية' : 'Additional Details'}</p>
        <div className="grid grid-cols-2 gap-3">
          {/* Chest Pocket */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{isRTL ? 'جيب الصدر' : 'Chest Pocket'}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{isRTL ? 'إضافة جيب جهة الصدر' : 'Left chest pocket'}</p>
            </div>
            <button
              onClick={() => update({ chestPocket: !value.chestPocket })}
              className={`w-12 h-7 rounded-full transition-colors relative ${value.chestPocket ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${value.chestPocket ? 'start-6' : 'start-1'}`} />
            </button>
          </label>

          {/* Embroidery */}
          <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{isRTL ? 'تطريز' : 'Embroidery'}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{isRTL ? 'الياقة أو الكبك أو الجيب' : 'Collar, cuff or pocket'}</p>
            </div>
            <button
              onClick={() => update({ embroidery: !value.embroidery })}
              className={`w-12 h-7 rounded-full transition-colors relative ${value.embroidery ? 'bg-primary-600' : 'bg-gray-300 dark:bg-slate-600'}`}
            >
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${value.embroidery ? 'start-6' : 'start-1'}`} />
            </button>
          </label>
        </div>

        {/* Thread Color (if embroidery) */}
        {value.embroidery && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'لون خيط التطريز' : 'Thread Color'}</p>
            <div className="flex flex-wrap gap-2">
              {THREAD_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => update({ embroideryThreadColor: c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    value.embroideryThreadColor === c
                      ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stitching Type */}
        <div className="space-y-1.5 pt-1">
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{isRTL ? 'نوع الخياطة' : 'Stitching Type'}</p>
          <div className="flex gap-2">
            {(['normal', 'double'] as const).map(t => (
              <button
                key={t}
                onClick={() => update({ stitchingType: t })}
                className={`flex-1 p-2.5 rounded-xl border-2 text-center text-sm font-semibold transition-all ${
                  value.stitchingType === t
                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300'
                    : 'border-gray-100 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                }`}
              >
                {t === 'normal' ? (isRTL ? 'عادية' : 'Normal') : (isRTL ? 'مزدوجة' : 'Double')}
              </button>
            ))}
          </div>
        </div>

        {/* Suit Option */}
        <label className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer mt-1">
          <div className="flex items-center gap-2">
            <PenTool size={16} className="text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{isRTL ? 'بدلة كاملة' : 'Full Suit'}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">{isRTL ? 'ثوب + جاكيت + بنطلون للمناسبات' : 'Thobe + jacket + trousers'}</p>
            </div>
          </div>
          <button
            onClick={() => update({ hasSuit: !value.hasSuit })}
            className={`w-12 h-7 rounded-full transition-colors relative ${value.hasSuit ? 'bg-amber-500' : 'bg-gray-300 dark:bg-slate-600'}`}
          >
            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${value.hasSuit ? 'start-6' : 'start-1'}`} />
          </button>
        </label>
      </div>
    </div>
  );
}

export const DEFAULT_THOBE_SPEC: ThobeSpec = {
  season: 'summer',
  collarType: 'classic',
  cuffType: 'french',
  cutStyle: 'saudi_classic',
  chestPocket: false,
  embroidery: false,
  stitchingType: 'normal',
  hasSuit: false,
};
