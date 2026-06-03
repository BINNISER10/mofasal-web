'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { shopsApi } from '@/lib/api/shops';
import { trackBehavior } from '@/lib/api/ai';
import { RecommendedForYou } from '@/components/shared/RecommendedForYou';
import {
  Search,
  MapPin,
  Star,
  ShoppingBag,
  Clock,
  ChevronDown,
  Scissors,
  SlidersHorizontal,
  X,
  Loader2,
} from 'lucide-react';

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'أبها', 'تبوك'];
const CATEGORIES = ['الكل', 'خياطة رجالية', 'أطفال', 'بدل رسمية', 'بشوت ومشالح', 'تعديلات'];
const SORT_OPTIONS = [
  { value: 'smart', labelAr: 'الترتيب الذكي', labelEn: 'Smart' },
  { value: 'rating', labelAr: 'الأعلى تقييماً', labelEn: 'Top Rated' },
  { value: 'popular', labelAr: 'الأكثر طلباً', labelEn: 'Most Orders' },
  { value: 'newest', labelAr: 'الأحدث', labelEn: 'Newest' },
];

interface ShopCardData {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  district: string;
  category: string;
  rating: number;
  reviewCount: number;
  orderCount: number;
  minPrice: number;
  deliveryDays: number;
  verified: boolean;
  specialties: string[];
  image: string | null;
  isOpen: boolean;
}

