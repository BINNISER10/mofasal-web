'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Star, Store } from 'lucide-react';
import { aiApi, RecommendedProduct, trackBehavior } from '@/lib/api/ai';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatCurrency } from '@/lib/utils/formatting';

export function RecommendedForYou({ limit = 8 }: { limit?: number }) {
  const router = useRouter();
  const { isRTL } = useAppStore();
  const { isAuthenticated } = useAuthStore();
  const [items, setItems] = useState<RecommendedProduct[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    let active = true;
    aiApi.getRecommendations(limit)
      .then((res) => { if (active) { setItems(res.items || []); setPersonalized(res.personalized); } })
      .catch(() => { if (active) setItems([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated, limit]);

  if (!isAuthenticated || loading || items.length === 0) return null;

  const openProduct = (p: RecommendedProduct) => {
    trackBehavior('VIEW_PRODUCT', { productId: p.id, categoryId: p.category?.id, shopId: p.shop?.id });
    if (p.shop?.id) router.push(`/shops/${p.shop.id}`);
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} className="text-gold-500" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-slate-100">
          {personalized ? (isRTL ? 'موصى لك' : 'Recommended for you') : (isRTL ? 'الأكثر رواجاً' : 'Trending')}
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {items.map((p) => (
          <button
            key={p.id}
            onClick={() => openProduct(p)}
            className="flex-shrink-0 w-40 text-right bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden hover:shadow-jahez transition-shadow"
          >
            <div className="h-28 bg-gray-100 dark:bg-slate-700 overflow-hidden">
              {p.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-slate-600"><Store size={28} /></div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">{isRTL ? (p.nameAr || p.name) : p.name}</p>
              {p.shop && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                  <Star size={11} className="text-gold-400 fill-gold-400" />
                  <span>{p.shop.rating?.toFixed(1)}</span>
                  <span className="truncate">· {p.shop.name}</span>
                </div>
              )}
              <p className="text-sm font-bold text-primary-700 mt-1">{formatCurrency(p.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
