'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  DollarSign, Percent, Building2, ShoppingBag,
  ChevronDown, ChevronUp, Save, Loader2,
} from 'lucide-react';

export default function CommissionsPage() {
  const { isRTL } = useAppStore();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopRates, setShopRates] = useState<Record<string, number>>({});
  const [expandedShop, setExpandedShop] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    adminApi.getCommissions()
      .then((data) => {
        setCommissions(data);
        setShopRates(Object.fromEntries(data.map((s: any) => [s.id, s.rate])));
      })
      .catch((err) => {
        console.error('Failed to fetch commissions', err);
        toast.error(isRTL ? 'فشل تحميل العمولات' : 'Failed to load commissions');
      })
      .finally(() => setLoading(false));
  }, [isRTL]);

  const totalEarned = commissions.reduce((a: number, b: any) => a + b.earned, 0);
  const avgRate = commissions.length > 0
    ? Math.round(commissions.reduce((a: number, b: any) => a + b.rate, 0) / commissions.length)
    : 0;

  const handleSaveShop = async (id: string) => {
    try {
      setSavingId(id);
      await adminApi.updateCommission(id, shopRates[id] || 0);
      toast.success(isRTL ? 'تم حفظ معدل العمولة' : 'Commission rate saved');
    } catch (err) {
      console.error('Failed to update commission', err);
      toast.error(isRTL ? 'فشل حفظ العمولة' : 'Failed to save commission');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#00373E]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-[#00373E]">{isRTL ? 'إدارة العمولات' : 'Commission Management'}</h2>
        <p className="text-sm text-[#735B4D]/60 mt-1">{isRTL ? 'تحكم في نسب عمولة المنصة لكل المتاجر والتجار' : 'Control platform commission rates for all shops and merchants'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={isRTL ? 'إجمالي العمولات' : 'Total Commissions'} value={`${totalEarned.toLocaleString()} ر.س`} icon={<DollarSign size={20} />} trend={12} href="/dashboard/admin/reports" />
        <StatsCard label={isRTL ? 'متجر نشط' : 'Active Shops'} value={commissions.length.toString()} icon={<Building2 size={20} />} trend={3} href="/dashboard/admin/shops" />
        <StatsCard label={isRTL ? 'متوسط العمولة' : 'Avg Rate'} value={`${avgRate}%`} icon={<Percent size={20} />} href="/dashboard/admin/commissions" />
        <StatsCard label={isRTL ? 'إجمالي الطلبات' : 'Total Orders'} value={commissions.reduce((a: number, b: any) => a + b.ordersCount, 0).toString()} icon={<ShoppingBag size={20} />} href="/dashboard/admin/orders" />
      </div>

      {/* Shop Commissions */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-[#D0D6D7]/20">
          <h3 className="font-bold text-[#00373E]">{isRTL ? 'عمولات المتاجر' : 'Shop Commissions'}</h3>
        </div>
        <div className="divide-y divide-[#D0D6D7]/10">
          {commissions.length === 0 ? (
            <div className="p-8 text-center text-[#735B4D]/60">
              {isRTL ? 'لا توجد متاجر' : 'No shops found'}
            </div>
          ) : (
            commissions.map((shop: any) => (
              <div key={shop.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F2E8D4]/30 flex items-center justify-center text-[#00373E] font-bold">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-[#00373E]">{shop.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={shop.tier === 'gold' ? 'gold' : shop.tier === 'silver' ? 'neutral' : 'accent'} size="sm">
                          {shop.tier === 'gold' ? (isRTL ? 'ذهبي' : 'Gold') : shop.tier === 'silver' ? (isRTL ? 'فضي' : 'Silver') : (isRTL ? 'برونزي' : 'Bronze')}
                        </Badge>
                        <span className="text-xs text-[#735B4D]/60">{shop.ordersCount} {isRTL ? 'طلب' : 'orders'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#00373E]">{shop.earned.toLocaleString()} ر.س</p>
                      <p className="text-xs text-[#735B4D]/60">{isRTL ? 'محقق' : 'earned'}</p>
                    </div>
                    <button
                      onClick={() => setExpandedShop(expandedShop === shop.id ? null : shop.id)}
                      className="p-2 rounded-lg hover:bg-[#F2E8D4]/30 transition-colors"
                    >
                      {expandedShop === shop.id ? <ChevronUp size={16} className="text-[#735B4D]" /> : <ChevronDown size={16} className="text-[#735B4D]" />}
                    </button>
                  </div>
                </div>

                {expandedShop === shop.id && (
                  <div className="mt-4 pt-4 border-t border-[#D0D6D7]/10">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-[#735B4D] mb-1 block">{isRTL ? 'نسبة العمولة (%)' : 'Commission Rate (%)'}</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={shopRates[shop.id] || 0}
                          onChange={(e) => setShopRates({ ...shopRates, [shop.id]: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-[#D0D6D7]/30 bg-white text-[#00373E] text-sm focus:outline-none focus:ring-2 focus:ring-[#00373E]/20"
                        />
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={savingId === shop.id}
                        onClick={() => handleSaveShop(shop.id)}
                        icon={<Save size={14} />}
                      >
                        {isRTL ? 'حفظ' : 'Save'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
