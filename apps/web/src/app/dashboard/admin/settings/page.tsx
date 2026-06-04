'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { adminApi } from '@/lib/api/admin';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import {
  Scissors,
  Store,
  Ruler,
  Smartphone,
  Truck,
  Star,
  Users,
  Warehouse,
  Calculator,
  CreditCard,
  Shield,
  Apple,
  Smartphone as SmartphoneIcon,
  Wallet,
  Banknote,
  Car,
  Truck as TruckIcon,
  Package,
  MapPin,
  Bell,
  Mail,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  Zap,
  Globe,
  MessageSquare,
} from 'lucide-react';

interface ModuleToggle {
  key: string;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: React.ReactNode;
  dependencies?: string[];
  dependents?: string[];
}

interface ModuleCategory {
  key: string;
  labelAr: string;
  labelEn: string;
  icon: React.ReactNode;
  modules: ModuleToggle[];
}

const categories: ModuleCategory[] = [
  {
    key: 'core',
    labelAr: 'الوحدات الأساسية',
    labelEn: 'Core Modules',
    icon: <Zap size={20} />,
    modules: [
      { key: 'tailoring_module', labelAr: 'وحدة الخياطة', labelEn: 'Tailoring Module', descriptionAr: 'تمكين خدمات الخياطة والتفصيل', descriptionEn: 'Enable tailoring and alteration services', icon: <Scissors size={18} />, dependents: ['onsite_measurement', 'digital_confirmation', 'order_tracking'] },
      { key: 'marketplace', labelAr: 'متجر الأقمشة', labelEn: 'Fabric Marketplace', descriptionAr: 'تمكين بيع وشراء الأقمشة عبر المنصة', descriptionEn: 'Enable fabric buying and selling on platform', icon: <Store size={18} /> },
      { key: 'rating_system', labelAr: 'نظام التقييم', labelEn: 'Rating System', descriptionAr: 'تمكين تقييم المتاجر والمنتجات', descriptionEn: 'Enable shop and product ratings', icon: <Star size={18} /> },
    ],
  },
  {
    key: 'payment',
    labelAr: 'طرق الدفع',
    labelEn: 'Payment Methods',
    icon: <CreditCard size={20} />,
    modules: [
      { key: 'mada', labelAr: 'مدى', labelEn: 'Mada', descriptionAr: 'قبول بطاقات مدى المحلية', descriptionEn: 'Accept local Mada cards', icon: <CreditCard size={18} /> },
      { key: 'visa_mastercard', labelAr: 'فيزا/ماستركارد', labelEn: 'Visa/Mastercard', descriptionAr: 'قبول بطاقات الائتمان الدولية', descriptionEn: 'Accept international credit cards', icon: <CreditCard size={18} /> },
      { key: 'apple_pay', labelAr: 'Apple Pay', labelEn: 'Apple Pay', descriptionAr: 'قبول الدفع عبر Apple Pay', descriptionEn: 'Accept Apple Pay payments', icon: <Apple size={18} /> },
      { key: 'stc_pay', labelAr: 'STC Pay', labelEn: 'STC Pay', descriptionAr: 'قبول الدفع عبر STC Pay', descriptionEn: 'Accept STC Pay payments', icon: <SmartphoneIcon size={18} /> },
      { key: 'tamara', labelAr: 'تمارا', labelEn: 'Tamara', descriptionAr: 'خدمة الدفع بالتقسيط تمارا', descriptionEn: 'Tamara buy-now-pay-later service', icon: <Wallet size={18} /> },
      { key: 'tabby', labelAr: 'تابي', labelEn: 'Tabby', descriptionAr: 'خدمة الدفع بالتقسيط تابي', descriptionEn: 'Tabby BNPL service', icon: <Wallet size={18} /> },
      { key: 'cod', labelAr: 'الدفع عند الاستلام', labelEn: 'Cash on Delivery', descriptionAr: 'الدفع نقداً عند استلام الطلب', descriptionEn: 'Cash payment on delivery', icon: <Banknote size={18} /> },
      { key: 'bank_transfer', labelAr: 'التحويل البنكي', labelEn: 'Bank Transfer', descriptionAr: 'الدفع عبر التحويل البنكي المباشر', descriptionEn: 'Payment via direct bank transfer', icon: <Banknote size={18} /> },
    ],
  },
  {
    key: 'delivery',
    labelAr: 'مزودي التوصيل',
    labelEn: 'Delivery Providers',
    icon: <Truck size={20} />,
    modules: [
      { key: 'shop_vehicle', labelAr: 'مركبة المتجر', labelEn: 'Shop Vehicle', descriptionAr: 'التوصيل بواسطة مركبات المتجر الخاصة', descriptionEn: 'Delivery using shop-owned vehicles', icon: <Car size={18} /> },
      { key: 'uber_delivery', labelAr: 'Uber Direct', labelEn: 'Uber Direct', descriptionAr: 'التوصيل عبر خدمة Uber المباشرة', descriptionEn: 'Delivery via Uber Direct', icon: <Car size={18} /> },
      { key: 'careen', labelAr: 'كارين', labelEn: 'Careen', descriptionAr: 'التوصيل عبر تطبيق كارين', descriptionEn: 'Delivery via Careen app', icon: <MapPin size={18} /> },
      { key: 'jeeny', labelAr: 'جيني', labelEn: 'Jeeny', descriptionAr: 'التوصيل عبر تطبيق جيني', descriptionEn: 'Delivery via Jeeny app', icon: <MapPin size={18} /> },
      { key: 'smsa', labelAr: 'SMSA', labelEn: 'SMSA', descriptionAr: 'التوصيل عبر شركة SMSA', descriptionEn: 'Delivery via SMSA Express', icon: <Package size={18} /> },
      { key: 'aramex', labelAr: 'أرامكس', labelEn: 'Aramex', descriptionAr: 'التوصيل عبر شركة أرامكس', descriptionEn: 'Delivery via Aramex', icon: <Package size={18} /> },
    ],
  },
  {
    key: 'integrations',
    labelAr: 'التكاملات',
    labelEn: 'Integrations',
    icon: <Globe size={20} />,
    modules: [
      { key: 'firebase', labelAr: 'Firebase', labelEn: 'Firebase', descriptionAr: 'خدمات Firebase السحابية للإشعارات', descriptionEn: 'Firebase cloud services for notifications', icon: <Bell size={18} /> },
      { key: 'twilio_sms', labelAr: 'Twilio SMS', labelEn: 'Twilio SMS', descriptionAr: 'خدمة إرسال الرسائل النصية عبر Twilio', descriptionEn: 'SMS service via Twilio', icon: <MessageSquare size={18} /> },
      { key: 'email_service', labelAr: 'خدمة البريد', labelEn: 'Email Service', descriptionAr: 'خدمة إرسال البريد الإلكتروني', descriptionEn: 'Email sending service', icon: <Mail size={18} /> },
      { key: 'zatca', labelAr: 'زاتكا ZATCA', labelEn: 'ZATCA Integration', descriptionAr: 'التكامل مع هيئة الزكاة والضريبة والجمارك للفوترة', descriptionEn: 'Zakat, Tax and Customs Authority integration for e-invoicing', icon: <FileText size={18} /> },
    ],
  },
  {
    key: 'features',
    labelAr: 'الميزات الإضافية',
    labelEn: 'Additional Features',
    icon: <Settings size={20} />,
    modules: [
      { key: 'onsite_measurement', labelAr: 'القياس في الموقع', labelEn: 'On-Site Measurement', descriptionAr: 'خدمة أخذ المقاسات في موقع العميل', descriptionEn: 'On-site measurement service at customer location', icon: <Ruler size={18} />, dependencies: ['tailoring_module'] },
      { key: 'digital_confirmation', labelAr: 'التأكيد الرقمي', labelEn: 'Digital Confirmation', descriptionAr: 'تأكيد الطلبات رقمياً قبل البدء', descriptionEn: 'Digital order confirmation before production', icon: <Smartphone size={18} />, dependencies: ['tailoring_module'] },
      { key: 'order_tracking', labelAr: 'تتبع الطلبات', labelEn: 'Order Tracking', descriptionAr: 'تتبع حالة الطلب خطوة بخطوة', descriptionEn: 'Step-by-step order status tracking', icon: <TruckIcon size={18} />, dependencies: ['tailoring_module'] },
      { key: 'staff_management', labelAr: 'إدارة الموظفين', labelEn: 'Staff Management', descriptionAr: 'إدارة الموظفين والمهام والصلاحيات', descriptionEn: 'Staff, task and permission management', icon: <Users size={18} /> },
      { key: 'inventory_management', labelAr: 'إدارة المخزون', labelEn: 'Inventory Management', descriptionAr: 'إدارة مخزون المواد والخامات', descriptionEn: 'Raw materials and supplies inventory', icon: <Warehouse size={18} /> },
      { key: 'accounting', labelAr: 'المحاسبة', labelEn: 'Accounting', descriptionAr: 'النظام المحاسبي والفواتير', descriptionEn: 'Accounting system and invoices', icon: <Calculator size={18} /> },
    ],
  },
];

