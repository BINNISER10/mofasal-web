'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { productsApi } from '@/lib/api/products';
import {
  Search,
  Star,
  Heart,
  ChevronDown,
  Package,
  X,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ProductCard {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  material: string;
  origin: string;
  pricePerMeter: number;
  minMeters: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  colors: string[];
  merchant: string;
  tag: string | null;
  descAr: string;
}

const CATEGORIES = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'mens', labelAr: 'أقمشة رجالية', labelEn: "Men's Fabrics" },
  { id: 'womens', labelAr: 'أقمشة نسائية', labelEn: "Women's Fabrics" },
  { id: 'kids', labelAr: 'أطفال', labelEn: 'Kids' },
  { id: 'accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories' },
  { id: 'lining', labelAr: 'بطانات', labelEn: 'Lining' },
];

const MATERIALS = ['الكل', 'قطن', 'صوف', 'حرير', 'كتان', 'بوليستر', 'تريكو', 'جلد'];
const ORIGINS = ['الكل', 'إيطالي', 'مصري', 'هندي', 'تركي', 'إماراتي', 'سعودي'];

const SLUG_CATEGORY: Record<string, string> = {
  mens: "Men's Fabrics", womens: "Women's Fabrics", kids: 'Kids Fabrics',
  accessories: 'Accessories', lining: 'Lining',
};

