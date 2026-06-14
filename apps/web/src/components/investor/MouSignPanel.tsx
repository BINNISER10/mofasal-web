'use client';

import { useEffect, useState } from 'react';
import { MOU_PARTIES } from '@/data/mouContent';
import { SignaturePad } from '@/components/investor/SignaturePad';
import {
  clearAllSignatures,
  downloadPdf,
  generateSignedMouPdf,
  loadSignatures,
  saveSignatures,
  type MouSignState,
  type PartySignature,
} from '@/lib/generateSignedMouPdf';

export function MouSignPanel() {
  const [signatures, setSignatures] = useState<MouSignState>({});
  const [activeId, setActiveId] = useState(MOU_PARTIES[0].id);
  const [idNumber, setIdNumber] = useState('');
  const [draftSig, setDraftSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const activeParty = MOU_PARTIES.find((p) => p.id === activeId)!;

  useEffect(() => {
    setSignatures(loadSignatures());
  }, []);

  useEffect(() => {
    const saved = signatures[activeId];
    setIdNumber(saved?.idNumber ?? '');
    setDraftSig(null);
  }, [activeId, signatures]);

  const sign = () => {
    if (!draftSig) {
      setMsg('يرجى رسم التوقيع في المربع أولاً');
      return;
    }
    const entry: PartySignature = {
      partyId: activeId,
      name: activeParty.name,
      role: activeParty.role,
      idNumber: idNumber.trim(),
      signatureDataUrl: draftSig,
      signedAt: new Date().toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' }),
    };
    const next = { ...signatures, [activeId]: entry };
    setSignatures(next);
    saveSignatures(next);
    setMsg(`تم اعتماد توقيع ${activeParty.name} إلكترونياً`);
    setDraftSig(null);
  };

  const downloadSigned = async () => {
    const count = Object.keys(signatures).length;
    if (!count) {
      setMsg('لا توجد توقيعات بعد');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const bytes = await generateSignedMouPdf(signatures);
      downloadPdf(bytes, `MOFASAL-MOU-Signed-${count}parties.pdf`);
      setMsg('تم تحميل PDF الموقّع بنجاح');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'فشل توليد PDF');
    } finally {
      setBusy(false);
    }
  };

  const resetAll = () => {
    if (!confirm('حذف جميع التوقيعات المحفوظة؟')) return;
    clearAllSignatures();
    setSignatures({});
    setMsg('تم مسح التوقيعات');
  };

  const signedCount = Object.keys(signatures).length;

  return (
    <section className="print:hidden bg-white border-t-4 border-[#D4A017] py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <p className="text-[#D4A017] text-xs font-bold tracking-widest mb-2">ELECTRONIC SIGNATURE</p>
          <h2 className="text-2xl font-black text-[#00373E]">التوقيع الإلكتروني</h2>
          <p className="text-sm text-[#735B4D] mt-2">
            كل شريك يوقّع من جهازه — يُضاف قسم شهادة التوقيع إلى PDF المذكرة
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {MOU_PARTIES.map((p) => {
            const done = !!signatures[p.id];
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveId(p.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                  activeId === p.id
                    ? 'bg-[#00373E] text-white'
                    : done
                      ? 'bg-[#D4A017]/20 text-[#00373E] border border-[#D4A017]'
                      : 'bg-[#F5F5F5] text-[#735B4D]'
                }`}
              >
                {p.name} {done ? '✓' : ''}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-[#00373E]/15 p-6 bg-[#F2E8D4]/40 space-y-4">
          <div>
            <p className="font-bold text-[#00373E]">{activeParty.name}</p>
            <p className="text-sm text-[#735B4D]">{activeParty.role}</p>
          </div>

          <label className="block text-sm">
            <span className="text-[#735B4D]">{activeParty.idLabel}</span>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="أدخل رقم الهوية / الإقامة"
              className="mt-1 w-full rounded-xl border border-[#00373E]/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
              disabled={!!signatures[activeId]}
            />
          </label>

          {signatures[activeId] ? (
            <div className="rounded-xl bg-white p-4 border border-[#D4A017]/40">
              <p className="text-sm text-[#00373E] font-bold mb-2">✓ موقّع إلكترونياً</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatures[activeId].signatureDataUrl} alt="توقيع" className="h-20 object-contain" />
              <p className="text-xs text-[#735B4D] mt-2">{signatures[activeId].signedAt}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#735B4D]">ارسم توقيعك بالإصبع أو الماوس:</p>
              <SignaturePad onChange={setDraftSig} />
              <button
                type="button"
                onClick={sign}
                className="w-full py-3 rounded-xl bg-[#00373E] text-white font-bold text-sm hover:opacity-90"
              >
                اعتماد التوقيع الإلكتروني
              </button>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/investor/MOFASAL-MOU.pdf"
            download
            className="px-6 py-3 rounded-xl border border-[#00373E] text-[#00373E] font-bold text-sm hover:bg-[#00373E]/5"
          >
            تحميل PDF الأساسي
          </a>
          <button
            type="button"
            onClick={downloadSigned}
            disabled={busy || signedCount === 0}
            className="px-6 py-3 rounded-xl bg-[#D4A017] text-[#00373E] font-bold text-sm hover:opacity-90 disabled:opacity-40"
          >
            {busy ? 'جاري التوليد...' : `تحميل PDF الموقّع (${signedCount}/4)`}
          </button>
          {signedCount > 0 && (
            <button type="button" onClick={resetAll} className="px-4 py-3 text-sm text-red-600 hover:underline">
              مسح الكل
            </button>
          )}
        </div>

        {msg && <p className="text-center text-sm text-[#00373E] font-medium">{msg}</p>}

        <p className="text-center text-xs text-[#8F786B] max-w-lg mx-auto">
          التوقيع الإلكتروني يُولّد رمز تحقق SHA-256 ويُرفق بصفحة شهادة في نهاية المذكرة. للاعتماد القانوني النهائي يُنصح بتوثيق عقد التأسيس لدى الجهات المختصة.
        </p>
      </div>
    </section>
  );
}
