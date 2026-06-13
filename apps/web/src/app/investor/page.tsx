import Link from 'next/link';

export const metadata = {
  title: 'عرض المستثمر | مفصل',
  description: 'تحميل عرض شاشات منصة مفصل للمستثمرين',
};

export default function InvestorPage() {
  return (
    <main className="min-h-screen bg-[#00373E] text-white flex items-center justify-center p-6" dir="rtl">
      <div className="max-w-lg w-full rounded-3xl bg-white/10 backdrop-blur border border-white/20 p-8 text-center space-y-6">
        <h1 className="text-3xl font-black">مفصل — عرض المستثمر</h1>
        <p className="text-white/80 text-sm leading-relaxed">
          ملف PDF يضم 10 شاشات من المنصة الحية: الرئيسية، السوق، لوحات التحكم، ومعالج الطلبات.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/investor/MOFASAL-Investor-Deck.pdf"
            download
            className="block w-full rounded-2xl bg-[#D4AF37] text-[#00373E] font-bold py-4 hover:opacity-90 transition"
          >
            تحميل PDF (0.5 MB)
          </a>
          <a
            href="/investor/MOFASAL-Investor-Deck.zip"
            download
            className="block w-full rounded-2xl border border-white/30 font-bold py-4 hover:bg-white/10 transition"
          >
            تحميل ZIP مضغوط
          </a>
        </div>
        <Link href="/" className="text-sm text-white/60 hover:text-white">
          العودة للموقع
        </Link>
      </div>
    </main>
  );
}