export default function AdminSettingsPage() {
  const { isRTL } = useAppStore();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    core: true, payment: true, delivery: true, integrations: true, features: true,
  });
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>({});
  const [originalStates, setOriginalStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const keyType = useRef<Record<string, 'module' | 'config'>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [configsRes, modulesRes] = await Promise.all([
          adminApi.getConfigs(),
          adminApi.getModules(),
        ]);
        const states: Record<string, boolean> = {};
        (configsRes.configs || []).forEach((c: any) => {
          const key = c.key;
          states[key] = c.isEnabled ?? c.value === 'true';
          keyType.current[key] = 'config';
        });
        (modulesRes.modules || []).forEach((m: any) => {
          states[m.key] = m.isEnabled ?? true;
          keyType.current[m.key] = 'module';
        });
        const defaults: Record<string, boolean> = {
          tailoring_module: true, marketplace: true, onsite_measurement: true,
          digital_confirmation: true, order_tracking: true, rating_system: true,
          staff_management: true, inventory_management: true, accounting: true,
          mada: true, visa_mastercard: true, apple_pay: false, stc_pay: true,
          tamara: false, tabby: false, cod: true, bank_transfer: true,
          shop_vehicle: true, uber_delivery: false, careen: false, jeeny: false,
          smsa: true, aramex: true, firebase: true, twilio_sms: true,
          email_service: true, zatca: false,
        };
        const merged = { ...defaults, ...states };
        setModuleStates(merged);
        setOriginalStates(merged);
      } catch {
        const defaults: Record<string, boolean> = {
          tailoring_module: true, marketplace: true, onsite_measurement: true,
          digital_confirmation: true, order_tracking: true, rating_system: true,
          staff_management: true, inventory_management: true, accounting: true,
          mada: true, visa_mastercard: true, apple_pay: false, stc_pay: true,
          tamara: false, tabby: false, cod: true, bank_transfer: true,
          shop_vehicle: true, uber_delivery: false, careen: false, jeeny: false,
          smsa: true, aramex: true, firebase: true, twilio_sms: true,
          email_service: true, zatca: false,
        };
        setModuleStates(defaults);
        setOriginalStates(defaults);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  const [showWarning, setShowWarning] = useState<{ module: ModuleToggle; category: string } | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const toggleModule = (key: string, checked: boolean) => {
    if (!checked) {
      // Find module and its dependents
      for (const cat of categories) {
        const mod = cat.modules.find(m => m.key === key);
        if (mod) {
          const affectedDependents = (mod.dependents || []).filter(d => moduleStates[d]);
          if (affectedDependents.length > 0) {
            setShowWarning({ module: mod, category: cat.labelAr });
            return;
          }
        }
      }
    }
    setModuleStates((prev) => ({ ...prev, [key]: checked }));
  };

  const confirmDisable = () => {
    if (showWarning) {
      const affected = (showWarning.module.dependents || []).filter(d => moduleStates[d]);
      setModuleStates((prev) => {
        const next = { ...prev, [showWarning.module.key]: false };
        affected.forEach(d => { next[d] = false; });
        return next;
      });
      setShowWarning(null);
      toast.error(isRTL ? `تم تعطيل ${showWarning.module.labelAr} والخدمات المرتبطة بها` : `${showWarning.module.labelEn} and related services disabled`);
    }
  };

  const handleSave = () => {
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    setShowSaveConfirm(false);
    const changed: string[] = Object.keys(moduleStates).filter((k) => moduleStates[k] !== originalStates[k]);
    if (changed.length === 0) {
      toast.success(isRTL ? 'لا توجد تغييرات' : 'No changes');
      return;
    }
    const togglePromises = changed.map((key) =>
      keyType.current[key] === 'module'
        ? adminApi.toggleModule(key)
        : adminApi.toggleConfig(key)
    );
    try {
      await Promise.all(togglePromises);
      setOriginalStates({ ...moduleStates });
      toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الحفظ' : 'Failed to save'));
    }
  };

  if (loading) {
    return <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'لوحة التحكم الذكية' : 'Smart Control Panel'}</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'تحكم في تشغيل وإيقاف وحدات المنصة' : 'Control platform module toggles'}</p>
        </div>
        <Button variant="primary" onClick={handleSave} icon={<Settings size={18} />}>
          {isRTL ? 'حفظ الإعدادات' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <Card key={category.key} className="overflow-hidden">
            <button
              onClick={() => setExpandedCategories((prev) => ({ ...prev, [category.key]: !prev[category.key] }))}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  {category.icon}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? category.labelAr : category.labelEn}</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{category.modules.length} {isRTL ? 'وحدة' : 'modules'}</p>
                </div>
              </div>
              {expandedCategories[category.key] ? <ChevronUp size={20} className="text-gray-400 dark:text-slate-500" /> : <ChevronDown size={20} className="text-gray-400 dark:text-slate-500" />}
            </button>

            {expandedCategories[category.key] && (
              <div className="border-t border-gray-100 dark:border-slate-700 divide-y divide-gray-50 dark:divide-slate-700/50 px-5">
                {category.modules.map((mod) => (
                  <div key={mod.key} className="flex items-center gap-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
                      {mod.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">{isRTL ? mod.labelAr : mod.labelEn}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? mod.descriptionAr : mod.descriptionEn}</p>
                      {mod.dependencies && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                          {isRTL ? 'يعتمد على: ' : 'Depends on: '}
                          {mod.dependencies.map(d => isRTL ? categories.flatMap(c => c.modules).find(m => m.key === d)?.labelAr : categories.flatMap(c => c.modules).find(m => m.key === d)?.labelEn).join(', ')}
                        </p>
                      )}
                      {mod.dependents && (
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">
                          {isRTL ? 'الخدمات المرتبطة: ' : 'Linked services: '}
                          {mod.dependents.map(d => isRTL ? categories.flatMap(c => c.modules).find(m => m.key === d)?.labelAr : categories.flatMap(c => c.modules).find(m => m.key === d)?.labelEn).join(', ')}
                        </p>
                      )}
                    </div>
                    <Toggle
                      label={isRTL ? mod.labelAr : mod.labelEn}
                      checked={moduleStates[mod.key] ?? false}
                      onChange={(checked) => toggleModule(mod.key, checked)}
                      id={mod.key}
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-jahez-lg animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Scissors size={28} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 dark:text-slate-100 mb-2">
              {isRTL ? 'تحذير: تعطيل الخدمات المرتبطة' : 'Warning: Disabling Linked Services'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-4">
              {isRTL
                ? `سيؤدي تعطيل "${showWarning.module.labelAr}" إلى إيقاف الخدمات التالية أيضاً:`
                : `Disabling "${showWarning.module.labelEn}" will also disable the following services:`}
            </p>
            <div className="space-y-2 mb-6">
              {(showWarning.module.dependents || [])
                .filter(d => moduleStates[d])
                .map((depKey) => {
                  const depMod = categories.flatMap(c => c.modules).find(m => m.key === depKey);
                  if (!depMod) return null;
                  return (
                    <div key={depKey} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">{depMod.icon}</div>
                      <span className="text-sm font-medium text-red-700">
                        {isRTL ? depMod.labelAr : depMod.labelEn}
                      </span>
                    </div>
                  );
                })}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowWarning(null)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="danger" fullWidth onClick={confirmDisable}>
                {isRTL ? 'تأكيد التعطيل' : 'Confirm Disable'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-jahez-lg animate-slide-up text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Settings size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">
              {isRTL ? 'تأكيد الحفظ' : 'Confirm Save'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {isRTL ? 'هل أنت متأكد من حفظ إعدادات الوحدات؟' : 'Are you sure you want to save the module settings?'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowSaveConfirm(false)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button variant="primary" fullWidth onClick={confirmSave}>
                {isRTL ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
