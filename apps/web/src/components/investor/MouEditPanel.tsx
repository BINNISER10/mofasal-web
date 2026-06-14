'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Pencil } from 'lucide-react';
import type { MouDraft, MouPartyDraft } from '@/lib/mouStorage';

type MouEditPanelProps = {
  draft: MouDraft;
  onChange: (draft: MouDraft) => void;
  onReset: () => void;
};

export function MouEditPanel({ draft, onChange, onReset }: MouEditPanelProps) {
  const [open, setOpen] = useState(true);

  const updateParty = (id: number, patch: Partial<MouPartyDraft>) => {
    onChange({
      ...draft,
      parties: draft.parties.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const handleReset = () => {
    if (!confirm('استعادة القيم الافتراضية؟ سيتم مسح التعديلات المحفوظة.')) return;
    onReset();
  };

  return (
    <section className="print:hidden sticky top-0 z-20 bg-white border-b border-[#00373E]/15 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-[#00373E] hover:bg-[#F2E8D4]/50 transition"
      >
        <span className="flex items-center gap-2 font-bold text-sm">
          <Pencil size={16} className="text-[#D4A017]" />
          تعديل بيانات المذكرة
        </span>
        <span className="flex items-center gap-2 text-xs text-[#735B4D]">
          يُحفظ تلقائياً في المتصفح
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6 max-w-4xl mx-auto space-y-5">
          <div className="grid md:grid-cols-3 gap-3">
            <label className="block text-sm">
              <span className="text-[#735B4D] text-xs">اسم الشركة</span>
              <input
                type="text"
                value={draft.company}
                onChange={(e) => onChange({ ...draft, company: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#00373E]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#735B4D] text-xs">اسم المشروع</span>
              <input
                type="text"
                value={draft.project}
                onChange={(e) => onChange({ ...draft, project: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#00373E]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
            <label className="block text-sm">
              <span className="text-[#735B4D] text-xs">التاريخ</span>
              <input
                type="text"
                value={draft.date}
                onChange={(e) => onChange({ ...draft, date: e.target.value })}
                placeholder="___ / ___ / ________ هـ"
                className="mt-1 w-full rounded-xl border border-[#00373E]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              />
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {draft.parties.map((p) => (
              <div key={p.id} className="rounded-xl border border-[#00373E]/10 p-4 bg-[#F2E8D4]/30 space-y-2">
                <p className="text-xs font-bold text-[#D4A017]">الطرف {p.id}</p>
                <label className="block text-sm">
                  <span className="text-[#735B4D] text-xs">الاسم</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updateParty(p.id, { name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#00373E]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-[#735B4D] text-xs">الصفة / الدور</span>
                  <input
                    type="text"
                    value={p.role}
                    onChange={(e) => updateParty(p.id, { role: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-[#00373E]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-[#735B4D] text-xs">{p.idLabel}</span>
                  <input
                    type="text"
                    value={p.idNumber}
                    onChange={(e) => updateParty(p.id, { idNumber: e.target.value })}
                    placeholder="أدخل رقم الهوية / الإقامة"
                    className="mt-1 w-full rounded-lg border border-[#00373E]/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#735B4D] hover:text-[#00373E] transition"
            >
              <RotateCcw size={14} />
              استعادة الافتراضي
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
