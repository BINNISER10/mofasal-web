'use client';

import Image from 'next/image';
import { MOU_META, MOU_SECTIONS } from '@/data/mouContent';
import { applyPartyNames, type MouDraft } from '@/lib/mouStorage';

const SCREENSHOTS = [
  { src: '/investor/screenshots/01-home.png', alt: 'الصفحة الرئيسية' },
  { src: '/investor/screenshots/05-admin-dashboard.png', alt: 'لوحة الإدارة' },
  { src: '/investor/screenshots/09-customer-order-wizard.png', alt: 'معالج الطلب' },
];

type MouDocumentProps = {
  mode?: 'screen' | 'print';
  draft: MouDraft;
};

export function MouDocument({ mode = 'screen', draft }: MouDocumentProps) {
  const isPrint = mode === 'print';

  return (
    <div className={`min-h-screen bg-[#F2E8D4] text-[#1A1A1A] ${isPrint ? 'print-mou' : ''}`} dir="rtl">
      <section className="min-h-[90vh] bg-[#00373E] text-white flex flex-col items-center justify-center px-6 text-center print:min-h-screen print:break-after-page">
        <Image src="/images/logo.png" alt="مفصل" width={120} height={120} className="mb-8 rounded-2xl" priority />
        <p className="text-[#D4A017] text-sm tracking-widest mb-4">{draft.project} — {draft.company}</p>
        <h1 className="text-4xl md:text-5xl font-black mb-4">{MOU_META.title}</h1>
        <p className="text-white/80 max-w-xl text-lg leading-relaxed">
          منصة الخياطة الذكية للرجال والأطفال في المملكة العربية السعودية
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center text-sm text-white/60">
          <span>mofasal.netlify.app</span>
          <span>•</span>
          <span>وثيقة شراكة — سري</span>
        </div>
        <p className="mt-6 text-[#D4A017]/80 text-xs">نسخة قابلة للتعديل — غلاف معتمد</p>
      </section>

      <section className="py-16 px-6 max-w-5xl mx-auto print:break-after-page">
        <h2 className="text-2xl font-black text-[#00373E] mb-2">نظرة على المنصة</h2>
        <p className="text-[#735B4D] mb-8 text-sm">لقطات حية من النسخة التشغيلية</p>
        <div className="grid md:grid-cols-3 gap-4">
          {SCREENSHOTS.map((s) => (
            <div key={s.src} className="rounded-2xl overflow-hidden border border-[#00373E]/10 shadow-lg">
              <Image src={s.src} alt={s.alt} width={480} height={300} className="w-full h-auto" />
              <p className="text-center text-xs py-2 bg-white text-[#735B4D]">{s.alt}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-6 max-w-4xl mx-auto bg-white rounded-3xl my-8 mx-6 shadow-sm border border-[#00373E]/10 print:break-after-page">
        <h2 className="text-xl font-black text-[#00373E] mb-6 border-b border-[#D4A017] pb-3">أطراف المذكرة</h2>
        <p className="text-sm text-[#735B4D] mb-6">
          فقد تم الاتفاق بين كل من (ويشار إليهم مجتمعين بـ «الشركاء» أو «الأطراف»):
        </p>
        <div className="space-y-4">
          {draft.parties.map((p) => (
            <div key={p.id} className="p-4 rounded-xl bg-[#F5F5F5] border-r-4 border-[#00373E]">
              <p className="font-bold text-[#00373E]">الأستاذ/ {p.name || '________'} — {p.role}</p>
              <p className="text-sm text-[#735B4D] mt-1">
                {p.idLabel}: {p.idNumber || '(................)'}
              </p>
              <p className="text-sm mt-3 text-[#8F786B]">التوقيع: ____________________</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 max-w-4xl mx-auto pb-16 space-y-8">
        {MOU_SECTIONS.map((sec, i) => (
          <article
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-[#00373E]/5 print:break-inside-avoid"
          >
            <h3 className="text-lg font-black text-[#00373E] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D4A017]" />
              {sec.title}
            </h3>
            <ul className="space-y-2 text-[#4D3B32] text-sm leading-relaxed">
              {sec.body.map((line, j) => (
                <li key={j}>{applyPartyNames(line, draft.parties)}</li>
              ))}
            </ul>
          </article>
        ))}

        <div
          id="mou-signature-block"
          className="bg-[#00373E] text-white rounded-2xl p-8 print:break-before-page"
        >
          <h3 className="text-xl font-black mb-6 text-center">التوقيع والاعتماد</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {draft.parties.map((p) => (
              <div key={p.id} className="border border-white/20 rounded-xl p-4 min-h-[120px]">
                <p className="font-bold">{p.name || '________'}</p>
                <p className="text-sm text-white/70">{p.role}</p>
                {p.idNumber && <p className="text-xs text-white/50 mt-1">{p.idLabel}: {p.idNumber}</p>}
                <p className="mt-6 text-white/50 text-sm">التوقيع: _______________</p>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-white/60 text-sm">التاريخ: {draft.date}</p>
        </div>
      </section>
    </div>
  );
}
