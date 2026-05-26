'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Package, AlertTriangle, Plus, TrendingUp, TrendingDown } from 'lucide-react';

export default function MerchantInventoryPage() {
  const { isRTL } = useAppStore();

  const stock = [
    { name: 'قماش صوف إيطالي', stock: 45, min: 10, unit: 'متر', price: 180, sold: 120 },
    { name: 'حرير طبيعي', stock: 12, min: 5, unit: 'متر', price: 390, sold: 45 },
    { name: 'قطن مصري', stock: 200, min: 20, unit: 'متر', price: 65, sold: 350 },
    { name: 'كتان بلجيكي', stock: 4, min: 10, unit: 'متر', price: 145, sold: 30 },
    { name: 'مخمل فاخر', stock: 0, min: 5, unit: 'متر', price: 250, sold: 18 },
    { name: 'دانتيل سويسري', stock: 8, min: 10, unit: 'متر', price: 320, sold: 12 },
  ];

  const lowStockItems = stock.filter((i) => i.stock <= i.min);
  const outOfStock = stock.filter((i) => i.stock === 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة المخزون' : 'Inventory Management'}</h2>
        <button className="flex items-center gap-1 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-semibold"><Plus size={16} />{isRTL ? 'إضافة منتج' : 'Add Stock'}</button>
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
              <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المباع' : 'Sold'}</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</th>
            </tr></thead>
            <tbody>
              {stock.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className={`px-4 py-3 font-bold ${item.stock <= item.min ? 'text-red-600' : ''}`}>{item.stock}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{item.min}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{item.unit}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3">{item.sold}</td>
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
            { action: isRTL ? 'إضافة مخزون' : 'Stock Added', item: 'قطن مصري', qty: 50, date: '2024-03-15', type: 'in' },
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
