'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { b2bApi, FabricMerchant, FabricSupplyOrder } from '@/lib/api/b2b';
import { productsApi, Product } from '@/lib/api/products';
import toast from 'react-hot-toast';
import {
  Package, Plus, Truck, Clock, CheckCircle2, XCircle, Loader2, Store, MapPin, Home,
} from 'lucide-react';

const STATUS: Record<string, { ar: string; variant: 'warning' | 'info' | 'success' | 'error' }> = {
  PENDING: { ar: 'قيد الانتظار', variant: 'warning' },
  CONFIRMED: { ar: 'مؤكد', variant: 'info' },
  ON_WAY: { ar: 'في الطريق', variant: 'info' },
  DELIVERED: { ar: 'تم التسليم', variant: 'success' },
  CANCELLED: { ar: 'ملغي', variant: 'error' },
};

export default function TailorFabricSupplyPage() {
  const { isRTL } = useAppStore();
  const [orders, setOrders] = useState<FabricSupplyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [merchants, setMerchants] = useState<FabricMerchant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [merchantShopId, setMerchantShopId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('3');
  const [deliveryTarget, setDeliveryTarget] = useState<'TAILOR_SHOP' | 'CUSTOMER_HOME'>('TAILOR_SHOP');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('الرياض');
  const [notes, setNotes] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await b2bApi.list({ limit: '50' });
      setOrders(res.items || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!showForm) return;
    b2bApi.listMerchants().then(setMerchants).catch(() => setMerchants([]));
  }, [showForm]);

  useEffect(() => {
    if (!merchantShopId) {
      setProducts([]);
      return;
    }
    setLoadingProducts(true);
    productsApi.list({ shopId: merchantShopId, limit: '50' })
      .then((res) => setProducts(res.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [merchantShopId]);

  const handleCreate = async () => {
    if (!merchantShopId || !productId) {
      toast.error(isRTL ? 'اختر التاجر والقماش' : 'Select merchant and fabric');
      return;
    }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      toast.error(isRTL ? 'أدخل الكمية بالأمتار' : 'Enter quantity in meters');
      return;
    }
    if (deliveryTarget === 'CUSTOMER_HOME' && street.trim().length < 3) {
      toast.error(isRTL ? 'أدخل عنوان العميل' : 'Enter customer address');
      return;
    }
    setSaving(true);
    try {
      await b2bApi.create({
        merchantShopId,
        items: [{ productId, quantity: qty }],
        deliveryTarget,
        deliveryAddress: deliveryTarget === 'CUSTOMER_HOME'
          ? { street, city, label: isRTL ? 'بيت العميل' : 'Customer home' }
          : undefined,
        notes: notes || undefined,
      });
      toast.success(isRTL ? 'تم إرسال طلب التوريد' : 'Supply order placed');
      setShowForm(false);
      setProductId('');
      setNotes('');
      fetchOrders();
    } catch (e: unknown) {
      toast.error((e as Error)?.message || (isRTL ? 'فشل الطلب' : 'Order failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await b2bApi.updateStatus(id, 'CANCELLED');
      toast.success(isRTL ? 'تم الإلغاء' : 'Cancelled');
      fetchOrders();
    } catch {
      toast.error(isRTL ? 'فشل الإلغاء' : 'Cancel failed');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">
            {isRTL ? 'طلب أقمشة B2B' : 'B2B Fabric Orders'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isRTL ? 'اطلب قماشاً من تاجر ووصّله لمحلك أو لبيت العميل' : 'Order fabric from merchants — deliver to shop or customer'}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowForm(true)}>
          {isRTL ? 'طلب جديد' : 'New order'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{isRTL ? 'لا توجد طلبات توريد بعد' : 'No supply orders yet'}</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowForm(true)}>
            {isRTL ? 'اطلب قماشاً الآن' : 'Order fabric now'}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS[order.status] || STATUS.PENDING;
            return (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-sm">{order.merchantShop?.nameAr || order.merchantShop?.name}</p>
                      <Badge variant={st.variant} size="sm">{st.ar}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{order.orderNumber} • {order.createdAt?.slice(0, 10)}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      {order.deliveryTarget === 'CUSTOMER_HOME' ? <Home size={12} /> : <Store size={12} />}
                      {order.deliveryTarget === 'CUSTOMER_HOME'
                        ? (isRTL ? 'توصيل لبيت العميل' : 'Customer home')
                        : (isRTL ? 'توصيل للمحل' : 'To tailor shop')}
                    </p>
                    {order.items?.map((it) => (
                      <p key={it.id} className="text-sm mt-2">{it.name} — {it.quantity} {isRTL ? 'م' : 'm'}</p>
                    ))}
                  </div>
                  <div className="text-end">
                    <p className="font-black text-primary-700">{order.grandTotal.toLocaleString()} ر.س</p>
                    {order.status === 'PENDING' && (
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => handleCancel(order.id)}>
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={isRTL ? 'طلب قماش من تاجر' : 'Order fabric from merchant'}
        size="lg"
        footer={(
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={() => setShowForm(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="primary" isLoading={saving} onClick={handleCreate}>
              {isRTL ? 'إرسال الطلب' : 'Submit order'}
            </Button>
          </div>
        )}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">{isRTL ? 'تاجر الأقمشة' : 'Fabric merchant'}</label>
            <select
              value={merchantShopId}
              onChange={(e) => { setMerchantShopId(e.target.value); setProductId(''); }}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            >
              <option value="">{isRTL ? 'اختر التاجر...' : 'Select merchant...'}</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>{m.nameAr || m.name} {m.city ? `— ${m.city}` : ''}</option>
              ))}
            </select>
          </div>

          {merchantShopId && (
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">{isRTL ? 'القماش' : 'Fabric'}</label>
              {loadingProducts ? (
                <p className="text-sm text-gray-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
              ) : (
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                >
                  <option value="">{isRTL ? 'اختر القماش...' : 'Select fabric...'}</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p as { nameAr?: string }).nameAr || p.name} — {p.price} ر.س/{isRTL ? 'م' : 'm'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">{isRTL ? 'الكمية (أمتار)' : 'Quantity (meters)'}</label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-2">{isRTL ? 'وجهة التوصيل' : 'Delivery destination'}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryTarget('TAILOR_SHOP')}
                className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-1 ${deliveryTarget === 'TAILOR_SHOP' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
              >
                <Store size={18} />
                {isRTL ? 'محل الخياط' : 'Tailor shop'}
              </button>
              <button
                type="button"
                onClick={() => setDeliveryTarget('CUSTOMER_HOME')}
                className={`p-3 rounded-xl border text-sm font-medium flex flex-col items-center gap-1 ${deliveryTarget === 'CUSTOMER_HOME' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}
              >
                <Home size={18} />
                {isRTL ? 'بيت العميل' : 'Customer home'}
              </button>
            </div>
          </div>

          {deliveryTarget === 'CUSTOMER_HOME' && (
            <div className="space-y-2">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={isRTL ? 'المدينة' : 'City'}
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder={isRTL ? 'الحي، الشارع، المبنى...' : 'Street address...'}
                className="w-full border rounded-xl px-3 py-2 text-sm"
              />
            </div>
          )}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
            rows={2}
            className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}
