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
import { mapShopDetail, type ShopDetailView } from '@/lib/mappers/shopDetail';
import { ShopBrandingScope } from '@/components/shared/ShopBranding';
import {
  Star, MapPin, Clock, Phone, CheckCircle2, ArrowRight, ArrowLeft,
  Scissors, Ruler, Package, MessageCircle, Heart, Share2, ChevronLeft,
  ChevronRight, Users, Award, TrendingUp, ShoppingBag
} from 'lucide-react';

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'portfolio'>('services');
  const [liked, setLiked] = useState(false);

  const shopId = String(params.id);
  const [shop, setShop] = useState<ShopDetailView | null>(null);
  const [shopBranding, setShopBranding] = useState<Record<string, string> | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    shopsApi.getById(shopId)
      .then((res) => {
        if (!active) return;
        if (!res.shop?.id) {
          setError(true);
          return;
        }
        setShop(mapShopDetail(res.shop, isRTL));
        setShopBranding((res.shop as { branding?: Record<string, string> }).branding);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [shopId, isRTL]);

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        <Navbar />
        <div className="text-center py-32 text-neutral-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        <Footer />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
        <Navbar />
        <div className="text-center py-32">
          <p className="text-neutral-500 mb-4">{isRTL ? 'المتجر غير متوفر' : 'Shop not found'}</p>
          <Button onClick={() => router.push('/shops')}>{isRTL ? 'العودة للمتاجر' : 'Back to shops'}</Button>
        </div>
        <Footer />
      </div>
    );
  }

  const ChevronBack = isRTL ? ChevronRight : ChevronLeft;

  return (
    <ShopBrandingScope branding={shopBranding} className="min-h-screen bg-gray-50">
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
    </ShopBrandingScope>
  );
}
