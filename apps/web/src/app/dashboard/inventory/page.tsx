'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { productsApi } from '@/lib/api/products';
import { formatCurrency } from '@/lib/utils/formatting';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Plus, Search, Loader2, Minus, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  stockQuantity: number;
  unit?: string;
  price: number;
  costPrice?: number;
}

export default function InventoryPage() {
  const { isRTL } = useAppStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productsApi.list({ limit: '100' });
      setProducts(res.products || []);
    } catch (err) {
      console.error('Failed to fetch products', err);
      toast.error(isRTL ? 'فشل تحميل المنتجات' : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (id: string, type: 'IN' | 'OUT', quantity: number) => {
    try {
      setAdjustingId(id);
      await productsApi.adjustStock(id, type, quantity, isRTL ? 'تعديل يدوي' : 'Manual adjustment');
      await fetchProducts();
      toast.success(isRTL ? 'تم تحديث المخزون' : 'Stock updated');
    } catch (err) {
      console.error('Failed to adjust stock', err);
      toast.error(isRTL ? 'فشل تحديث المخزون' : 'Failed to update stock');
    } finally {
      setAdjustingId(null);
    }
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const name = (p.nameAr || p.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length;
  const totalItems = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.stockQuantity * (p.costPrice || p.price || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00373E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#00373E]">{isRTL ? 'المخزون' : 'Inventory'}</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#735B4D]/40" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRTL ? 'بحث...' : 'Search...'}
              className="pr-9 pl-4 py-2 rounded-xl border border-[#D0D6D7]/30 bg-[#F2E8D4]/20 text-sm text-[#00373E] focus:outline-none focus:ring-2 focus:ring-[#00373E]/20"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#481719]/10 text-[#481719] flex items-center justify-center">
              <AlertTriangle size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'مخزون منخفض' : 'Low Stock'}</p>
              <p className="text-2xl font-bold text-[#481719]">{lowStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00373E]/10 text-[#00373E] flex items-center justify-center">
              <Package size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'إجمالي المواد' : 'Total Items'}</p>
              <p className="text-2xl font-bold text-[#00373E]">{totalItems}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <TrendingDown size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'قيمة المخزون' : 'Stock Value'}</p>
              <p className="text-2xl font-bold text-[#00373E]">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F2E8D4]/30 border-b border-[#D0D6D7]/20">
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'المنتج' : 'Product'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'الوحدة' : 'Unit'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'المخزون' : 'Stock'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'السعر' : 'Price'}</th>
                <th className="text-center px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#735B4D]/60">
                    {isRTL ? 'لا توجد منتجات' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-[#D0D6D7]/10 hover:bg-[#F2E8D4]/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#00373E]">
                      {product.nameAr || product.name}
                    </td>
                    <td className="px-4 py-3 text-[#735B4D]/60">
                      {product.unit || (isRTL ? 'قطعة' : 'piece')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={product.stockQuantity <= 5 ? 'text-[#481719] font-bold' : 'font-semibold text-[#00373E]'}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#00373E]">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAdjustStock(product.id, 'OUT', 1)}
                          disabled={adjustingId === product.id || product.stockQuantity <= 0}
                          className="w-8 h-8 rounded-lg bg-[#481719]/10 text-[#481719] flex items-center justify-center hover:bg-[#481719]/20 disabled:opacity-30 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <button
                          onClick={() => handleAdjustStock(product.id, 'IN', 1)}
                          disabled={adjustingId === product.id}
                          className="w-8 h-8 rounded-lg bg-[#00373E]/10 text-[#00373E] flex items-center justify-center hover:bg-[#00373E]/20 disabled:opacity-30 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
