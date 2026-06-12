'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { PageHero } from '@/components/shared/PageHero';
import { HOME_IMAGES } from '@/components/home/homeImages';
import { useAppStore } from '@/lib/stores/appStore';
import { shopsApi } from '@/lib/api/shops';
import { trackBehavior } from '@/lib/api/ai';
import { RecommendedForYou } from '@/components/shared/RecommendedForYou';
import {
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
const CATEGORIES = ['الكل', 'خياطة رجالية', 'أطفال', 'ثوب سعودي', 'بشوت ومشالح', 'تعديلات'];
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

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="group block"
      onClick={() => trackBehavior('VIEW_SHOP', { shopId: shop.id })}
    >
      <article className="h-full flex flex-col">
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#00373E]/5 mb-3">
          {shop.image ? (
            <img src={shop.image} alt={shop.nameAr} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
          <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#00373E] flex items-center justify-center text-white text-lg font-semibold">
            {initials}
          </div>
          </div>
          )}
          {shop.verified && (
            <span className="absolute top-3 end-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/95 text-[#0A0A0A]">
              {isRTL ? 'موثق' : 'Verified'}
            </span>
          )}
          <span className={`absolute top-3 start-3 w-2 h-2 rounded-full ${shop.isOpen ? 'bg-emerald-500' : 'bg-neutral-300'} ring-2 ring-white`} />
        </div>

        <div className="flex-1 flex flex-col px-0.5">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{shop.category}</p>
          <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white leading-snug mb-1 line-clamp-2">
            {isRTL ? shop.nameAr : shop.nameEn}
          </h3>
          <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2">
            <MapPin size={11} />
            <span>{shop.city}{shop.district ? ` · ${shop.district}` : ''}</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1">
              <Star size={11} className="fill-[#B8963E] text-[#B8963E]" />
              <span className="text-xs text-neutral-600">{shop.rating || '—'}</span>
              {shop.reviewCount > 0 && <span className="text-xs text-neutral-400">({shop.reviewCount})</span>}
            </div>
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <ShoppingBag size={11} />
              {shop.orderCount.toLocaleString()}
            </span>
          </div>
          {shop.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {shop.specialties.slice(0, 2).map((s) => (
                <span key={s} className="text-[10px] text-neutral-500 border border-[#E8E8E8] dark:border-white/10 px-2 py-0.5 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-baseline justify-between gap-2 pt-2 border-t border-[#E8E8E8] dark:border-white/10">
            <div>
              <span className="text-base font-semibold text-[#0A0A0A] dark:text-white">﷼{shop.minPrice}</span>
              <span className="text-xs text-neutral-400 ms-1">{isRTL ? 'يبدأ من' : 'from'}</span>
            </div>
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <Clock size={11} />
              {shop.deliveryDays}{isRTL ? ' ي' : 'd'}
            </span>
          </div>
        </div>
      </article>
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
    minPrice: raw.minPrice || raw.minOrderAmount || 200,
    deliveryDays: raw.estimatedDeliveryTime || raw.deliveryDays || 7,
    verified: raw.status === 'ACTIVE' || raw.isVerified || false,
    specialties: raw.specialties || raw.categories || [],
    image: raw.coverImage || raw.logo || null,
    isOpen: raw.isOpen !== false,
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

  const selectClass =
    'appearance-none bg-white dark:bg-[#111] border border-[#E8E8E8] dark:border-white/10 rounded-full px-4 py-2 text-sm text-[#0A0A0A] dark:text-white pe-9 focus:outline-none focus:border-[#00373E]/40';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navbar />

      <PageHero
        isRTL={isRTL}
        title={isRTL ? 'محلات الخياطة' : 'Tailor Shops'}
        subtitle={isRTL
          ? 'ورش خياطة رجالية وأطفال معتمدة — ثوب، بشوت.'
          : 'Verified men’s and boys’ tailoring — thobe, bisht.'}
        image={HOME_IMAGES.shops}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isRTL ? 'ابحث باسم المتجر أو المدينة...' : 'Search shop or city...'}
      />

      <div className="border-b border-[#E8E8E8] dark:border-white/10 bg-[#FAFAFA] dark:bg-[#111]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
          <span>{isRTL ? `${filtered.length} متجر` : `${filtered.length} shops`}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {shops.filter((s) => s.isOpen).length} {isRTL ? 'مفتوح' : 'open'}
            </span>
            <span>{shops.filter((s) => s.verified).length} {isRTL ? 'موثق' : 'verified'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]'
                  : 'bg-[#FAFAFA] dark:bg-white/5 text-neutral-600 dark:text-neutral-300 border border-[#E8E8E8] dark:border-white/10 hover:border-[#00373E]/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className={selectClass}>
                <option value="">{isRTL ? 'كل المدن' : 'All cities'}</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-neutral-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                showFilters
                  ? 'bg-[#0A0A0A] text-white border-[#0A0A0A] dark:bg-white dark:text-[#0A0A0A]'
                  : 'border-[#E8E8E8] dark:border-white/10 text-neutral-600 hover:border-[#00373E]/30'
              }`}
            >
              <SlidersHorizontal size={14} />
              {isRTL ? 'فلاتر' : 'Filters'}
            </button>
          </div>
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{isRTL ? o.labelAr : o.labelEn}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-[#E8E8E8] dark:border-white/10 p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">{isRTL ? 'التقييم' : 'Rating'}</p>
              <div className="flex flex-wrap gap-2">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setMinRating(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      minRating === r
                        ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]'
                        : 'border-[#E8E8E8] text-neutral-600 hover:border-[#00373E]/30'
                    }`}
                  >
                    {r === 0 ? (isRTL ? 'الكل' : 'All') : `${r}+`}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600">
                <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="rounded border-[#E8E8E8]" />
                {isRTL ? 'موثق فقط' : 'Verified only'}
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600">
                <input type="checkbox" checked={openOnly} onChange={(e) => setOpenOnly(e.target.checked)} className="rounded border-[#E8E8E8]" />
                {isRTL ? 'مفتوح الآن' : 'Open now'}
              </label>
            </div>
            <div className="flex items-center sm:justify-end">
              <button
                type="button"
                onClick={() => { setMinRating(0); setVerifiedOnly(false); setOpenOnly(false); setSelectedCity(''); setSelectedCategory('الكل'); }}
                className="text-sm text-neutral-500 hover:text-[#0A0A0A] flex items-center gap-1"
              >
                <X size={14} />
                {isRTL ? 'مسح' : 'Clear'}
              </button>
            </div>
          </div>
        )}

        {/* Recommended for you */}
        <RecommendedForYou />

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-neutral-100 mb-3" />
                <div className="h-3 bg-neutral-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-neutral-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-neutral-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Scissors size={40} className="text-neutral-200 mx-auto mb-4" />
            <p className="text-[#0A0A0A] dark:text-white font-medium">{isRTL ? 'لا توجد متاجر' : 'No shops found'}</p>
            <p className="text-neutral-400 text-sm mt-1">{isRTL ? 'جرّب تغيير الفلاتر' : 'Try different filters'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
