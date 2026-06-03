'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/lib/stores/appStore';
import {
  Scissors,
  Ruler,
  Smartphone,
  CheckCircle2,
  Truck,
  Store,
  Users,
  ShoppingBag,
  Star,
  Package,
  Sparkles,
  ShieldCheck,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Quote,
  Zap,
  Award,
  Clock,
  ChevronRight,
} from 'lucide-react';

const testimonials = [
  {
    nameAr: 'محمد العتيبي',
    nameEn: 'Mohammed Al-Otaibi',
    roleAr: 'عميل — الرياض',
    roleEn: 'Customer — Riyadh',
    textAr: 'تجربة استثنائية! المندوب جاء للمنزل وأخذ المقاسات بدقة عالية. البدلة خرجت أحسن من توقعاتي.',
    textEn: 'Exceptional experience! The representative came home and took precise measurements. The suit exceeded my expectations.',
    rating: 5,
    avatar: 'م',
  },
  {
    nameAr: 'سارة الشمري',
    nameEn: 'Sara Al-Shammari',
    roleAr: 'عميلة — جدة',
    roleEn: 'Customer — Jeddah',
    textAr: 'منصة رائعة! أخيراً حل عصري لمشكلة الخياطة. التتبع اللحظي جعل الانتظار ممتعاً والتوصيل كان في الوقت المحدد.',
    textEn: 'Amazing platform! Finally a modern solution for tailoring. Real-time tracking made waiting enjoyable.',
    rating: 5,
    avatar: 'س',
  },
  {
    nameAr: 'فيصل الدوسري',
    nameEn: 'Faisal Al-Dosari',
    roleAr: 'عميل — الدمام',
    roleEn: 'Customer — Dammam',
    textAr: 'اشتريت القماش من السوق وأرسلته للخياط عبر المنصة. العملية كانت سلسة جداً والنتيجة ممتازة.',
    textEn: 'Bought fabric from the marketplace and sent it to the tailor through the platform. Very smooth process.',
    rating: 5,
    avatar: 'ف',
  },
];

const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الخبر', 'أبها', 'تبوك', 'القصيم', 'حائل'];

