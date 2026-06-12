'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { productsApi, Product } from '@/lib/api/products';
import {
  Search, Package, ShoppingBag, Sun, Moon, Sparkles,
  Loader2, Check, ChevronRight, Store, Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface SelectedFabric {
  type: 'shop' | 'marketplace';
  productId?: string;
  productName?: string;
  productPrice?: number;
  merchantName?: string;
  image?: string;
  meterPrice?: number;
  meters?: number;
}

interface FabricPickerProps {
  value: SelectedFabric;
  onChange: (fabric: SelectedFabric) => void;
  shopId?: string;
  compact?: boolean;
}

const FABRIC_CATEGORIES = [
  { id: 'summer', ar: 'أقمشة صيفية', icon: <Sun size={14} /> },
  { id: 'winter', ar: 'أقمشة شتوية', icon: <Moon size={14} /> },
  { id: 'formal', ar: 'أقمشة فاخرة', icon: <Sparkles size={14} /> },
  { id: 'cotton', ar: 'أقمشة قطنية', icon: <Package size={14} /> },
  { id: 'wool', ar: 'صوف', icon: <Package size={14} /> },
  { id: 'silk', ar: 'حرير', icon: <Sparkles size={14} /> },
];

export function FabricPicker({ value, onChange, shopId, compact }: FabricPickerProps) {
  const { isRTL } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [meters, setMeters] = useState(value.meters || 3);

  useEffect(() => {
    if (value.type === 'marketplace') {
      setLoading(true);
      const params: Record<string, string> = { limit: '12' };
      if (category) params.category = category;
      if (search) params.search = search;
      productsApi.list(params)
        .then(res => setProducts(res.products || []))
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }
  }, [value.type, category, search]);

  const handleSelectType = (type: 'shop' | 'marketplace') => {
    onChange({ ...value, type, productId: undefined, productName: undefined });
  };

  const handleSelectProduct = (product: Product) => {
    onChange({
      ...value,
      productId: product.id,
      productName: product.nameAr || product.name,
      productPrice: product.price,
      merchantName: product.merchantName,
      image: product.images?.[0],
      meterPrice: product.price,
      meters,
    });
  };

  const totalPrice = (value.meterPrice || 0) * meters;

  if (compact && value.productName) {
    return (
      <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-700">
        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
          <ShoppingBag size={18} className="text-primary-600 dark:text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-slate-100 truncate">{value.productName}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {value.meters || 3}{isRTL ? 'متر' : 'm'} × {value.meterPrice} ر.س = {totalPrice} ر.س
          </p>
        </div>
        <button
          onClick={() => onChange({ type: value.type })}
          className="text-xs text-red-500 hover:text-red-700 font-semibold"
        >
          {isRTL ? 'تغيير' : 'Change'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Source Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleSelectType('shop')}
          className={`p-3 rounded-xl border-2 text-center transition-all ${
            value.type === 'shop'
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
          }`}
        >
          <Store size={20} className="mx-auto mb-1" style={{ color: value.type === 'shop' ? '#00373E' : '#9CA3AF' }} />
          <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{isRTL ? 'قماش المتجر' : 'Shop Fabric'}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{isRTL ? 'المندوب يحضر عينات' : 'Rep brings samples'}</p>
        </button>
        <button
          onClick={() => handleSelectType('marketplace')}
          className={`p-3 rounded-xl border-2 text-center transition-all ${
            value.type === 'marketplace'
              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
          }`}
        >
          <Globe size={20} className="mx-auto mb-1" style={{ color: value.type === 'marketplace' ? '#00373E' : '#9CA3AF' }} />
          <p className="text-sm font-bold text-gray-800 dark:text-slate-200">{isRTL ? 'سوق الأقمشة' : 'Marketplace'}</p>
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{isRTL ? 'تصفح كتالوج التجار' : 'Browse merchant catalog'}</p>
        </button>
      </div>

      {/* Marketplace Catalog */}
      {value.type === 'marketplace' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-full border border-gray-200 dark:border-slate-600 px-3 py-2">
            <Search size={14} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? 'ابحث عن قماش...' : 'Search fabric...'}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 dark:text-slate-200"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FABRIC_CATEGORIES.map(c => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.id ? '' : c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  category === c.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                }`}
              >
                {c.icon}
                {c.ar}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary-600" size={24} /></div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {products.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-3 rounded-xl border-2 text-start transition-all ${
                    value.productId === product.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-100 dark:border-slate-700 hover:border-gray-200'
                  }`}
                >
                  <div className="w-full h-20 bg-gray-100 dark:bg-slate-700 rounded-lg mb-2 overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.nameAr || product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package size={24} />
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate">{product.nameAr || product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">{product.price} ر.س/م</span>
                    {product.merchantName && (
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 truncate ml-1">{product.merchantName}</span>
                    )}
                  </div>
                </button>
              ))}
              {products.length === 0 && !loading && (
                <div className="col-span-2 py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                  {isRTL ? 'لا توجد أقمشة متاحة' : 'No fabrics available'}
                </div>
              )}
            </div>
          )}

          {/* Meter Selection */}
          {value.productId && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-sm text-gray-600 dark:text-slate-400">{isRTL ? 'عدد الأمتار:' : 'Meters:'}</span>
              <div className="flex items-center gap-2">
                {[2, 2.5, 3, 3.5, 4, 5].map(m => (
                  <button
                    key={m}
                    onClick={() => { setMeters(m); onChange({ ...value, meters: m, meterPrice: value.meterPrice }); }}
                    className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                      meters === m
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <span className="ms-auto font-bold text-primary-700 dark:text-primary-400">{totalPrice} ر.س</span>
            </div>
          )}
        </div>
      )}

      {/* Shop Fabric Note */}
      {value.type === 'shop' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-200">
          <p className="font-semibold">{isRTL ? 'اختيار القماش مع المندوب' : 'Fabric selection with rep'}</p>
          <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
            {isRTL
              ? 'سيحضر المندوب عينات أقمشة من المتجر لتختار منها أثناء الزيارة'
              : 'The rep will bring fabric samples from the shop for you to choose during the visit'}
          </p>
        </div>
      )}
    </div>
  );
}