function FabricCard({ product, isRTL }: { product: ProductCard; isRTL: boolean }) {
  const [liked, setLiked] = useState(false);

  return (
    <Link href={`/marketplace/${product.id}`} className="block">
    <Card className="overflow-hidden group hover:shadow-mufasal-hover hover:-translate-y-1 transition-all duration-300">
      {/* Image Area */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 gap-1 p-6 w-full">
            {product.colors.slice(0, 4).map((c, i) => (
              <div
                key={i}
                className="h-20 rounded-lg shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 start-2 flex flex-col gap-1">
          {product.tag && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
              product.tag === 'الأكثر مبيعاً' ? 'bg-gold-500' :
              product.tag === 'جديد' ? 'bg-primary-500' :
              'bg-red-500'
            }`}>
              {product.tag}
            </span>
          )}
          {product.isFeatured && !product.tag && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-purple-500 flex items-center gap-0.5">
              <Sparkles size={9} />
              {isRTL ? 'مميز' : 'Featured'}
            </span>
          )}
        </div>

        {/* Like Button */}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-2 end-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
        >
          <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
        </button>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
              {isRTL ? 'نفذ المخزون' : 'Out of Stock'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight">
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
            {isRTL ? product.descAr : product.nameEn}
          </p>
        </div>

        {/* Meta Row */}
        <div className="flex items-center gap-2 mb-2 mt-2">
          <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">{product.material}</span>
          <span className="text-xs text-gray-400">{product.origin}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star size={11} className="fill-gold-400 text-gold-400" />
          <span className="text-xs font-bold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
          <span className="text-xs text-gray-300 mx-1">·</span>
          <span className="text-xs text-gray-500">{product.merchant}</span>
        </div>

        {/* Price + Cart */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400">{isRTL ? 'المتر' : 'per meter'}</span>
            <p className="text-lg font-bold text-primary-700">﷼{product.pricePerMeter}</p>
          </div>
          <Button
            variant={product.inStock ? 'primary' : 'ghost'}
            size="sm"
            disabled={!product.inStock}
          >
            {isRTL ? 'عرض التفاصيل' : 'View Details'}
          </Button>
        </div>
      </div>
    </Card>
    </Link>
  );
}

function mapProduct(raw: any): ProductCard {
  const attrs = raw.attributes || {};
  const catSlug = raw.category
    ? Object.entries(SLUG_CATEGORY).find(([, v]) => v === raw.category)?.[0] || 'all'
    : 'all';
  return {
    id: raw.id,
    nameAr: raw.nameAr || raw.name,
    nameEn: raw.nameEn || raw.name,
    category: catSlug,
    material: raw.material || attrs.material || '',
    origin: raw.origin || attrs.origin || '',
    pricePerMeter: raw.price || raw.pricePerMeter || 0,
    minMeters: raw.minMeters || attrs.minMeters || 1,
    rating: raw.rating || 0,
    reviewCount: raw.reviewCount || 0,
    inStock: raw.inStock !== undefined ? raw.inStock : raw.stock ? raw.stock > 0 : true,
    isFeatured: raw.isFeatured ?? false,
    colors: raw.colors || attrs.colors || [],
    merchant: raw.merchantName || '',
    tag: raw.isFeatured ? (raw.inStock !== false ? 'مميز' : 'نفذ المخزون') : null,
    descAr: raw.description || '',
  };
}

export default function MarketplacePage() {
  const { isRTL } = useAppStore();
  const router = useRouter();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState('الكل');
  const [selectedOrigin, setSelectedOrigin] = useState('الكل');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsApi.list({ limit: '50' })
      .then((res) => setProducts(res.products.map(mapProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (search && !p.nameAr.includes(search) && !p.nameEn.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeCategory !== 'all' && p.category !== activeCategory) return false;
      if (selectedMaterial !== 'الكل' && p.material !== selectedMaterial) return false;
      if (selectedOrigin !== 'الكل' && p.origin !== selectedOrigin) return false;
      if (p.pricePerMeter > maxPrice) return false;
      if (inStockOnly && !p.inStock) return false;
      return true;
    });
    if (sortBy === 'price_asc') result = [...result].sort((a, b) => a.pricePerMeter - b.pricePerMeter);
    if (sortBy === 'price_desc') result = [...result].sort((a, b) => b.pricePerMeter - a.pricePerMeter);
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'featured') result = [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    return result;
  }, [search, activeCategory, selectedMaterial, selectedOrigin, sortBy, maxPrice, inStockOnly, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-accent-600 via-accent-500 to-primary-700 text-white py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Package size={28} className="text-gold-300" />
            <h1 className="text-4xl md:text-5xl font-bold">
              {isRTL ? 'سوق الأقمشة' : 'Fabric Marketplace'}
            </h1>
          </div>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            {isRTL
              ? 'تصفح آلاف الأقمشة والإكسسوارات من أفضل التجار في المملكة'
              : 'Browse thousands of fabrics and accessories from top Saudi merchants'}
          </p>
          {/* Search */}
          <div className="flex gap-2 max-w-2xl mx-auto bg-white rounded-2xl p-1.5 shadow-xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRTL ? 'ابحث عن قماش أو مادة أو تاجر...' : 'Search fabric, material or merchant...'}
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

      {/* Trending Bar */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm overflow-x-auto hide-scrollbar">
          <TrendingUp size={14} className="text-gold-500 flex-shrink-0" />
          <span className="text-gray-500 flex-shrink-0">{isRTL ? 'رائج:' : 'Trending:'}</span>
          {['صوف إيطالي', 'قطن مصري', 'عباءة فاخرة', 'حرير طبيعي'].map((t) => (
            <button
              key={t}
              onClick={() => setSearch(t)}
              className="whitespace-nowrap text-primary-600 hover:text-primary-800 font-medium px-2 py-0.5 rounded-lg hover:bg-primary-50"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-accent-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-accent-50 border border-gray-200'
              }`}
            >
              {isRTL ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {MATERIALS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {ORIGINS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                showFilters ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              <SlidersHorizontal size={14} />
              {isRTL ? 'فلاتر إضافية' : 'More Filters'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{isRTL ? `${filtered.length} منتج` : `${filtered.length} products`}</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 pr-8 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                <option value="featured">{isRTL ? 'المميزة أولاً' : 'Featured First'}</option>
                <option value="rating">{isRTL ? 'الأعلى تقييماً' : 'Top Rated'}</option>
                <option value="price_asc">{isRTL ? 'السعر: الأقل' : 'Price: Low'}</option>
                <option value="price_desc">{isRTL ? 'السعر: الأعلى' : 'Price: High'}</option>
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Extended Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">
                {isRTL ? `الحد الأقصى للسعر: ﷼${maxPrice}` : `Max Price: ﷼${maxPrice}`}
              </p>
              <input
                type="range"
                min={20}
                max={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>﷼20</span>
                <span>﷼1000</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="w-4 h-4 rounded text-primary-500" />
                <span className="text-sm text-gray-700">{isRTL ? 'متوفر فقط' : 'In stock only'}</span>
              </label>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() => { setSelectedMaterial('الكل'); setSelectedOrigin('الكل'); setMaxPrice(1000); setInStockOnly(false); setActiveCategory('all'); }}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <X size={14} />
                {isRTL ? 'مسح الكل' : 'Clear all'}
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 rounded-full w-16" />
                    <div className="h-5 bg-gray-200 rounded-full w-12" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">{isRTL ? 'لا توجد منتجات تطابق البحث' : 'No products match your search'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <FabricCard key={product.id} product={product} isRTL={isRTL} />
            ))}
          </div>
        )}

        {/* CTA for merchants */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">
            {isRTL ? 'هل أنت تاجر أقمشة؟' : 'Are you a fabric merchant?'}
          </h3>
          <p className="text-primary-200 mb-6 max-w-md mx-auto">
            {isRTL
              ? 'أضف منتجاتك للسوق وصل لآلاف الخياطين والعملاء'
              : 'List your products and reach thousands of tailors and customers'}
          </p>
          <Button variant="gold" size="lg" onClick={() => router.push('/register?role=merchant')}>
            {isRTL ? 'انضم كتاجر' : 'Join as Merchant'}
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
