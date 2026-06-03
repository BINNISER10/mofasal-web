'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { shopsApi } from '@/lib/api/shops';
import {
  Star, MapPin, Clock, Phone, CheckCircle2, ArrowRight, ArrowLeft,
  Scissors, Ruler, Package, MessageCircle, Heart, Share2, ChevronLeft,
  ChevronRight, Users, Award, TrendingUp, ShoppingBag
} from 'lucide-react';

const mockShops: Record<string, any> = {
  '1': {
    id: '1', name: 'خياطة الرجال الراقية', nameEn: 'Premium Menswear',
    owner: 'خالد العمر', ownerEn: 'Khalid Al-Omar',
    avatar: null, coverImage: null,
    city: 'الرياض', district: 'حي الورود', cityEn: 'Riyadh',
    phone: '+966 55 123 4567',
    rating: 4.8, reviewCount: 324, orders: 1256,
    experience: 12, verified: true, featured: true,
    description: 'متخصصون في الخياطة الرجالية الراقية منذ أكثر من 12 عاماً. نقدم خدمات التفصيل للبدل الرسمية والمشالح والثياب التقليدية بأعلى جودة وأدق المقاسات.',
    descriptionEn: 'Specialized in premium menswear tailoring for over 12 years. We offer suits, thobes, and traditional garments with the highest quality.',
    workingHours: { from: '9:00', to: '22:00', days: 'السبت - الخميس' },
    specialties: ['بدل رسمية', 'مشالح', 'أثواب', 'بشوت', 'يونيفورم'],
    services: [
      { id: '1', name: 'بدلة رسمية', nameEn: 'Formal Suit', price: 1200, duration: '7 أيام', icon: '👔', popular: true },
      { id: '2', name: 'مشلح فاخر', nameEn: 'Bisht', price: 800, duration: '5 أيام', icon: '🥻', popular: false },
      { id: '3', name: 'ثوب قياس', nameEn: 'Custom Thobe', price: 350, duration: '3 أيام', icon: '👘', popular: true },
      { id: '4', name: 'بدلة رياضية', nameEn: 'Sports Suit', price: 650, duration: '5 أيام', icon: '🎽', popular: false },
      { id: '5', name: 'يونيفورم شركات', nameEn: 'Corporate Uniform', price: 420, duration: '5 أيام', icon: '👕', popular: false },
    ],
    reviews: [
      { id: '1', name: 'أحمد محمد', rating: 5, comment: 'خياطة ممتازة وجودة عالية جداً. الثوب جاء بالمقاس الصحيح تماماً.', date: '2024-03-10' },
      { id: '2', name: 'فيصل الحربي', rating: 5, comment: 'تعاملت معهم عدة مرات والنتيجة دائماً مميزة. سرعة في التنفيذ.', date: '2024-03-05' },
      { id: '3', name: 'محمد العنزي', rating: 4, comment: 'خدمة جيدة والعمل نظيف. التوصيل كان سريع.', date: '2024-02-28' },
    ],
    portfolio: [
      { label: 'بدلة رسمية زرقاء', color: '#1e3a5f' },
      { label: 'مشلح ذهبي', color: '#c9a84c' },
      { label: 'ثوب أبيض', color: '#f5f0e8' },
      { label: 'بدلة رمادية', color: '#5a5a6e' },
    ],
    stats: { completionRate: 98, onTimeDelivery: 95, repeatCustomers: 72 },
  },
  '2': {
    id: '2', name: 'ثياب الأطفال', nameEn: "Kids Thobes",
    owner: 'فهد أحمد', ownerEn: 'Fahad Ahmed',
    city: 'جدة', district: 'حي الروضة', cityEn: 'Jeddah',
    phone: '+966 54 987 6543',
    rating: 4.5, reviewCount: 210, orders: 892,
    experience: 8, verified: true, featured: false,
    description: 'متخصصون في تفصيل ثياب الأطفال السعودية وبدل الأولاد للمناسبات. تصاميم عصرية وراقية بأدق المقاسات.',
    descriptionEn: 'Specialized in boys\' thobes and occasion suits.',
    workingHours: { from: '10:00', to: '21:00', days: 'السبت - الخميس' },
    specialties: ['ثياب أطفال', 'بدل أولاد', 'بشوت أطفال', 'ملابس تقليدية'],
    services: [
      { id: '1', name: 'ثوب أطفال', nameEn: 'Kids Thobe', price: 280, duration: '3 أيام', icon: '�', popular: true },
      { id: '2', name: 'بدلة طفل', nameEn: 'Boy\'s Suit', price: 320, duration: '3 أيام', icon: '👔', popular: false },
      { id: '3', name: 'بشت أطفال', nameEn: 'Kids Bisht', price: 650, duration: '5 أيام', icon: '🧥', popular: true },
    ],
    reviews: [
      { id: '1', name: 'سعد القحطاني', rating: 5, comment: 'ماشاء الله عمل رائع للأطفال. الخياطة دقيقة والخامة ممتازة.', date: '2024-03-12' },
      { id: '2', name: 'فيصل العتيبي', rating: 4, comment: 'ثوب ابني جاء جميل جداً بالمقاس المطلوب.', date: '2024-03-01' },
    ],
    portfolio: [
      { label: 'ثوب أبيض', color: '#f0ece0' },
      { label: 'بدلة كحلي', color: '#2c3e50' },
      { label: 'ثوب بيج', color: '#d2b48c' },
      { label: 'بدلة زرقاء', color: '#90caf9' },
    ],
    stats: { completionRate: 96, onTimeDelivery: 91, repeatCustomers: 65 },
  },
};

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'portfolio'>('services');
  const [liked, setLiked] = useState(false);

  const shopId = String(params.id);
  const fallback = mockShops[shopId] ?? mockShops['1'];
  const [shop, setShop] = useState<any>(fallback);

  useEffect(() => {
    let active = true;
    shopsApi.getById(shopId)
      .then((res) => {
        if (!active) return;
        const api: any = res.shop;
        if (!api || !api.id) return;
        const services = Array.isArray(api.shopServices) && api.shopServices.length
          ? api.shopServices.map((s: any, i: number) => ({
              id: s.id || String(i + 1),
              name: s.nameAr || s.name || s.serviceType || 'خدمة',
              nameEn: s.nameEn || s.name || 'Service',
              price: s.price ?? 0,
              duration: s.duration ? `${s.duration} ${isRTL ? 'أيام' : 'days'}` : '—',
              icon: s.serviceType === 'TAILORING' ? '👘' : '🧵',
              popular: Boolean(s.isPopular || i === 0),
            }))
          : fallback.services;
        setShop({
          ...fallback,
          id: api.id,
          name: api.nameAr || api.name || fallback.name,
          owner: api.ownerName || fallback.owner,
          city: api.city || fallback.city,
          district: api.region || api.district || fallback.district,
          phone: api.phone || fallback.phone,
          rating: api.rating ?? fallback.rating,
          reviewCount: api.reviewCount ?? fallback.reviewCount,
          orders: api.orderCount ?? fallback.orders,
          verified: api.isVerified ?? fallback.verified,
          featured: api.subscriptionPlan === 'PREMIUM' || fallback.featured,
          description: api.description || fallback.description,
          services,
        });
      })
      .catch(() => { /* الإبقاء على القالب الاحتياطي عند فشل الاتصال */ });
    return () => { active = false; };
  }, [shopId]);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;
  const ChevronBack = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Cover / Hero */}
      <div className="relative h-56 md:h-72 bg-gradient-to-br from-primary-700 to-primary-900 mt-16">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-10 w-64 h-32 rounded-full bg-gold-400 blur-3xl" />
        </div>
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 flex items-center gap-1 bg-black/30 hover:bg-black/50 text-white px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
        >
          <ChevronBack size={16} />
          {isRTL ? 'رجوع' : 'Back'}
        </button>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-10 pb-16">
        {/* Shop Header Card */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-24 h-24 rounded-3xl bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 flex-shrink-0">
              <Scissors size={36} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-black text-gray-900">{shop.name}</h1>
                    {shop.verified && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 size={12} className="mr-1" />
                        {isRTL ? 'موثق' : 'Verified'}
                      </Badge>
                    )}
                    {shop.featured && <Badge variant="gold" size="sm">{isRTL ? 'مميز' : 'Featured'}</Badge>}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{shop.owner}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={14} />{shop.city}، {shop.district}</span>
                    <span className="flex items-center gap-1"><Clock size={14} />{shop.workingHours.from} - {shop.workingHours.to}</span>
                    <span className="flex items-center gap-1"><Award size={14} />{shop.experience} {isRTL ? 'سنوات خبرة' : 'yrs exp'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2.5 rounded-xl border transition-all ${liked ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-red-400'}`}
                  >
                    <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2.5 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 hover:text-primary-600 transition-all">
                    <Share2 size={18} />
                  </button>
                  <a href={`tel:${shop.phone}`} className="p-2.5 rounded-xl border bg-gray-50 border-gray-200 text-gray-400 hover:text-green-600 transition-all">
                    <Phone size={18} />
                  </a>
                </div>
              </div>

              {/* Rating + Stats Row */}
              <div className="flex flex-wrap items-center gap-5 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={16} className={i <= Math.round(shop.rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-800">{shop.rating}</span>
                  <span className="text-gray-400 text-sm">({shop.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <ShoppingBag size={14} />
                  <span>{shop.orders.toLocaleString()} {isRTL ? 'طلب' : 'orders'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <TrendingUp size={14} className="text-green-500" />
                  <span>{shop.stats.completionRate}% {isRTL ? 'إنجاز' : 'completion'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users size={14} className="text-primary-500" />
                  <span>{shop.stats.repeatCustomers}% {isRTL ? 'عملاء متكررون' : 'repeat'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <Card className="p-5">
              <h2 className="font-bold text-gray-800 mb-3">{isRTL ? 'عن المتجر' : 'About'}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{shop.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {shop.specialties.map((s: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold">{s}</span>
                ))}
              </div>
            </Card>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-4">
                {(['services', 'reviews', 'portfolio'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab === 'services' ? (isRTL ? 'الخدمات' : 'Services')
                      : tab === 'reviews' ? (isRTL ? 'التقييمات' : 'Reviews')
                      : (isRTL ? 'الأعمال' : 'Portfolio')}
                  </button>
                ))}
              </div>

              {activeTab === 'services' && (
                <div className="space-y-3">
                  {shop.services.map((service: any) => (
                    <Card key={service.id} className="p-4 flex items-center justify-between" hover>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl">
                          {service.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{service.name}</p>
                            {service.popular && <Badge variant="gold" size="sm">{isRTL ? 'الأكثر طلباً' : 'Popular'}</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock size={11} />{service.duration}</span>
                            <span className="flex items-center gap-1"><Ruler size={11} />{isRTL ? 'قياس في الموقع' : 'On-site measurement'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-left flex flex-col items-end gap-2">
                        <p className="font-black text-primary-700 text-lg">{service.price} {isRTL ? 'ر.س' : 'SAR'}</p>
                        <Button size="sm" variant="primary" onClick={() => router.push(`/dashboard/customer/orders/new?shop=${shop.id}&service=${service.id}`)}>
                          {isRTL ? 'اطلب الآن' : 'Order Now'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  {/* Rating Summary */}
                  <Card className="p-5">
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-5xl font-black text-gray-900">{shop.rating}</p>
                        <div className="flex justify-center mt-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} size={14} className={i <= Math.round(shop.rating) ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{shop.reviewCount} {isRTL ? 'تقييم' : 'reviews'}</p>
                      </div>
                      <div className="flex-1 space-y-2">
                        {[5,4,3,2,1].map(star => {
                          const pct = star === 5 ? 65 : star === 4 ? 22 : star === 3 ? 8 : star === 2 ? 3 : 2;
                          return (
                            <div key={star} className="flex items-center gap-2 text-xs">
                              <span className="text-gray-500 w-4">{star}</span>
                              <Star size={10} className="text-gold-400 fill-gold-400" />
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="bg-gold-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-gray-400 w-6">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                  {shop.reviews.map((review: any) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-gray-800">{review.name}</p>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <div className="flex mt-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={12} className={i <= review.rating ? 'text-gold-500 fill-gold-500' : 'text-gray-200 fill-gray-200'} />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'portfolio' && (
                <div className="grid grid-cols-2 gap-3">
                  {shop.portfolio.map((item: any, i: number) => (
                    <Card key={i} className="overflow-hidden" hover>
                      <div className="h-36 flex items-end p-3" style={{ background: `linear-gradient(135deg, ${item.color}40, ${item.color}90)` }}>
                        <div className="w-full">
                          <span className="text-xs font-semibold text-white bg-black/30 px-2 py-1 rounded-lg">{item.label}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Book CTA */}
            <Card className="p-5 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <h3 className="font-bold text-lg mb-2">{isRTL ? 'احجز موعدك الآن' : 'Book Your Appointment'}</h3>
              <p className="text-primary-200 text-sm mb-4">{isRTL ? 'ابدأ طلبك مع هذا المتجر في خطوات بسيطة' : 'Start your order with this shop in simple steps'}</p>
              <Button
                variant="gold"
                fullWidth
                icon={<ArrowIcon size={16} />}
                onClick={() => router.push(`/dashboard/customer/orders/new?shop=${shop.id}`)}
              >
                {isRTL ? 'إنشاء طلب' : 'Create Order'}
              </Button>
              <button
                onClick={() => router.push('/login')}
                className="flex items-center justify-center gap-1.5 w-full mt-2 py-2 text-sm text-primary-200 hover:text-white transition-colors"
              >
                <MessageCircle size={14} />
                {isRTL ? 'تواصل مع المتجر' : 'Chat with Shop'}
              </button>
            </Card>

            {/* Working Hours */}
            <Card className="p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock size={16} className="text-primary-600" />
                {isRTL ? 'ساعات العمل' : 'Working Hours'}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{shop.workingHours.days}</span>
                  <span className="font-semibold text-gray-800">{shop.workingHours.from} - {shop.workingHours.to}</span>
                </div>
                <div className="flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {isRTL ? 'مفتوح الآن' : 'Open Now'}
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-5">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" />
                {isRTL ? 'الموقع' : 'Location'}
              </h3>
              <p className="text-sm text-gray-600">{shop.city}، {shop.district}</p>
              <div className="mt-3 h-28 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm border border-gray-200">
                <MapPin size={20} className="mr-2 text-primary-500" />
                {isRTL ? 'عرض على الخريطة' : 'View on Map'}
              </div>
            </Card>

            {/* Stats */}
            <Card className="p-5">
              <h3 className="font-bold text-gray-800 mb-3">{isRTL ? 'إحصائيات الأداء' : 'Performance'}</h3>
              <div className="space-y-3">
                {[
                  { label: isRTL ? 'نسبة الإنجاز' : 'Completion Rate', value: shop.stats.completionRate, color: 'bg-green-500' },
                  { label: isRTL ? 'التسليم في الموعد' : 'On-time Delivery', value: shop.stats.onTimeDelivery, color: 'bg-blue-500' },
                  { label: isRTL ? 'العملاء المتكررون' : 'Repeat Customers', value: shop.stats.repeatCustomers, color: 'bg-gold-500' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{stat.label}</span>
                      <span className="font-bold text-gray-800">{stat.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`${stat.color} h-1.5 rounded-full`} style={{ width: `${stat.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
