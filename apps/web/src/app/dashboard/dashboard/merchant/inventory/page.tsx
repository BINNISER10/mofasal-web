'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Plus, Check, X, Pencil } from 'lucide-react';
import { productsApi } from '@/lib/api/products';
import Link from 'next/link';
import toast from 'react-hot-toast';

const MIN_THRESHOLD = 10; // حد أدنى افتراضي للتنبيه

interface StockRow {
  id: string;
  name: string;
  stock: number;
  min: number;
  unit: string;
  price: number;
}

export default function MerchantInventoryPage() {
  const { isRTL } = useAppStore();
  const [stock, setStock] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ limit: '100' });
      setStock(res.products.map((p: any) => ({
        id: p.id,
        name: p.nameAr || p.name,
        stock: p.stockQuantity ?? p.stock ?? 0,
        min: MIN_THRESHOLD,
        unit: p.unit || 'متر',
        price: p.price || 0,
      })));
    } catch {
      // لا بيانات
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const saveStock = async (id: string) => {
    const val = Number(editVal);
    if (isNaN(val) || val < 0) { toast.error(isRTL ? 'قيمة غير صحيحة' : 'Invalid value'); return; }
    const current = stock.find((s) => s.id === id)?.stock ?? 0;
    const delta = val - current;
    setEditId(null);
    if (delta === 0) return;
    setStock((prev) => prev.map((s) => (s.id === id ? { ...s, stock: val } : s)));
    try {
      await productsApi.adjustStock(id, delta > 0 ? 'IN' : 'OUT', Math.abs(delta), isRTL ? 'تعديل يدوي' : 'Manual adjustment');
      toast.success(isRTL ? 'تم تحديث المخزون' : 'Stock updated');
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر التحديث' : 'Failed'));
      fetchStock();
    }
  };

  const lowStockItems = stock.filter((i) => i.stock <= i.min && i.stock > 0);
  const outOfStock = stock.filter((i) => i.stock === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة المخزون' : 'Inventory Management'}</h2>
        <Link href="/dashboard/merchant/products/add" className="flex items-center gap-1 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-semibold"><Plus size={16} />{isRTL ? 'إضافة منتج' : 'Add Stock'}</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle size={22} /></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'منتجات منخفضة' : 'Low Stock'}</p><p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center"><Package size={22} /></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي المنتجات' : 'Total Products'}</p><p className="text-2xl font-bold dark:text-slate-100">{stock.length}</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingDown size={22} /></div>
            <div><p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'نفد من المخزون' : 'Out of Stock'}</p><p className="text-2xl font-bold text-blue-600">{outOfStock.length}</p></div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المنتج' : 'Product'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المخزون' : 'Stock'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الحد الأدنى' : 'Min'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الوحدة' : 'Unit'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'السعر' : 'Price'}</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</th>
            </tr></thead>
            <tbody>
              {stock.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className={`px-4 py-3 font-bold ${item.stock <= item.min ? 'text-red-600' : ''}`}>
                    {editId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editVal}
                          onChange={(e) => setEditVal(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
                          autoFocus
                        />
                        <button onClick={() => saveStock(item.id)} className="text-green-600 p-1"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-red-600 p-1"><X size={16} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditId(item.id); setEditVal(String(item.stock)); }}
                        className="inline-flex items-center gap-1 hover:text-primary-700"
                      >
                        {item.stock}<Pencil size={12} className="text-gray-400" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{item.min}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{item.unit}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.stock === 0 ? 'error' : item.stock <= item.min ? 'warning' : 'success'} size="sm">
                      {item.stock === 0 ? (isRTL ? 'نفد' : 'Out') : item.stock <= item.min ? (isRTL ? 'منخفض' : 'Low') : (isRTL ? 'متوفر' : 'In Stock')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'حركة المخزون' : 'Stock Movement'}</h3>
        <div className="space-y-3">
          {[
            { action: isRTL ? 'إضافة مخزون' : 'Stock Added', item: 'قطن فاخر', qty: 50, date: '2024-03-15', type: 'in' },
            { action: isRTL ? 'بيع' : 'Sold', item: 'حرير طبيعي', qty: 2, date: '2024-03-14', type: 'out' },
            { action: isRTL ? 'إضافة مخزون' : 'Stock Added', item: 'صوف إيطالي', qty: 30, date: '2024-03-12', type: 'in' },
            { action: isRTL ? 'بيع' : 'Sold', item: 'مخمل فاخر', qty: 1, date: '2024-03-11', type: 'out' },
            { action: isRTL ? 'مرتجع' : 'Returned', item: 'كتان بلجيكي', qty: 1, date: '2024-03-10', type: 'in' },
          ].map((log, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'in' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {log.type === 'in' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div><p className="text-sm font-semibold dark:text-slate-200">{log.action}</p><p className="text-xs text-gray-500 dark:text-slate-400">{log.item} - {log.date}</p></div>
              </div>
              <span className={`font-bold ${log.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                {log.type === 'in' ? '+' : '-'}{log.qty}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
