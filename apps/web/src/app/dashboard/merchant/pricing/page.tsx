'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { Layers, Plus, Trash2, Edit3, Save, X, Percent, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import toast from 'react-hot-toast';

interface PricingTier {
  id: string;
  productId: string;
  productName?: string;
  minQuantity: number;
  discountPercent: number;
  b2bPrice?: number;
  b2cPrice?: number;
  isActive: boolean;
}

export default function MerchantPricingPage() {
  const { isRTL } = useAppStore();
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    productId: '',
    productName: '',
    minQuantity: '',
    discountPercent: '',
    b2bPrice: '',
    b2cPrice: '',
  });

  useEffect(() => {
    let active = true;
    pricingApi.getTiers()
      .then((data) => { if (active) setTiers(data); })
      .catch(() => { if (active) setTiers([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleAdd = () => {
    if (!form.minQuantity || !form.discountPercent) {
      toast.error(isRTL ? 'أكمل البيانات المطلوبة' : 'Complete required fields');
      return;
    }
    const newTier: PricingTier = {
      id: Date.now().toString(),
      productId: form.productId || 'custom',
      productName: form.productName || 'منتج مخصص',
      minQuantity: Number(form.minQuantity),
      discountPercent: Number(form.discountPercent),
      b2bPrice: form.b2bPrice ? Number(form.b2bPrice) : undefined,
      b2cPrice: form.b2cPrice ? Number(form.b2cPrice) : undefined,
      isActive: true,
    };
    setTiers([...tiers, newTier]);
    setShowAdd(false);
    setForm({ productId: '', productName: '', minQuantity: '', discountPercent: '', b2bPrice: '', b2cPrice: '' });
    toast.success(isRTL ? 'تمت إضافة شريحة التسعير' : 'Pricing tier added');
  };

  const handleDelete = (id: string) => {
    setTiers(tiers.filter((t) => t.id !== id));
    toast.success(isRTL ? 'تم الحذف' : 'Deleted');
  };

  const handleToggleActive = (id: string) => {
    setTiers(tiers.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t)));
  };

  const groupedTiers = tiers.reduce((acc, tier) => {
    const key = tier.productId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tier);
    return acc;
  }, {} as Record<string, PricingTier[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#00373E]">{isRTL ? 'التسعير المتدرّج' : 'Tiered Pricing'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          {isRTL ? 'إضافة شريحة' : 'Add Tier'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-5 bg-[#F2E8D4]/20 border-[#D4AF37]/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="font-semibold text-[#00373E] mb-1">{isRTL ? 'خصم كمّي للطلبات الكبيرة' : 'Volume Discount for Large Orders'}</p>
            <p className="text-sm text-[#735B4D]">
              {isRTL
                ? 'حدد شرائح التسعير بناءً على الكمية. الخياطون يحصلون على خصومات تلقائياً عند تجاوز الحد الأدنى.'
                : 'Define pricing tiers based on quantity. Tailors get automatic discounts when exceeding minimum thresholds.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Pricing Tiers */}
      <div className="space-y-6">
        {Object.entries(groupedTiers).map(([productId, productTiers]) => (
          <Card key={productId} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-[#D4AF37]" />
                <h3 className="font-bold text-[#00373E]">{productTiers[0].productName || productId}</h3>
                <Badge variant="primary" size="sm">{productTiers.length} {isRTL ? 'شرائح' : 'tiers'}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              {productTiers
                .sort((a, b) => a.minQuantity - b.minQuantity)
                .map((tier) => (
                  <div
                    key={tier.id}
                    className={`p-4 rounded-xl border transition-all ${
                      tier.isActive
                        ? 'bg-white border-[#D0D6D7]/30'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-[#735B4D]">{isRTL ? 'من' : 'From'}</p>
                          <p className="text-xl font-bold text-[#00373E]">{tier.minQuantity}</p>
                          <p className="text-xs text-[#735B4D]">{isRTL ? 'وحدة' : 'units'}</p>
                        </div>
                        <div className="h-10 w-px bg-[#D0D6D7]/30" />
                        <div className="text-center">
                          <p className="text-xs text-[#735B4D]">{isRTL ? 'الخصم' : 'Discount'}</p>
                          <p className="text-xl font-bold text-[#D4AF37] flex items-center gap-1">
                            <Percent size={16} />
                            {tier.discountPercent}%
                          </p>
                        </div>
                        {(tier.b2bPrice || tier.b2cPrice) && (
                          <>
                            <div className="h-10 w-px bg-[#D0D6D7]/30" />
                            <div className="text-center">
                              <p className="text-xs text-[#735B4D]">B2B</p>
                              <p className="text-lg font-bold text-[#00373E]">{tier.b2bPrice ? formatCurrency(tier.b2bPrice) : '—'}</p>
                            </div>
                            <div className="h-10 w-px bg-[#D0D6D7]/30" />
                            <div className="text-center">
                              <p className="text-xs text-[#735B4D]">B2C</p>
                              <p className="text-lg font-bold text-[#00373E]">{tier.b2cPrice ? formatCurrency(tier.b2cPrice) : '—'}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(tier.id)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            tier.isActive
                              ? 'bg-[#2E7D32]/10 text-[#2E7D32]'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {tier.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'معطّل' : 'Inactive')}
                        </button>
                        <button
                          onClick={() => handleDelete(tier.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Tier Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRTL ? 'إضافة شريحة تسعير' : 'Add Pricing Tier'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              {isRTL ? 'اسم المنتج' : 'Product Name'}
            </label>
            <input
              className="input-field"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder={isRTL ? 'مثال: نياقة أبيض' : 'e.g., White Nayaq'}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الحد الأدنى للكمية' : 'Min Quantity'}
              </label>
              <input
                className="input-field"
                type="number"
                value={form.minQuantity}
                onChange={(e) => setForm({ ...form, minQuantity: e.target.value })}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'نسبة الخصم %' : 'Discount %'}
              </label>
              <input
                className="input-field"
                type="number"
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                placeholder="5"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'سعر B2B (اختياري)' : 'B2B Price (optional)'}
              </label>
              <input
                className="input-field"
                type="number"
                value={form.b2bPrice}
                onChange={(e) => setForm({ ...form, b2bPrice: e.target.value })}
                placeholder="85"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'سعر B2C (اختياري)' : 'B2C Price (optional)'}
              </label>
              <input
                className="input-field"
                type="number"
                value={form.b2cPrice}
                onChange={(e) => setForm({ ...form, b2cPrice: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>
          <Button variant="primary" fullWidth onClick={handleAdd}>
            {isRTL ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
