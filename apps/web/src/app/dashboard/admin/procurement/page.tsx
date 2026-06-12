'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { procurementApi, PurchaseOrder } from '@/lib/api/procurement';
import { Package, Plus, Search, Filter, Truck, FileText, CheckCircle2, Clock, XCircle, Calendar, Building2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  DRAFT: { label: 'مسودة', labelEn: 'Draft', variant: 'neutral' as const, icon: <FileText size={14} /> },
  PENDING: { label: 'قيد الانتظار', labelEn: 'Pending', variant: 'warning' as const, icon: <Clock size={14} /> },
  CONFIRMED: { label: 'مؤكد', labelEn: 'Confirmed', variant: 'primary' as const, icon: <CheckCircle2 size={14} /> },
  RECEIVED: { label: 'مستلم', labelEn: 'Received', variant: 'success' as const, icon: <CheckCircle2 size={14} /> },
  CANCELLED: { label: 'ملغي', labelEn: 'Cancelled', variant: 'danger' as const, icon: <XCircle size={14} /> },
};

export default function AdminProcurementPage() {
  const { isRTL } = useAppStore();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await procurementApi.getPurchaseOrders();
        setOrders(data.items);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const [form, setForm] = useState({
    supplierId: '',
    expectedDelivery: '',
    items: [{ name: '', quantity: 1, unitPrice: 0 }],
  });

  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                         (o.supplier?.name || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = filtered.filter((o) => o.status === 'PENDING').length;
  const totalValue = filtered.reduce((sum, o) => sum + o.totalAmount, 0);

  const getStatusConfig = (status: string) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  const handleConfirm = async (id: string) => {
    try {
      await procurementApi.updateStatus(id, 'CONFIRMED');
      toast.success(isRTL ? 'تم تأكيد الطلب' : 'Order confirmed');
      const data = await procurementApi.getPurchaseOrders();
      if (data.items.length > 0) setOrders(data.items);
    } catch (error) {
      console.error('Failed to confirm order:', error);
      toast.error(isRTL ? 'فشل تأكيد الطلب' : 'Failed to confirm order');
    }
  };

  const handleReceive = async (id: string) => {
    try {
      await procurementApi.updateStatus(id, 'RECEIVED');
      toast.success(isRTL ? 'تم استلام الطلب' : 'Order received');
      const data = await procurementApi.getPurchaseOrders();
      if (data.items.length > 0) setOrders(data.items);
    } catch (error) {
      console.error('Failed to receive order:', error);
      toast.error(isRTL ? 'فشل استلام الطلب' : 'Failed to receive order');
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await procurementApi.updateStatus(id, 'CANCELLED');
      toast.success(isRTL ? 'تم إلغاء الطلب' : 'Order cancelled');
      const data = await procurementApi.getPurchaseOrders();
      if (data.items.length > 0) setOrders(data.items);
    } catch (error) {
      console.error('Failed to cancel order:', error);
      toast.error(isRTL ? 'فشل إلغاء الطلب' : 'Failed to cancel order');
    }
  };

  const handleCreate = async () => {
    const item = form.items[0];
    if (!item.name || item.unitPrice <= 0) {
      toast.error(isRTL ? 'أدخل اسم الصنف والسعر' : 'Enter item name and price');
      return;
    }
    try {
      await procurementApi.createPurchaseOrder({
        supplierId: form.supplierId || undefined,
        expectedDate: form.expectedDelivery || undefined,
        items: form.items.filter((i) => i.name).map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
      });
      toast.success(isRTL ? 'تم إنشاء أمر الشراء' : 'Purchase order created');
      setShowAdd(false);
      setForm({ supplierId: '', expectedDelivery: '', items: [{ name: '', quantity: 1, unitPrice: 0 }] });
      const data = await procurementApi.getPurchaseOrders();
      setOrders(data.items);
    } catch {
      toast.error(isRTL ? 'فشل إنشاء الأمر' : 'Failed to create order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المشتريات' : 'Procurement'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          {isRTL ? 'أمر شراء جديد' : 'New Purchase Order'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الطلبات' : 'Total Orders'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{orders.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
              <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/30 text-gold-600 flex items-center justify-center">
              <Package size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي القيمة' : 'Total Value'}</p>
              <p className="text-2xl font-bold text-gold-600">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="input-field pl-10"
              placeholder={isRTL ? 'بحث برقم الطلب أو المورد...' : 'Search by order number or supplier...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">{isRTL ? 'كل الحالات' : 'All Status'}</option>
            <option value="PENDING">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="CONFIRMED">{isRTL ? 'مؤكد' : 'Confirmed'}</option>
            <option value="SHIPPED">{isRTL ? 'قيد الشحن' : 'Shipped'}</option>
            <option value="RECEIVED">{isRTL ? 'مستلم' : 'Received'}</option>
            <option value="CANCELLED">{isRTL ? 'ملغي' : 'Cancelled'}</option>
          </select>
        </div>
      </Card>

      {/* Orders List */}
      <div className="grid gap-4">
        {filtered.map((order) => {
          const config = getStatusConfig(order.status);
          return (
            <Card key={order.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{order.orderNumber}</p>
                      <Badge variant={config.variant} size="sm">
                        <span className="flex items-center gap-1">
                          {config.icon}
                          {isRTL ? config.label : config.labelEn}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {order.supplierName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {order.createdAt}
                      </span>
                      {order.expectedDelivery && (
                        <span className="flex items-center gap-1">
                          <Truck size={12} /> {isRTL ? 'تسليم متوقع' : 'Expected'}: {order.expectedDelivery}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500 dark:text-slate-400">{order.items.length} {isRTL ? 'صنف' : 'item(s)'} • </span>
                      <span className="font-bold text-gold-600">{formatCurrency(order.grandTotal)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleCancel(order.id)}>
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleConfirm(order.id)}>
                        {isRTL ? 'تأكيد' : 'Confirm'}
                      </Button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button size="sm" variant="primary" onClick={() => handleReceive(order.id)}>
                      {isRTL ? 'استلام' : 'Receive'}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}>
                    {isRTL ? 'التفاصيل' : 'Details'}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={selectedOrder.orderNumber}
          size="md"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'المورد' : 'Supplier'}</p>
                <p className="font-medium">{selectedOrder.supplierName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</p>
                <Badge variant={getStatusConfig(selectedOrder.status).variant} size="sm">
                  {isRTL ? getStatusConfig(selectedOrder.status).label : getStatusConfig(selectedOrder.status).labelEn}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{isRTL ? 'الأصناف' : 'Items'}</p>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'المجموع' : 'Subtotal'}</span>
                <span>{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">{isRTL ? 'الضريبة (15%)' : 'VAT (15%)'}</span>
                <span>{formatCurrency(selectedOrder.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>{isRTL ? 'الإجمالي' : 'Total'}</span>
                <span className="text-primary-600">{formatCurrency(selectedOrder.grandTotal)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* New PO Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRTL ? 'أمر شراء جديد' : 'New Purchase Order'} size="md">
        <div className="space-y-4">
          <input className="input-field w-full" placeholder={isRTL ? 'اسم المورد (اختياري)' : 'Supplier name (optional)'} value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} />
          <input type="date" className="input-field w-full" value={form.expectedDelivery} onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })} />
          <input className="input-field w-full" placeholder={isRTL ? 'اسم الصنف' : 'Item name'} value={form.items[0].name} onChange={(e) => setForm({ ...form, items: [{ ...form.items[0], name: e.target.value }] })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min={1} className="input-field" placeholder={isRTL ? 'الكمية' : 'Qty'} value={form.items[0].quantity} onChange={(e) => setForm({ ...form, items: [{ ...form.items[0], quantity: Number(e.target.value) }] })} />
            <input type="number" min={0} className="input-field" placeholder={isRTL ? 'سعر الوحدة' : 'Unit price'} value={form.items[0].unitPrice || ''} onChange={(e) => setForm({ ...form, items: [{ ...form.items[0], unitPrice: Number(e.target.value) }] })} />
          </div>
          <Button variant="primary" fullWidth onClick={handleCreate}>{isRTL ? 'إنشاء الأمر' : 'Create Order'}</Button>
        </div>
      </Modal>
    </div>
  );
}