function ShopCard({ shop, isRTL }: { shop: ShopCardData; isRTL: boolean }) {
  const initials = shop.nameAr.split(' ').slice(0, 2).map((w) => w[0]).join('');
  const colors = ['#00373E', '#481719', '#735B4D', '#1A6470', '#8C4043'];
  const bg = colors[shop.id.charCodeAt(0) % colors.length];

  return (
    <Link href={`/shops/${shop.id}`} className="block" onClick={() => trackBehavior('VIEW_SHOP', { shopId: shop.id })}>
    <Card className="overflow-hidden hover:shadow-mufasal-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      {/* Shop Banner */}
      <div className="h-32 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${bg}22, ${bg}44)` }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
          style={{ background: bg }}
        >
          {initials}
        </div>
        {shop.verified && (
          <div className="absolute top-3 end-3 bg-white rounded-full px-2 py-1 flex items-center gap-1 shadow text-xs font-semibold text-primary-700">
            <svg className="w-3 h-3 text-primary-600 fill-primary-600" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {isRTL ? 'موثق' : 'Verified'}
          </div>
        )}
        <div className={`absolute top-3 start-3 w-2.5 h-2.5 rounded-full ${shop.isOpen ? 'bg-green-400' : 'bg-gray-300'} ring-2 ring-white`} />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">{isRTL ? shop.nameAr : shop.nameEn}</h3>
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
              <MapPin size={11} />
              <span>{shop.city} - {shop.district}</span>
            </div>
          </div>
        </div>

        {/* Rating Row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1">
            <Star size={13} className="fill-gold-400 text-gold-400" />
            <span className="text-sm font-bold text-gray-800">{shop.rating}</span>
            <span className="text-xs text-gray-400">({shop.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <ShoppingBag size={11} />
            <span>{shop.orderCount.toLocaleString()} {isRTL ? 'طلب' : 'orders'}</span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {shop.specialties.slice(0, 3).map((s) => (
            <span key={s} className="text-[10px] bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{s}</span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">{isRTL ? 'يبدأ من' : 'Starting from'}</p>
            <p className="text-sm font-bold text-primary-700">﷼{shop.minPrice}</p>
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={11} />
            <span>{shop.deliveryDays} {isRTL ? 'أيام' : 'days'}</span>
          </div>
        </div>
      </div>
    </Card>
    </Link>
  );
}

function mapShop(raw: any): ShopCardData {
  const nameAr = raw.nameAr || raw.name || '';
  const nameEn = raw.nameEn || raw.name || '';
  return {
    id: raw.id,
    nameAr,
    nameEn,
    city: raw.city || 'الرياض',
    district: raw.district || '',
    category: raw.category || 'خياطة رجالية',
    rating: raw.rating || 0,
    reviewCount: raw.reviewCount || 0,
    orderCount: raw.totalOrders || raw.orderCount || 0,
    minPrice: raw.minPrice || 0,
    deliveryDays: raw.deliveryDays || 7,
    verified: raw.status === 'ACTIVE' || raw.isVerified || false,
    specialties: raw.specialties || [],
    image: raw.logo || null,
    isOpen: raw.isOpen || false,
  };
}

export default function ShopsPage() {
  const { isRTL } = useAppStore();
  const [shops, setShops] = useState<ShopCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState('smart');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    shopsApi.list({ limit: '50', sort: sortBy })
      .then((res) => setShops(res.shops.map(mapShop)))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [sortBy]);

  const filtered = useMemo(() => {
    let result = shops.filter((s) => {
      if (search && !s.nameAr.includes(search) && !s.nameEn.toLowerCase().includes(search.toLowerCase()) && !s.city.includes(search)) return false;
      if (selectedCity && s.city !== selectedCity) return false;
      if (selectedCategory !== 'الكل' && s.category !== selectedCategory) return false;
      if (minRating > 0 && s.rating < minRating) return false;
      if (verifiedOnly && !s.verified) return false;
      if (openOnly && !s.isOpen) return false;
      return true;
    });
    return result;
  }, [search, selectedCity, selectedCategory, minRating, verifiedOnly, openOnly, shops]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-hero text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scissors size={28} className="text-gold-300" />
            <h1 className="text-4xl md:text-5xl font-bold">
              {isRTL ? 'اكتشف المتاجر' : 'Discover Shops'}
            </h1>
          </div>
          <p className="text-xl text-primary-200 mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'تصفح أفضل ورش الخياطة المعتمدة في مختلف مدن المملكة'
              : 'Browse top verified tailoring workshops across Saudi Arabia'}
          </p>
          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl mx-auto bg-white rounded-2xl p-1.5 shadow-xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? 'ابحث باسم المتجر أو المدينة...' : 'Search by shop name or city...'}
                className="w-full text-gray-800 text-sm outline-none bg-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <Button variant="primary" className="rounded-xl px-6">
              {isRTL ? 'بحث' : 'Search'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-600">
          <span>
            {isRTL ? `${filtered.length} متجر متاح` : `${filtered.length} shops available`}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              {isRTL ? `${shops.filter(s => s.isOpen).length} مفتوح الآن` : `${shops.filter(s => s.isOpen).length} open now`}
            </span>
            <span className="flex items-center gap-1 text-primary-700">
              <svg className="w-3 h-3 fill-primary-600" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {isRTL ? `${shops.filter(s => s.verified).length} موثق` : `${shops.filter(s => s.verified).length} verified`}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-primary-50 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters + Sort Row */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            {/* City Filter */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="">{isRTL ? 'كل المدن' : 'All Cities'}</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-400 pointer-events-none" />
            </div>

            {/* More Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                showFilters ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              }`}
            >
              <SlidersHorizontal size={14} />
              {isRTL ? 'فلاتر' : 'Filters'}
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 hidden sm:block">{isRTL ? 'ترتيب:' : 'Sort:'}</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{isRTL ? o.labelAr : o.labelEn}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">{isRTL ? 'الحد الأدنى للتقييم' : 'Minimum Rating'}</p>
              <div className="flex gap-2">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      minRating === r ? 'bg-gold-400 text-white border-gold-400' : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {r === 0 ? (isRTL ? 'الكل' : 'All') : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="w-4 h-4 rounded text-primary-500 focus:ring-primary-300" />
                <span className="text-sm text-gray-700">{isRTL ? 'موثق فقط' : 'Verified only'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="w-4 h-4 rounded text-primary-500 focus:ring-primary-300" />
                <span className="text-sm text-gray-700">{isRTL ? 'مفتوح الآن' : 'Open now'}</span>
              </label>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() => { setMinRating(0); setVerifiedOnly(false); setOpenOnly(false); setSelectedCity(''); setSelectedCategory('الكل'); }}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} />
                {isRTL ? 'مسح الفلاتر' : 'Clear filters'}
              </button>
            </div>
          </div>
        )}

        {/* Recommended for you */}
        <RecommendedForYou />

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-32 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                    <div className="h-5 bg-gray-200 rounded-full w-12" />
                    <div className="h-5 bg-gray-200 rounded-full w-14" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Scissors size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">{isRTL ? 'لا توجد متاجر تطابق البحث' : 'No shops match your search'}</p>
            <p className="text-gray-400 text-sm mt-1">{isRTL ? 'حاول تغيير معايير البحث' : 'Try adjusting your filters'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((shop) => (
              <ShopCard key={shop.id} shop={shop} isRTL={isRTL} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