const fashionModels = [
  { titleAr: 'الثوب الكلاسيكي', titleEn: 'Classic Thobe', tagAr: 'تميز بأصالتك', tagEn: 'Heritage Style', h: 'h-[420px]', grad: 'from-[#00373E] via-[#00565f] to-[#001a1d]', img: '' },
  { titleAr: 'أناقة الشماغ', titleEn: 'Shemagh Elegance', tagAr: 'هوية خليجية', tagEn: 'Gulf Identity', h: 'h-[300px]', grad: 'from-[#481719] via-[#6b2022] to-[#1a0305]', img: '' },
  { titleAr: 'البساطة الراقية', titleEn: 'Refined Simplicity', tagAr: 'فخامة في البساطة', tagEn: 'Luxe Minimal', h: 'h-[360px]', grad: 'from-[#735B4D] via-[#8a6e5e] to-[#2a1f18]', img: '' },
  { titleAr: 'ليلة الفخامة', titleEn: 'Luxury Night', tagAr: 'إطلالة مميزة', tagEn: 'Statement Look', h: 'h-[340px]', grad: 'from-[#0a0a0a] via-[#1a1205] to-[#2d2000]', img: '' },
  { titleAr: 'البشت الملكي', titleEn: 'Royal Bisht', tagAr: 'شموخ وكبرياء', tagEn: 'Regal Pride', h: 'h-[400px]', grad: 'from-[#2d1f00] via-[#4a3500] to-[#1a0a00]', img: '' },
  { titleAr: 'لحظة الرقي', titleEn: 'Elegant Moment', tagAr: 'تفاصيل لا تُنسى', tagEn: 'Unforgettable Details', h: 'h-[280px]', grad: 'from-[#00373E] via-[#003030] to-[#000d0e]', img: '' },
  { titleAr: 'هيبة الكبار', titleEn: 'Distinguished Elegance', tagAr: 'وقار يتحدث', tagEn: 'Quiet Authority', h: 'h-[320px]', grad: 'from-[#1a1a2e] via-[#16213e] to-[#0a0a18]', img: '' },
  { titleAr: 'روح الوطن', titleEn: 'Homeland Spirit', tagAr: 'فخر الانتماء', tagEn: 'Pride of Identity', h: 'h-[380px]', grad: 'from-[#006b3c] via-[#004d2b] to-[#001a0e]', img: '' },
  { titleAr: 'جيل الطموح', titleEn: 'Generation Aspire', tagAr: 'شباب بنكهة أصيلة', tagEn: 'Youth & Heritage', h: 'h-[300px]', grad: 'from-[#481719] via-[#2d0e10] to-[#0a0304]', img: '' },
  { titleAr: 'التميز المعاصر', titleEn: 'Contemporary Excellence', tagAr: 'عصري بلمسة كلاسيك', tagEn: 'Modern Classic', h: 'h-[350px]', grad: 'from-[#735B4D] via-[#4a3020] to-[#1a0a00]', img: '' },
  { titleAr: 'الخياطة الملكية', titleEn: 'Royal Tailoring', tagAr: 'دقة في كل خيط', tagEn: 'Precision in Every Stitch', h: 'h-[320px]', grad: 'from-[#1a0a2e] via-[#2d1460] to-[#0a0518]', img: '' },
  { titleAr: 'أناقة المجلس', titleEn: 'Majlis Elegance', tagAr: 'حضور يملأ المكان', tagEn: 'A Presence That Fills the Room', h: 'h-[400px]', grad: 'from-[#0d1117] via-[#1a2332] to-[#0a0e18]', img: '' },
  { titleAr: 'القماش الفاخر', titleEn: 'Luxury Fabric', tagAr: 'أجود الأقمشة العالمية', tagEn: 'World\'s Finest Fabrics', h: 'h-[280px]', grad: 'from-[#2d0a00] via-[#5a1a05] to-[#1a0500]', img: '' },
  { titleAr: 'لمسة الخياط', titleEn: 'The Tailor\'s Touch', tagAr: 'فن التفصيل الأصيل', tagEn: 'The Art of Fine Tailoring', h: 'h-[360px]', grad: 'from-[#003322] via-[#005538] to-[#001a12]', img: '' },
  { titleAr: 'الثوب المطرز', titleEn: 'Embroidered Thobe', tagAr: 'زخارف تراثية أصيلة', tagEn: 'Authentic Heritage Patterns', h: 'h-[420px]', grad: 'from-[#1a1500] via-[#332a00] to-[#0a0800]', img: '' },
  { titleAr: 'الكلاسيك الجديد', titleEn: 'New Classic', tagAr: 'تراث يواكب العصر', tagEn: 'Heritage Meets Modernity', h: 'h-[300px]', grad: 'from-[#001a2e] via-[#003355] to-[#000d18]', img: '' },
  { titleAr: 'وقار الرجال', titleEn: 'Men\'s Dignity', tagAr: 'الأناقة هوية', tagEn: 'Elegance is Identity', h: 'h-[340px]', grad: 'from-[#1a0a00] via-[#3d2200] to-[#0a0500]', img: '' },
  { titleAr: 'الفصال الاحترافي', titleEn: 'Professional Cut', tagAr: 'قياس مثالي لكل جسم', tagEn: 'Perfect Fit for Every Body', h: 'h-[380px]', grad: 'from-[#0a1a0a] via-[#1a3318] to-[#050d05]', img: '' },
  { titleAr: 'ليالي الرياض', titleEn: 'Riyadh Nights', tagAr: 'أناقة لا تغيب', tagEn: 'Timeless Elegance', h: 'h-[310px]', grad: 'from-[#1a0018] via-[#330033] to-[#0a000a]', img: '' },
  { titleAr: 'مفصل بعناية', titleEn: 'Crafted with Care', tagAr: 'كل تفصيل قصة', tagEn: 'Every Detail Tells a Story', h: 'h-[390px]', grad: 'from-[#00181a] via-[#003035] to-[#000a0b]', img: '' },
];

