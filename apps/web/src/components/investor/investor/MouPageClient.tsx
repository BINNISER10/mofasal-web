'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MouDocument } from '@/components/investor/MouDocument';
import { MouSignPanel } from '@/components/investor/MouSignPanel';
import { MouEditPanel } from '@/components/investor/MouEditPanel';
import { loadMouDraft, resetMouDraft, saveMouDraft, type MouDraft } from '@/lib/mouStorage';

type MouPageClientProps = {
  mode?: 'screen' | 'print';
  showSignPanel?: boolean;
  showFooter?: boolean;
};

export function MouPageClient({ mode = 'screen', showSignPanel = true, showFooter = true }: MouPageClientProps) {
  const [draft, setDraft] = useState<MouDraft | null>(null);

  useEffect(() => {
    setDraft(loadMouDraft());
  }, []);

  const handleChange = (next: MouDraft) => {
    setDraft(next);
    saveMouDraft(next);
  };

  const handleReset = () => {
    const fresh = resetMouDraft();
    setDraft(fresh);
  };

  if (!draft) {
    return <div className="min-h-screen bg-[#F2E8D4] flex items-center justify-center text-[#00373E]">جاري التحميل...</div>;
  }

  return (
    <>
      {mode === 'screen' && <MouEditPanel draft={draft} onChange={handleChange} onReset={handleReset} />}
      <MouDocument mode={mode} draft={draft} />
      {showSignPanel && mode === 'screen' && <MouSignPanel parties={draft.parties} />}
      {showFooter && mode === 'screen' && (
        <footer className="print:hidden sticky bottom-0 bg-white/90 backdrop-blur border-t border-[#00373E]/10 p-4 flex flex-wrap gap-3 justify-center">
          <a
            href="/investor/MOFASAL-MOU.pdf"
            download
            className="px-6 py-3 rounded-xl bg-[#00373E] text-white font-bold text-sm hover:opacity-90 transition"
          >
            تحميل PDF الأساسي
          </a>
          <Link
            href="/investor"
            className="px-6 py-3 rounded-xl border border-[#00373E] text-[#00373E] font-bold text-sm"
          >
            حزمة المستثمر
          </Link>
        </footer>
      )}
    </>
  );
}
