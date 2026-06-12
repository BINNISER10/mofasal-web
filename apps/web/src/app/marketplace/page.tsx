'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { PageHero } from '@/components/shared/PageHero';
import { useAppStore } from '@/lib/stores/appStore';
import { productsApi } from '@/lib/api/products';
import { HOME_IMAGES } from '@/components/home/homeImages';
import { Star, Heart, ChevronDown, Package, X, SlidersHorizontal } from 'lucide-react';

interface ProductCard {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  material: string;
  origin: string;
  pricePerMeter: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isFeatured: boolean;
  colors: string[];
  imageUrl: string | null;
  merchant: string;
  tag: string | null;
  descAr: string;
}

const CATEGORIES = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'mens', labelAr: 'رجالي', labelEn: "Men's" },
  { id: 'kids', labelAr: 'أطفال', labelEn: 'Boys' },
  { id: 'accessories', labelAr: 'إكسسوارات', labelEn: 'Accessories' },
  { id: 'lining', labelAr: 'بطانات', labelEn: 'Lining' },
];

const MATERIALS = ['الكل', 'قطن', 'صوف', 'حرير', 'كتان', 'بوليستر', 'تريكو', 'جلد'];
const ORIGINS = ['الكل', 'إيطالي', 'مصري', 'هندي', 'تركي', 'إماراتي', 'سعودي'];
const TRENDING = ['صوف إيطالي', 'قطن فاخر', 'ثوب صيفي', 'ثوب سعودي'];

const SLUG_CATEGORY: Record<string, string> = {
  mens: "Men's Fabrics",
  kids: 'Kids Fabrics',
  accessories: 'Accessories',
  lining: 'Lining',
};

function resolveTag(raw: any): string | null {
  const inStock = raw.inStock !== undefined
    ? raw.inStock
    : (raw.stockQuantity ?? raw.stock ?? 1) > 0;
  if (!inStock) return 'نفذ المخزون';
  const tags = String(raw.tags || '').toLowerCase();
  if (tags.includes('bestseller') || tags.includes('best') || tags.includes('الأكثر')) return 'الأكثر مبيعاً';
  if (tags.includes('new') || tags.includes('جديد')) return 'جديد';
  if (raw.isFeatured) return 'مميز';
  return null;
}

function mapProduct(raw: any): ProductCard {
  const attrs = raw.attributes || {};
  const categoryName = typeof raw.category === 'string'
    ? raw.category
    : raw.category?.name || raw.category?.nameAr || '';
  const catSlug = categoryName
    ? Object.entries(SLUG_CATEGORY).find(([, v]) => v === categoryName || categoryName.includes(v))?.[0]
      || (raw.category?.slug ?? 'all')
    : 'all';
  const inStock = raw.inStock !== undefined
    ? raw.inStock
    : (raw.stockQuantity ?? raw.stock ?? 1) > 0;

  return {
    id: raw.id,
    nameAr: raw.nameAr || raw.name,
    nameEn: raw.nameEn || raw.name,
    category: catSlug,
    material: raw.material || attrs.material || raw.category?.nameAr || '',
    origin: raw.origin || attrs.origin || '',
    pricePerMeter: raw.price || raw.pricePerMeter || 0,
    rating: raw.rating || raw.shop?.rating || 0,
    reviewCount: raw.reviewCount || 0,
    inStock,
    isFeatured: raw.isFeatured ?? false,
    colors: raw.colors || attrs.colors || ['#F5F5F5', '#E8E8E8', '#D4D4D4', '#A3A3A3'],
    imageUrl: Array.isArray(raw.images) && raw.images[0] ? raw.images[0] : null,
    merchant: raw.merchantName || raw.shop?.nameAr || raw.shop?.name || '',
    tag: resolveTag(raw),
    descAr: raw.descriptionAr || raw.description || '',
  };
}