export default function HomePage() {
  const { isRTL } = useAppStore();
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev: number) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { icon: <Store size={24} />, value: '500+', labelAr: 'متجر خياطة', labelEn: 'Tailor Shops' },
    { icon: <ShoppingBag size={24} />, value: '50,000+', labelAr: 'طلب مكتمل', labelEn: 'Orders Completed' },
    { icon: <Package size={24} />, value: '10,000+', labelAr: 'نوع قماش', labelEn: 'Fabric Types' },
    { icon: <Users size={24} />, value: '1,000+', labelAr: 'خياط محترف', labelEn: 'Professional Tailors' },
  ];

  const features = [
    {
      icon: <Ruler size={32} />,
      titleAr: 'قياس في الموقع',
      titleEn: 'On-Site Measurement',
      descAr: 'فني متخصص يأتي إليك لأخذ المقاسات بدقة في منزلك أو مكتبك أو أي مكان تختاره',
      descEn: 'Professional technician visits your location for precise measurements',
    },
    {
      icon: <Smartphone size={32} />,
      titleAr: 'تأكيد رقمي',
      titleEn: 'Digital Confirmation',
      descAr: 'شاهد تفاصيل مقاسك واختيارات القماش والسعر النهائي ووافق رقمياً قبل بدء الإنتاج',
      descEn: 'Review measurements, fabric choices and final price, approve digitally before production',
    },
    {
      icon: <Truck size={32} />,
      titleAr: 'تتبع تفاعلي',
      titleEn: 'Interactive Tracking',
      descAr: 'تتبع طلبك خطوة بخطوة مع رسوم متحركة من أخذ المقاسات حتى التوصيل لباب منزلك',
      descEn: 'Track every step with animations from measurements to your doorstep',
    },
    {
      icon: <Store size={32} />,
      titleAr: 'سوق الأقمشة',
      titleEn: 'Fabric Marketplace',
      descAr: 'تصفح واشترِ أجود أنواع الأقمشة والإكسسوارات من تجار موثوقين بأسعار تنافسية',
      descEn: 'Browse premium fabrics and accessories from trusted merchants at competitive prices',
    },
  ];

  const steps = [
    {
      step: '01',
      icon: <Ruler size={28} />,
      titleAr: 'اختر الخياط وحدد المقاسات',
      titleEn: 'Choose Tailor & Measurements',
      descAr: 'تصفح متاجر الخياطة الموثوقة، اختر ما يناسبك، وحدد موعد لأخذ المقاسات في موقعك',
      descEn: 'Browse trusted tailor shops, pick your style, and schedule on-site measurements',
    },
    {
      step: '02',
      icon: <Scissors size={28} />,
      titleAr: 'اختر القماش وأكد الطلب',
      titleEn: 'Choose Fabric & Confirm',
      descAr: 'اختر القماش المفضل من متجر الأقمشة أو استخدم قماشك الخاص، وأكد الطلب رقمياً',
      descEn: 'Pick your preferred fabric from the marketplace or use your own, confirm digitally',
    },
    {
      step: '03',
      icon: <CheckCircle2 size={28} />,
      titleAr: 'تابع واستلم',
      titleEn: 'Track & Receive',
      descAr: 'تابع مراحل الخياطة خطوة بخطوة مع تحديثات لحظية واستلم طلبك أينما كنت',
      descEn: 'Track tailoring progress in real-time and receive your order anywhere',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Video Background */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="/videos/fashion.mp4" type="video/mp4" />
        </video>
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/96 via-primary-900/80 to-primary-800/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-transparent to-primary-900/50" />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full bg-gold-400 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-64 h-64 rounded-full bg-accent-300 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-28 md:py-36 grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cream-300 px-4 py-2 rounded-full text-sm mb-6 border border-cream-400/20">
              <Sparkles size={13} className="text-gold-400" />
              <span>{isRTL ? '🇸🇦 منصة الخياطة الرقمية الأولى في السعودية' : "🇸🇦 Saudi Arabia's #1 Digital Tailoring Platform"}</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
              {isRTL ? (
                <>خياطة راقية<br /><span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-300 to-amber-400">تبدأ من هنا</span></>
              ) : (
                <>Premium<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">Tailoring</span></>
              )}
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
              {isRTL
                ? 'اجمع بين أفضل الخياطين وأجود الأقمشة في منصة واحدة. تفصيل راقٍ يصل إلى باب منزلك.'
                : 'Connect with the best tailors and finest fabrics in one platform. Premium tailoring delivered to your door.'}
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/shops">
                <Button variant="gold" size="lg">
                  {isRTL ? 'ابحث عن خياط' : 'Find a Tailor'}
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 hover:text-white">
                  {isRTL ? 'تصفح الأقمشة' : 'Browse Fabrics'}
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-5">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {['م','أ','ف','س'].map((letter, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white/50 bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-bold text-sm">+10,000 {isRTL ? 'عميل سعيد' : 'Happy Customers'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />)}
                  <span className="text-white/60 text-xs mr-1">4.9/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Floating cards */}
          <div className="relative hidden md:block h-[420px]">
            {/* Card 1: Live order */}
            <div className="absolute top-0 right-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-56 shadow-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{isRTL ? 'طلب جديد' : 'New Order'}</p>
                  <p className="text-white/50 text-xs">{isRTL ? 'قبل دقيقتين' : '2 min ago'}</p>
                </div>
              </div>
              <p className="text-white/80 text-xs">{isRTL ? 'بدلة رسمية — الرياض' : 'Formal Suit — Riyadh'}</p>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
              </div>
            </div>

            {/* Card 2: Stats */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 w-48 shadow-2xl">
              <Zap size={20} className="text-yellow-400 mb-2" />
              <p className="text-3xl font-black text-white">500+</p>
              <p className="text-white/60 text-xs">{isRTL ? 'خياط موثوق' : 'Verified Tailors'}</p>
            </div>

            {/* Card 3: Rating */}
            <div className="absolute bottom-0 right-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 w-52 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Award size={18} className="text-amber-400" />
                <p className="text-white text-sm font-semibold">{isRTL ? 'تقييم الخياط' : 'Tailor Rating'}</p>
              </div>
              <div className="flex items-center gap-1 mb-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-white/60 text-xs">{isRTL ? 'خياط أحمد السيد' : 'Ahmad Al-Sayed'}</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--surface)] to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="glass-teal p-6 text-center group hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-300 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <p className="text-3xl font-black text-primary-700 dark:text-primary-200">{stat.value}</p>
                <p className="text-sm text-accent-500 dark:text-accent-300 mt-1">
                  {isRTL ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ Fashion Lookbook ══════════ */}
      <section className="py-20 overflow-hidden" style={{ background: 'linear-gradient(180deg,#060d0e 0%,#001a1d 50%,#060d0e 100%)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gold-400 text-xs font-semibold tracking-[0.4em] uppercase mb-3">✦ LOOKBOOK 2025 ✦</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3">
              {isRTL ? 'أناقة السعودي' : 'Saudi Elegance'}
            </h2>
            <p className="text-gray-400 text-lg">
              {isRTL ? 'تفصيل راقٍ يعكس الهوية الأصيلة' : 'Premium tailoring that reflects authentic identity'}
            </p>
          </div>

          {/* Masonry Gallery */}
          <div className="[column-count:2] md:[column-count:4] [column-gap:12px]">
            {fashionModels.map((model, i) => (
              <div key={i} className="mb-3 break-inside-avoid">
                <div className={`relative overflow-hidden rounded-2xl group cursor-pointer ${model.h}`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${model.grad}`} />
                  {/* Decorative pattern */}
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage:'repeating-linear-gradient(45deg,#ffffff11 0,#ffffff11 1px,transparent 0,transparent 50%)',backgroundSize:'20px 20px'}} />
                  {/* Photo */}
                  <img
                    src={`/images/fashion/model-${i + 1}.jpg`}
                    alt={model.titleAr}
                    className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/60 text-xs font-bold">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-gold-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                      {isRTL ? 'اطلب الآن' : 'Order Now'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-black text-sm">{isRTL ? model.titleAr : model.titleEn}</p>
                    <p className="text-gold-400 text-xs mt-0.5">{isRTL ? model.tagAr : model.tagEn}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/shops">
              <button className="inline-flex items-center gap-2 border border-gold-400/50 text-gold-400 hover:bg-gold-400 hover:text-gray-900 font-semibold px-8 py-3.5 rounded-2xl transition-all duration-300">
                <Sparkles size={18} />
                {isRTL ? 'تصفح جميع التصاميم' : 'Browse All Designs'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-cream-100 dark:from-primary-950/50 dark:via-slate-900 dark:to-slate-900" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass-teal text-primary-700 dark:text-primary-300 text-xs font-semibold mb-3">
              {isRTL ? '✦ خطوات بسيطة' : '✦ Simple Steps'}
            </span>
            <h2 className="section-title">{isRTL ? 'كيف يعمل مفصل؟' : 'How MUFASAL Works'}</h2>
            <p className="section-subtitle">
              {isRTL ? 'ثلاث خطوات بسيطة للحصول على طلبك المثالي' : 'Three simple steps to your perfect fit'}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 right-[16.5%] left-[16.5%] h-0.5 bg-gradient-to-l from-primary-200 via-accent-200 to-primary-200 dark:from-primary-800 dark:via-accent-700 dark:to-primary-800" />
            {steps.map((step, i) => (
              <div key={i} className="glass group relative text-center pt-14 pb-8 px-6 hover:border-primary-300/40 dark:hover:border-primary-500/30">
                <div className="absolute -top-7 right-1/2 translate-x-1/2 w-14 h-14 rounded-2xl bg-gradient-primary shadow-lg shadow-primary-500/30 flex items-center justify-center text-white font-black text-lg glow-teal">
                  {step.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-accent-100/60 dark:bg-accent-900/30 text-accent-600 dark:text-accent-300 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {isRTL ? step.titleAr : step.titleEn}
                </h3>
                <p className="text-sm text-accent-500 dark:text-accent-300 leading-relaxed">
                  {isRTL ? step.descAr : step.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-700 via-primary-600 to-primary-800 dark:from-primary-950 dark:via-slate-900 dark:to-primary-950" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-accent-400 blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-gold-400 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass text-white/80 text-xs font-semibold mb-3 border-white/20">
              {isRTL ? '✦ لماذا مفصل؟' : '✦ Why MUFASAL?'}
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-2">{isRTL ? 'مميزات المنصة' : 'Platform Features'}</h2>
            <p className="text-lg text-white/60">{isRTL ? 'كل ما تحتاجه في مكان واحد' : 'Everything you need in one place'}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <div key={i} className="glass flex items-start gap-5 p-6 border-white/15 hover:border-white/30 group">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center flex-shrink-0 group-hover:bg-gold-500/20 group-hover:border-gold-400/40 transition-all">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1.5">
                    {isRTL ? feature.titleAr : feature.titleEn}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {isRTL ? feature.descAr : feature.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-50 to-white dark:from-slate-900 dark:to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="section-title">{isRTL ? 'لماذا يثق بنا الآلاف؟' : 'Why Thousands Trust Us'}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <ShieldCheck size={36} />, color: 'teal', titleAr: 'جودة مضمونة', titleEn: 'Guaranteed Quality', descAr: 'نظام تقييم ثلاثي: المحل، الخياط، والمندوب. نضمن لك أفضل جودة.', descEn: 'Triple rating system: shop, tailor, and representative. Quality assured.' },
              { icon: <MapPin size={36} />, color: 'gold', titleAr: 'توصيل أينما كنت', titleEn: 'Delivery Anywhere', descAr: 'نوصل طلبك أينما كنت في المملكة. اختر وقت ومكان التوصيل.', descEn: 'We deliver anywhere in the kingdom. Choose your preferred delivery time.' },
              { icon: <Sparkles size={36} />, color: 'red', titleAr: 'تفصيل حسب الطلب', titleEn: 'Custom Tailoring', descAr: 'كل قطعة تفصل خصيصاً لك حسب مقاساتك وذوقك. فقط تفصيل راقي.', descEn: 'Every piece tailored to your exact measurements and taste. Premium only.' },
            ].map((item, i) => (
              <div key={i} className={`text-center p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
                item.color === 'teal' ? 'glass-teal hover:shadow-xl hover:shadow-primary-500/10' :
                item.color === 'gold' ? 'glass-gold hover:shadow-xl hover:shadow-gold-500/15' :
                'bg-secondary-50/60 dark:bg-secondary-950/30 border-secondary-100 dark:border-secondary-900/40 hover:shadow-xl hover:shadow-secondary-500/10'
              }`}>
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 ${
                  item.color === 'teal' ? 'bg-primary-100/80 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300' :
                  item.color === 'gold' ? 'bg-gold-100/80 dark:bg-gold-900/30 text-gold-600 dark:text-gold-300' :
                  'bg-secondary-100/80 dark:bg-secondary-900/40 text-secondary-600 dark:text-secondary-300'
                }`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {isRTL ? item.titleAr : item.titleEn}
                </h3>
                <p className="text-accent-500 dark:text-accent-300 text-sm leading-relaxed">
                  {isRTL ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Coverage */}
      <section className="py-10 bg-primary-50 dark:bg-primary-900/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm text-accent-500 mb-4 font-medium">
            {isRTL ? 'نغطي أكثر من 10 مدن في المملكة' : 'Covering 10+ cities across Saudi Arabia'}
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {cities.map((city, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-primary-100 dark:border-slate-700 text-primary-700 dark:text-primary-300 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
                <MapPin size={12} />
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">{isRTL ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}</h2>
            <p className="section-subtitle">{isRTL ? 'آراء حقيقية من عملاء موثوقين' : 'Real reviews from verified customers'}</p>
          </div>

          {/* Testimonial Card */}
          <div className="relative">
            <div className="card-mufasal p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-6 right-8 text-primary-100 dark:text-primary-900">
                <Quote size={64} />
              </div>
              <div className="relative z-10">
                {/* Stars */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                {/* Text */}
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 font-medium">
                  &ldquo;{isRTL ? testimonials[activeTestimonial].textAr : testimonials[activeTestimonial].textEn}&rdquo;
                </p>
                {/* Avatar */}
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {isRTL ? testimonials[activeTestimonial].nameAr : testimonials[activeTestimonial].nameEn}
                    </p>
                    <p className="text-sm text-accent-500">
                      {isRTL ? testimonials[activeTestimonial].roleAr : testimonials[activeTestimonial].roleEn}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-8 bg-primary-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>

            {/* Prev/Next */}
            <button
              onClick={() => setActiveTestimonial((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
              className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-50 transition-colors"
            >
              {isRTL ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
            </button>
            <button
              onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)}
              className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-50 transition-colors"
            >
              {isRTL ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-900 dark:via-primary-800 dark:to-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-1.5 rounded-full text-sm mb-4">
            <Clock size={14} />
            <span>{isRTL ? 'التوصيل خلال ٧-١٤ يوم' : 'Delivery in 7-14 days'}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            {isRTL ? 'ابدأ طلبك الآن' : 'Start Your Order Today'}
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'انضم لآلاف العملاء الراضين. الخياطة الراقية لم تكن بهذه السهولة من قبل.'
              : 'Join thousands of satisfied customers. Premium tailoring has never been this easy.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/login">
              <button className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                <Scissors size={18} />
                {isRTL ? 'ابدأ طلبك الآن' : 'Start Your Order'}
                {isRTL ? <ArrowLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </Link>
            <Link href="/shops">
              <button className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
                {isRTL ? 'تصفح المتاجر' : 'Browse Shops'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent-300 blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            {isRTL ? 'حمل تطبيق مفصل الآن' : 'Download MUFASAL App Now'}
          </h2>
          <p className="text-lg text-surface-200 mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'جرب أسهل طريقة لطلب الخياطة الراقية. متوفر على أجهزة آيفون وأندرويد.'
              : 'Experience the easiest way to order premium tailoring. Available on iOS and Android.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-cream-100 transition-colors shadow-lg">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              App Store
            </button>
            <button className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-cream-100 transition-colors shadow-lg">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
              Google Play
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
