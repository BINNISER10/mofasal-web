'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import {
  Search, SlidersHorizontal, Star, MapPin, Scissors,
  Package, X, ChevronDown, Filter, TrendingUp, Clock,
  Store, Sparkles, ArrowLeft, ArrowRight,
} from 'lucide-react';

const mockShops = [
  { id: '1', name: 'خياطة الرجال الراقية', city: 'الرياض', rating: 4.9, reviews: 312, specialties: ['بدل', 'ثياب'], price: '500-2000', delivery: 3, verified: true, type: 'shop' as const },
  { id: '2', name: 'أتيليه النخبة', city: 'جدة', rating: 4.8, reviews: 198, specialties: ['فساتين', 'عبايات'], price: '300-1500', delivery: 4, verified: true, type: 'shop' as const },
  { id: '3', name: 'خياطة الخليج', city: 'الدمام', rating: 4.7, reviews: 145, specialties: ['بشوت', 'ثياب'], price: '400-1800', delivery: 5, verified: false, type: 'shop' as const },
  { id: '4', name: 'تيلور هاوس', city: 'الرياض', rating: 4.6, reviews: 89, specialties: ['بدل', 'قمصان'], price: '600-2500', delivery: 3, verified: true, type: 'shop' as const },
];

const mockProducts = [
  { id: '1', name: 'قماش صوف إيطالي فاخر', merchant: 'بيت الأقمشة الراقية', price: 185, rating: 4.9, reviews: 218, category: 'صوف', color: '#1a1a2e', type: 'product' as const },
  { id: '2', name: 'قماش كتان مصري أصيل', merchant: 'سوق الأقمشة المصرية', price: 95, rating: 4.7, reviews: 143, category: 'كتان', color: '#f5e6c8', type: 'product' as const },
  { id: '3', name: 'قماش حرير طبيعي فاخر', merchant: 'دار الحرير', price: 320, rating: 4.8, reviews: 97, category: 'حرير', color: '#f8bbd0', type: 'product' as const },
  { id: '4', name: 'قطيفة مخملية ملكية', merchant: 'بيت القطيفة', price: 210, rating: 4.6, reviews: 63, category: 'مخمل', color: '#4a0080', type: 'product' as const },
];

