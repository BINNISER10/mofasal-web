import Link from 'next/link';
import { MouDocument } from '@/components/investor/MouDocument';
import { MouSignPanel } from '@/components/investor/MouSignPanel';

export const metadata = {
  title: 'مذكرة تفاهم | مفصل',
  description: 'مذكرة تفاهم شركاء منصة مفصل — شركة عرين التقنية',
};

export default function MouPage() {
  return (
    <>
      <MouDocument mode="screen" />
      <MouSignPanel />
      <footer className="print:hidden sticky bottom-0 bg-white/90 backdrop-blur border-t border-[#00373E]/10 p-4 flex flex-wrap gap-3 justify-center">
        <a
          href="/investor/MOFASAL-MOU.pdf"
          download
          className="px-6 py-3 rounded-xl bg-[#00373E] text-white font-bold text-sm hover:opacity-90 transition"
        >
          تحميل PDF جاهز
        </a>
        <Link
          href="/investor"
          className="px-6 py-3 rounded-xl border border-[#00373E] text-[#00373E] font-bold text-sm"
        >
          حزمة المستثمر
        </Link>
      </footer>
    </>
  );
}
