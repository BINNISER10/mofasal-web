'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Package, AlertTriangle, TrendingDown, TrendingUp, Plus, Search } from 'lucide-react';

export default function InventoryPage() {
  const { isRTL } = useAppStore();

  const inventory = [
    { name: 'قماش أسود', stock: 2, min: 10, unit: 'متر', price: 45, usage: 120 },
    { name: 'قماش أبيض', stock: 45, min: 10, unit: 'متر', price: 40, usage: 85 },
    { name: 'قماش بيج', stock: 8, min: 10, unit: 'متر', price: 50, usage: 65 },
    { name: 'أزرار', stock: 500, min: 100, unit: 'قطعة', price: 2, usage: 1200 },
    { name: 'سحابات', stock: 30, min: 50, unit: 'قطعة', price: 5, usage: 200 },
    { name: 'خيوط', stock: 150, min: 20, unit: 'بكرة', price: 8, usage: 350 },
    { name: 'بطانة', stock: 15, min: 10, unit: 'متر', price: 25, usage: 60 },
    { name: 'دانتيل', stock: 3, min: 5, unit: 'متر', price: 35, usage: 25 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">{isRTL ? 'المخزون' : 'Inventory'}</h2>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg"><Search size={18} className="text-gray-500" /></button>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-primary-700 text-white rounded-lg text-sm font-semibold"><Plus size={16} />{isRTL ? 'إضافة' : 'Add'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><AlertTriangle size={22} /></div>
            <div><p className="text-sm text-gray-500">{isRTL ? 'مخزون منخفض' : 'Low Stock'}</p><p className="text-2xl font-bold text-red-600">3</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><Package size={22} /></div>
            <div><p className="text-sm text-gray-500">{isRTL ? 'إجمالي المواد' : 'Total Items'}</p><p className="text-2xl font-bold text-gray-900">24</p></div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><TrendingDown size={22} /></div>
            <div><p className="text-sm text-gray-500">{isRTL ? 'الاستخدام الشهري' : 'Monthly Usage'}</p><p className="text-2xl font-bold text-gray-900">{formatCurrency(4250)}</p></div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-right px-4 py-3 font-semibold text-gray-600">{isRTL ? 'المادة' : 'Item'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">{isRTL ? 'الوحدة' : 'Unit'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">{isRTL ? 'المخزون' : 'Stock'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">{isRTL ? 'الحد الأدنى' : 'Min'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">{isRTL ? 'سعر الوحدة' : 'Unit Price'}</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">{isRTL ? 'الاستخدام' : 'Usage'}</th>
            </tr></thead>
            <tbody>
              {inventory.map((item, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                  <td className="px-4 py-3">
                    <span className={item.stock <= item.min ? 'text-red-600 font-bold' : 'font-semibold'}>{item.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.min}</td>
                  <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-1">{item.usage} <TrendingUp size={14} className="text-gray-400" /></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
