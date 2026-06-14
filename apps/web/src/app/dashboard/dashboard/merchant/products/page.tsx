'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Search, Plus, Edit3, Eye, Star, ShoppingBag, Image as ImageIcon, BarChart3, Heart } from 'lucide-react';
import Link from 'next/link';
import { productsApi, Product } from '@/lib/api/products';

export default function MerchantProductsPage() {
  const { isRTL } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await productsApi.list();
        setProducts(res.products);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
          {isRTL ? 'المنتجات' : 'Products'}
          {!loading && <span className="text-sm text-gray-500 dark:text-slate-400 font-normal"> ({products.length})</span>}
        </h2>
        <Button href="/dashboard/merchant/products/add" variant="primary" size="sm" icon={<Plus size={16} />}>{isRTL ? 'إضافة منتج' : 'Add Product'}</Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4"><ShoppingBag size={28} className="text-gray-400" /></div>
          <p className="text-gray-500 dark:text-slate-400 mb-4">{isRTL ? 'لا توجد منتجات بعد' : 'No products yet'}</p>
          <Button href="/dashboard/merchant/products/add" variant="primary">{isRTL ? 'أضف منتجك الأول' : 'Add Your First Product'}</Button>
        </Card>
      ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden group">
              <div className="aspect-[4/3] bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon size={32} className="text-gray-300 dark:text-slate-600" /></div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={p.stock > 0 ? 'success' : 'error'} size="sm">{isRTL ? (p.stock > 0 ? 'متوفر' : 'نفذ') : (p.stock > 0 ? 'In Stock' : 'Out of Stock')}</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate">{p.nameAr || p.name}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{p.category}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-primary-700">{formatCurrency(p.price)}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
                    <Star size={12} className="text-gold-500" />
                    <span>{p.rating || '-'}</span>
                    <span>({p.reviewCount || 0})</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{isRTL ? 'مخزون' : 'Stock'}: {p.stock}</p>
              </div>
            </Card>
          ))}
        </div>
      </>
      )}
    </div>
  );
}