function FabricCard({ product, isRTL }: { product: ProductCard; isRTL: boolean }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="group h-full flex flex-col">
      <Link href={`/marketplace/${product.id}`} className="block flex-1 flex flex-col">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 mb-3">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.nameAr} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {product.colors.slice(0, 4).map((c, i) => (
              <div key={i} style={{ backgroundColor: c }} className="transition-transform duration-500 group-hover:scale-[1.02]" />
            ))}
          </div>
          )}

          {product.tag && (
            <span className={`absolute top-3 start-3 text-[10px] font-medium px-2.5 py-1 rounded-full ${
              product.tag === 'نفذ المخزون'
                ? 'bg-neutral-800/80 text-white'
                : 'bg-white/95 text-[#0A0A0A]'
            }`}>
              {product.tag}
            </span>
          )}

          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <Heart size={14} className={liked ? 'fill-red-500 text-red-500' : 'text-neutral-400'} />
          </button>

          {!product.inStock && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
          )}
        </div>

        <div className="flex-1 flex flex-col px-0.5">
          <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-1">{product.merchant}</p>
          <h3 className="text-sm font-medium text-[#0A0A0A] dark:text-white leading-snug mb-1 line-clamp-2">
            {isRTL ? product.nameAr : product.nameEn}
          </h3>
          <p className="text-xs text-neutral-500 mb-2">
            {product.material}{product.origin ? ` · ${product.origin}` : ''}
          </p>
          <div className="flex items-center gap-1 mb-3">
            <Star size={11} className="fill-[#B8963E] text-[#B8963E]" />
            <span className="text-xs text-neutral-600">{product.rating || '—'}</span>
            {product.reviewCount > 0 && (
              <span className="text-xs text-neutral-400">({product.reviewCount})</span>
            )}
          </div>
          <div className="mt-auto flex items-baseline justify-between gap-2">
            <div>
              <span className="text-base font-semibold text-[#0A0A0A] dark:text-white">
                ﷼{product.pricePerMeter}
              </span>
              <span className="text-xs text-neutral-400 ms-1">{isRTL ? '/ متر' : '/ m'}</span>
            </div>
            <span className="text-xs font-medium text-[#00373E] dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {isRTL ? 'عرض ←' : 'View →'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
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

  const selectClass =
    'appearance-none bg-white dark:bg-[#111] border border-[#E8E8E8] dark:border-white/10 rounded-full px-4 py-2 text-sm text-[#0A0A0A] dark:text-white pe-9 focus:outline-none focus:border-[#00373E]/40';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navbar />

      <PageHero
        isRTL={isRTL}
        title={isRTL ? 'سوق الأقمشة' : 'Fabric Market'}
        subtitle={isRTL
          ? 'أجود أقمشة الثوب السعودي للرجال والأطفال — من تجار موثوقين.'
          : 'Finest Saudi thobe fabrics for men and boys — from trusted merchants.'}
        image={HOME_IMAGES.marketplace}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={isRTL ? 'ابحث عن قماش أو مادة...' : 'Search fabric or material...'}
      />

      <div className="border-b border-[#E8E8E8] dark:border-white/10 py-3">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex items-center gap-2 text-sm overflow-x-auto hide-scrollbar">
          <span className="text-neutral-400 shrink-0">{isRTL ? 'رائج' : 'Trending'}</span>
          {TRENDING.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSearch(t)}
              className="shrink-0 px-3 py-1 rounded-full border border-[#E8E8E8] dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:border-[#00373E] hover:text-[#00373E] text-xs transition-colors"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-8 pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]'
                  : 'border border-[#E8E8E8] dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:border-[#0A0A0A]'
              }`}
            >
              {isRTL ? cat.labelAr : cat.labelEn}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select value={selectedMaterial} onChange={(e) => setSelectedMaterial(e.target.value)} className={selectClass}>
                {MATERIALS.map((m) => <option key={m}>{m}</option>)}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-neutral-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={selectedOrigin} onChange={(e) => setSelectedOrigin(e.target.value)} className={selectClass}>
                {ORIGINS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-neutral-400 pointer-events-none" />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all ${
                showFilters
                  ? 'bg-[#00373E] text-white border-[#00373E]'
                  : 'border-[#E8E8E8] dark:border-white/10 text-neutral-600'
              }`}
            >
              <SlidersHorizontal size={14} />
              {isRTL ? 'فلاتر' : 'Filters'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-500">
              {filtered.length} {isRTL ? 'منتج' : 'items'}
            </span>
            <div className="relative">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectClass}>
                <option value="featured">{isRTL ? 'المميزة' : 'Featured'}</option>
                <option value="rating">{isRTL ? 'التقييم' : 'Rating'}</option>
                <option value="price_asc">{isRTL ? 'السعر ↑' : 'Price ↑'}</option>
                <option value="price_desc">{isRTL ? 'السعر ↓' : 'Price ↓'}</option>
              </select>
              <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 end-3 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mb-8 p-6 rounded-2xl border border-[#E8E8E8] dark:border-white/10 bg-[#FAFAFA] dark:bg-[#111] grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-neutral-500 mb-2">{isRTL ? `حتى ﷼${maxPrice}` : `Up to ﷼${maxPrice}`}</p>
              <input type="range" min={20} max={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-[#00373E]" />
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600">
              <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="rounded" />
              {isRTL ? 'متوفر فقط' : 'In stock only'}
            </label>
            <button
              type="button"
              onClick={() => { setSelectedMaterial('الكل'); setSelectedOrigin('الكل'); setMaxPrice(1000); setInStockOnly(false); setActiveCategory('all'); }}
              className="text-sm text-neutral-500 hover:text-[#0A0A0A] flex items-center gap-1 justify-end"
            >
              <X size={14} />
              {isRTL ? 'مسح' : 'Clear'}
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-neutral-200 rounded-xl mb-3" />
                <div className="h-3 bg-neutral-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-neutral-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package size={40} className="text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-500">{isRTL ? 'لا توجد منتجات' : 'No products found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-y-12">
            {filtered.map((product) => (
              <FabricCard key={product.id} product={product} isRTL={isRTL} />
            ))}
          </div>
        )}

        <div className="mt-20 md:mt-28 text-center py-14 px-6 rounded-2xl bg-[#FAFAFA] dark:bg-[#111] border border-[#E8E8E8] dark:border-white/10">
          <h3 className="text-xl md:text-2xl font-semibold text-[#0A0A0A] dark:text-white mb-2">
            {isRTL ? 'تاجر أقمشة؟' : 'Fabric merchant?'}
          </h3>
          <p className="text-neutral-500 text-sm mb-6 max-w-md mx-auto">
            {isRTL ? 'انضم للسوق واصل لآلاف الخياطين' : 'Join the market and reach thousands of tailors'}
          </p>
          <button
            type="button"
            onClick={() => router.push('/register?role=merchant')}
            className="inline-flex min-h-[48px] items-center px-8 text-sm font-medium bg-[#00373E] text-white rounded-full hover:bg-[#002F35] transition-colors"
          >
            {isRTL ? 'انضم كتاجر' : 'Join as merchant'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
