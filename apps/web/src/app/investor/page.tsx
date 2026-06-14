import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'حزمة المستثمر | مفصل',
  description: 'تحميل عرض المنصة ومذكرة التفاهم — منصة مفصل',
};

const DOWNLOADS = [
  {
    title: 'حزمة كاملة (ZIP)',
    desc: 'مذكرة PDF + لقطات المنصة + نص المذكرة',
    href: '/investor/MOFASAL-Investor-Package.zip',
    primary: true,
    size: '~0.5 MB',
  },
  {
    title: 'مذكرة التفاهم (PDF جاهز)',
    desc: 'غلاف براند + نص كامل — بدون طباعة المتصفح',
    href: '/investor/MOFASAL-MOU.pdf',
    primary: false,
    size: 'PDF',
  },
  {
    title: 'التوقيع الإلكتروني',
    desc: 'وقّع المذكرة وحمّل PDF موقّع بشهادة تحقق',
    href: '/investor/mou',
    primary: false,
    size: '4 شركاء',
    external: true,
  },
  {
    title: 'لقطات المنصة (PDF)',
    desc: '10 شاشات حية من mofasal.netlify.app',
    href: '/investor/MOFASAL-Investor-Deck.pdf',
    primary: false,
    size: '0.5 MB',
  },
];

export default function InvestorPage() {
  return (
    <main className="min-h-screen bg-[#00373E] text-white" dir="rtl">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/brand/pattern.pdf')] bg-repeat" />
      <div className="relative max-w-2xl mx-auto px-6 py-16 text-center space-y-8">
        <Image src="/images/logo.png" alt="مفصل" width={80} height={80} className="mx-auto rounded-xl" />
        <div>
          <p className="text-[#D4A017] text-sm font-semibold tracking-wide mb-2">MUFASAL INVESTOR PACKAGE</p>
          <h1 className="text-3xl font-black">حزمة المستثمر</h1>
          <p className="text-white/70 mt-3 text-sm leading-relaxed">
            عرض متكامل: المنصة الحية + مذكرة التفاهم + لقطات الشاشات — بقالب الهوية الرسمية لمفصل
          </p>
        </div>

        <div className="space-y-3 text-right">
          {DOWNLOADS.map((d) =>
            d.external ? (
              <Link
                key={d.href}
                href={d.href}
                className="block rounded-2xl border border-white/20 bg-white/5 p-5 hover:bg-white/10 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-bold text-lg">{d.title}</p>
                    <p className="text-white/60 text-sm mt-1">{d.desc}</p>
                  </div>
                  <span className="text-xs text-[#D4A017] whitespace-nowrap">{d.size}</span>
                </div>
              </Link>
            ) : (
              <a
                key={d.href}
                href={d.href}
                download
                className={`block rounded-2xl p-5 transition ${
                  d.primary
                    ? 'bg-[#D4A017] text-[#00373E] font-bold hover:opacity-90'
                    : 'border border-white/20 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className={`font-bold text-lg ${d.primary ? '' : ''}`}>{d.title}</p>
                    <p className={`text-sm mt-1 ${d.primary ? 'text-[#00373E]/70' : 'text-white/60'}`}>{d.desc}</p>
                  </div>
                  <span className={`text-xs whitespace-nowrap ${d.primary ? 'text-[#00373E]/60' : 'text-[#D4A017]'}`}>
                    {d.size}
                  </span>
                </div>
              </a>
            )
          )}
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-right text-sm text-white/70 space-y-2">
          <p className="font-bold text-[#D4A017]">توصية الخبير</p>
          <p>أرسل <strong className="text-white">الحزمة الكاملة ZIP</strong> للمستثمر — يشمل المذكرة والمنصة معاً.</p>
          <p>للاجتماعات: اعرض الموقع الحي أولاً ثم المذكرة كملحق قانوني.</p>
        </div>

        <Link href="/" className="text-sm text-white/50 hover:text-white">
          العودة للموقع الرئيسي
        </Link>
      </div>
    </main>
  );
}