const TRENDING = ['بدلة رجالية', 'قماش صوف', 'عباية فاخرة', 'ثوب أبيض', 'قماش كتان'];
const CITIES = ['الكل', 'الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة'];
const SORT_OPTIONS = [
  { value: 'relevance', labelAr: 'الأكثر صلة' },
  { value: 'rating', labelAr: 'الأعلى تقييماً' },
  { value: 'price_asc', labelAr: 'السعر: الأقل' },
  { value: 'price_desc', labelAr: 'السعر: الأعلى' },
  { value: 'newest', labelAr: 'الأحدث' },
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isRTL } = useAppStore();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<'all' | 'shops' | 'products'>('all');
  const [city, setCity] = useState('الكل');
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(['بدلة رسمية', 'قماش صوف', 'خياط جدة']);

  const filteredShops = mockShops.filter(s =>
    (!query || s.name.includes(query) || s.specialties.some(sp => sp.includes(query))) &&
    (city === 'الكل' || s.city === city) &&
    s.rating >= minRating
  );

  const filteredProducts = mockProducts.filter(p =>
    (!query || p.name.includes(query) || p.category.includes(query)) &&
    p.rating >= minRating
  );

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q && !recentSearches.includes(q)) {
      setRecentSearches(prev => [q, ...prev.slice(0, 4)]);
    }
    router.push(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  };

  const totalResults = (activeTab === 'all' ? filteredShops.length + filteredProducts.length
    : activeTab === 'shops' ? filteredShops.length : filteredProducts.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder={isRTL ? 'ابحث عن خياط، قماش، أو خدمة...' : 'Search tailors, fabrics, services...'}
              className="w-full ps-12 pe-32 py-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              autoFocus
            />
            <div className="absolute end-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {query && (
                <button onClick={() => setQuery('')} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400">
                  <X size={16} />
                </button>
              )}
              <Button variant="primary" size="sm" onClick={() => handleSearch(query)}>
                {isRTL ? 'بحث' : 'Search'}
              </Button>
            </div>
          </div>
        </div>

        {/* Trending / Recent - shown only when no query */}
        {!query && (
          <div className="grid sm:grid-cols-2 gap-6 mb-8">
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <TrendingUp size={16} className="text-primary-600" />
                {isRTL ? 'الأكثر بحثاً' : 'Trending'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING.map((t) => (
                  <button key={t} onClick={() => handleSearch(t)}
                    className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-800/40 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="text-sm font-bold text-gray-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                <Clock size={16} className="text-gray-400" />
                {isRTL ? 'آخر عمليات البحث' : 'Recent Searches'}
              </h3>
              <div className="space-y-1">
                {recentSearches.map((r) => (
                  <button key={r} onClick={() => handleSearch(r)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 text-sm text-gray-600 dark:text-slate-400 transition-colors group">
                    <span className="flex items-center gap-2">
                      <Clock size={13} className="text-gray-300 dark:text-slate-600" />
                      {r}
                    </span>
                    <ArrowIcon size={13} className="text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Results */}
        {query && (
          <>
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2">
                {/* Tabs */}
                {(['all', 'shops', 'products'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === tab ? 'bg-primary-600 text-white' : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-gray-300'
                    }`}>
                    {tab === 'all' ? (isRTL ? `الكل (${filteredShops.length + filteredProducts.length})` : `All (${filteredShops.length + filteredProducts.length})`)
                      : tab === 'shops' ? (isRTL ? `متاجر (${filteredShops.length})` : `Shops (${filteredShops.length})`)
                      : (isRTL ? `منتجات (${filteredProducts.length})` : `Products (${filteredProducts.length})`)}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                {/* City Filter */}
                <div className="relative">
                  <select value={city} onChange={(e) => setCity(e.target.value)}
                    className="ps-3 pe-8 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {/* Sort */}
                <div className="relative">
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="ps-3 pe-8 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none">
                    {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.labelAr}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {/* Min Rating */}
                <button onClick={() => setMinRating(minRating === 0 ? 4 : 0)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                    minRating > 0 ? 'bg-gold-50 border-gold-300 text-gold-700' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                  }`}>
                  <Star size={14} className={minRating > 0 ? 'fill-gold-500 text-gold-500' : ''} />
                  {isRTL ? '4+ نجوم' : '4+ Stars'}
                </button>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {isRTL ? `${totalResults} نتيجة لـ "${query}"` : `${totalResults} results for "${query}"`}
            </p>

            {/* Shops Results */}
            {(activeTab === 'all' || activeTab === 'shops') && filteredShops.length > 0 && (
              <div className="mb-8">
                {activeTab === 'all' && (
                  <h2 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Store size={16} className="text-primary-600" />
                    {isRTL ? 'المتاجر' : 'Tailoring Shops'}
                  </h2>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredShops.map(shop => (
                    <a key={shop.id} href={`/shops/${shop.id}`}>
                      <Card className="p-4 hover:-translate-y-1 transition-all" hover>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {shop.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate">{shop.name}</h3>
                              {shop.verified && <Sparkles size={12} className="text-gold-500 flex-shrink-0" />}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <MapPin size={12} className="text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-slate-400">{shop.city}</span>
                              <Star size={12} className="text-gold-500 fill-gold-500" />
                              <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{shop.rating}</span>
                              <span className="text-xs text-gray-400">({shop.reviews})</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {shop.specialties.map(sp => (
                                <span key={sp} className="text-[10px] px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">{sp}</span>
                              ))}
                            </div>
                          </div>
                          <div className="text-end flex-shrink-0">
                            <p className="text-xs text-gray-400 dark:text-slate-500">{isRTL ? 'السعر' : 'Price'}</p>
                            <p className="text-xs font-bold text-primary-700 dark:text-primary-400">{shop.price} ر.س</p>
                          </div>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Products Results */}
            {(activeTab === 'all' || activeTab === 'products') && filteredProducts.length > 0 && (
              <div>
                {activeTab === 'all' && (
                  <h2 className="text-base font-bold text-gray-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                    <Package size={16} className="text-primary-600" />
                    {isRTL ? 'الأقمشة والمنتجات' : 'Fabrics & Products'}
                  </h2>
                )}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProducts.map(product => (
                    <a key={product.id} href={`/marketplace/${product.id}`}>
                      <Card className="p-4 hover:-translate-y-1 transition-all" hover>
                        <div className="h-16 rounded-xl mb-3" style={{ background: `linear-gradient(135deg, ${product.color}44, ${product.color}99)` }} />
                        <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100 leading-tight">{product.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{product.merchant}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary-700 dark:text-primary-400 text-sm">{product.price} ر.س/م</span>
                          <div className="flex items-center gap-1">
                            <Star size={11} className="text-gold-500 fill-gold-500" />
                            <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{product.rating}</span>
                          </div>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalResults === 0 && (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto text-gray-200 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-gray-700 dark:text-slate-300">{isRTL ? 'لا توجد نتائج' : 'No results found'}</h3>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">
                  {isRTL ? `لم نجد نتائج لـ "${query}". جرب كلمات بحث أخرى.` : `No results for "${query}". Try different keywords.`}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {TRENDING.map(t => (
                    <button key={t} onClick={() => handleSearch(t)}
                      className="px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
