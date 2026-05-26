'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  DollarSign, TrendingUp, TrendingDown, Settings2, Percent,
  Building2, ShoppingBag, ChevronDown, ChevronUp, Save,
  BarChart3, Users, CheckCircle2,
} from 'lucide-react';

const SHOP_COMMISSIONS = [
  { id: 'sh1', name: 'خياطة الرجال الراقية', type: 'TAILOR', rate: 8, earned: 12400, ordersCount: 48, tier: 'gold' },
  { id: 'sh2', name: 'أناقة الخليج', type: 'TAILOR', rate: 10, earned: 8200, ordersCount: 32, tier: 'silver' },
  { id: 'sh3', name: 'الديوان للأزياء', type: 'TAILOR', rate: 12, earned: 5600, ordersCount: 19, tier: 'bronze' },
  { id: 'sh4', name: 'تجارة الأقمشة الفاخرة', type: 'MERCHANT', rate: 6, earned: 18900, ordersCount: 87, tier: 'gold' },
  { id: 'sh5', name: 'سوق النسيج العربي', type: 'MERCHANT', rate: 8, earned: 9300, ordersCount: 54, tier: 'silver' },
];

const TIER_CONFIG = {
  gold:   { ar: 'ذهبي', en: 'Gold',   color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
  silver: { ar: 'فضي',  en: 'Silver', color: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300' },
  bronze: { ar: 'برونزي',en: 'Bronze',color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
};

const DEFAULT_RATES = { tailor_default: 10, merchant_default: 8, measurement_rep: 15, platform_vat_share: 5 };

export default function CommissionsPage() {
  const { isRTL } = useAppStore();
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [shopRates, setShopRates] = useState<Record<string, number>>(
    Object.fromEntries(SHOP_COMMISSIONS.map(s => [s.id, s.rate]))
  );
  const [expandedShop, setExpandedShop] = useState<string | null>(null);

  const totalEarned = SHOP_COMMISSIONS.reduce((a, b) => a + b.earned, 0);

  const handleSaveGlobal = () => {
    toast.success(isRTL ? 'تم حفظ معدلات العمولة الافتراضية' : 'Default commission rates saved');
  };

  const handleSaveShop = (id: string) => {
    toast.success(isRTL ? 'تم حفظ معدل العمولة للمتجر' : 'Shop commission rate saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100">{isRTL ? 'إدارة العمولات' : 'Commission Management'}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{isRTL ? 'تحكم في نسب عمولة المنصة لكل المتاجر والتجار' : 'Control platform commission rates for all shops and merchants'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label={isRTL ? 'إجمالي العمولات' : 'Total Commissions'} value={`${totalEarned.toLocaleString()} ر.س`} icon={<DollarSign size={20} />} trend={12} />
        <StatsCard label={isRTL ? 'متجر نشط' : 'Active Shops'} value={SHOP_COMMISSIONS.length.toString()} icon={<Building2 size={20} />} trend={3} />
        <StatsCard label={isRTL ? 'عمولة خياطة' : 'Tailor Rate'} value={`${rates.tailor_default}%`} icon={<Percent size={20} />} />
        <StatsCard label={isRTL ? 'عمولة تاجر' : 'Merchant Rate'} value={`${rates.merchant_default}%`} icon={<ShoppingBag size={20} />} />
      </div>

      {/* Global Rates */}
      <Card className="p-5 dark:bg-slate-800/60">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Settings2 size={18} className="text-primary-600" />
            {isRTL ? 'معدلات العمولة الافتراضية' : 'Default Commission Rates'}
          </h3>
          <Button variant="primary" size="sm" icon={<Save size={14} />} onClick={handleSaveGlobal}>
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'tailor_default', labelAr: 'خياطة - الافتراضي', labelEn: 'Tailor - Default' },
            { key: 'merchant_default', labelAr: 'تاجر - الافتراضي', labelEn: 'Merchant - Default' },
            { key: 'measurement_rep', labelAr: 'مندوب القياس', labelEn: 'Measurement Rep' },
            { key: 'platform_vat_share', labelAr: 'حصة المنصة من الضريبة', labelEn: 'Platform VAT Share' },
          ].map(item => (
            <div key={item.key} className="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase block mb-2">
                {isRTL ? item.labelAr : item.labelEn}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0} max={50} step={0.5}
                  value={rates[item.key as keyof typeof rates]}
                  onChange={(e) => setRates(prev => ({ ...prev, [item.key]: +e.target.value }))}
                  className="w-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-bold text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-lg font-black text-primary-600">%</span>
                <div className="flex gap-1 ms-auto">
                  <button onClick={() => setRates(prev => ({ ...prev, [item.key]: Math.max(0, prev[item.key as keyof typeof rates] - 0.5) }))} className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-500 text-sm font-bold">−</button>
                  <button onClick={() => setRates(prev => ({ ...prev, [item.key]: Math.min(50, prev[item.key as keyof typeof rates] + 0.5) }))} className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-600 flex items-center justify-center text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-500 text-sm font-bold">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Per-Shop Rates */}
      <Card className="dark:bg-slate-800/60 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 size={18} className="text-primary-600" />
            {isRTL ? 'عمولات مخصصة للمتاجر' : 'Custom Shop Commissions'}
          </h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-slate-700">
          {SHOP_COMMISSIONS.map(shop => (
            <div key={shop.id}>
              <button
                onClick={() => setExpandedShop(expandedShop === shop.id ? null : shop.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-start"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 ${shop.type === 'TAILOR' ? 'bg-primary-600' : 'bg-amber-600'}`}>
                  {shop.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-slate-100 text-sm">{shop.name}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_CONFIG[shop.tier as keyof typeof TIER_CONFIG].color}`}>
                      {isRTL ? TIER_CONFIG[shop.tier as keyof typeof TIER_CONFIG].ar : TIER_CONFIG[shop.tier as keyof typeof TIER_CONFIG].en}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 dark:text-slate-500">
                    <span>{shop.ordersCount} {isRTL ? 'طلب' : 'orders'}</span>
                    <span>{shop.earned.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'} {isRTL ? 'عمولة' : 'earned'}</span>
                  </div>
                </div>
                <div className="text-end">
                  <p className="text-lg font-black text-primary-600 dark:text-primary-400">{shopRates[shop.id]}%</p>
                </div>
                {expandedShop === shop.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {expandedShop === shop.id && (
                <div className="px-4 pb-4 bg-gray-50/50 dark:bg-slate-700/30">
                  <div className="flex items-center gap-4 pt-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 flex-shrink-0">
                      {isRTL ? 'نسبة العمولة:' : 'Commission Rate:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min={0} max={50} step={0.5}
                        value={shopRates[shop.id]}
                        onChange={(e) => setShopRates(prev => ({ ...prev, [shop.id]: +e.target.value }))}
                        className="w-20 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-bold text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <span className="font-black text-primary-600">%</span>
                    </div>
                    <Button size="sm" variant="primary" icon={<CheckCircle2 size={14} />} onClick={() => handleSaveShop(shop.id)}>
                      {isRTL ? 'حفظ' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
