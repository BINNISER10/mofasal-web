'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { ShoppingCart, Plus, Package, Clock, CheckCircle, XCircle, Loader2, Search } from 'lucide-react';
import { procurementApi } from '@/lib/api/procurement';
import toast from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  supplierName?: string;
  createdAt: string;
  expectedDate?: string;
  items?: Array<{ name: string; quantity: number; unitPrice: number }>;
}

const STATUS_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string; icon: any }> = {
  DRAFT: { labelAr: 'مسودة', labelEn: 'Draft', color: '#9E9E9E', icon: Clock },
  PENDING: { labelAr: 'قيد الانتظار', labelEn: 'Pending', color: '#E65100', icon: Clock },
  CONFIRMED: { labelAr: 'مؤكّد', labelEn: 'Confirmed', color: '#1565C0', icon: CheckCircle },
  DELIVERED: { labelAr: 'تم التسليم', labelEn: 'Delivered', color: '#2E7D32', icon: CheckCircle },
  RECEIVED: { labelAr: 'تم الاستلام', labelEn: 'Received', color: '#2E7D32', icon: CheckCircle },
  CANCELLED: { labelAr: 'ملغي', labelEn: 'Cancelled', color: '#C62828', icon: XCircle },
};

export default function ProcurementPage() {
  const { isRTL } = useAppStore();
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [newPo, setNewPo] = useState({ supplierName: '', itemName: '', quantity: 1, unitPrice: 0 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    procurementApi.getPurchaseOrders()
      .then((res) => {
        if (!active) return;
        setOrders(res.items.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          totalAmount: o.grandTotal || o.totalAmount,
          supplierName: o.supplier?.nameAr || o.supplier?.name,
          createdAt: o.createdAt,
          expectedDate: o.expectedDate,
          items: o.items?.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
        })));
      })
      .catch(() => { if (active) setOrders([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(term) ||
      (o.supplierName || '').toLowerCase().includes(term)
    );
  });

  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const StatusIcon = (status: string) => getStatusConfig(status).icon;

  const handleCreatePo = async () => {
    if (!newPo.itemName || newPo.unitPrice <= 0) {
      toast.error(isRTL ? 'أدخل اسم الصنف والسعر' : 'Enter item and price');
      return;
    }
    setCreating(true);
    try {
      const created = await procurementApi.createPurchaseOrder({
        items: [{ name: newPo.itemName, quantity: newPo.quantity, unitPrice: newPo.unitPrice }],
      });
      setOrders((prev) => [{
        id: created.id,
        orderNumber: created.orderNumber,
        status: created.status,
        totalAmount: created.grandTotal || created.totalAmount,
        supplierName: newPo.supplierName || created.supplier?.nameAr || created.supplier?.name,
        createdAt: created.createdAt,
        items: created.items?.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice })),
      }, ...prev]);
      toast.success(isRTL ? 'تم إنشاء أمر الشراء' : 'PO created');
      setShowAdd(false);
      setNewPo({ supplierName: '', itemName: '', quantity: 1, unitPrice: 0 });
    } catch {
      toast.error(isRTL ? 'فشل الإنشاء' : 'Create failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[#00373E]">{isRTL ? 'المشتريات' : 'Procurement'}</h2>
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
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
            {isRTL ? 'أمر شراء جديد' : 'New PO'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E65100]/10 text-[#E65100] flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'قيد الانتظار' : 'Pending'}</p>
              <p className="text-2xl font-bold text-[#E65100]">{orders.filter((o) => o.status === 'PENDING').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1565C0]/10 text-[#1565C0] flex items-center justify-center">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'مؤكّدة' : 'Confirmed'}</p>
              <p className="text-2xl font-bold text-[#1565C0]">{orders.filter((o) => o.status === 'CONFIRMED').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2E7D32]/10 text-[#2E7D32] flex items-center justify-center">
              <Package size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'تم التسليم' : 'Delivered'}</p>
              <p className="text-2xl font-bold text-[#2E7D32]">{orders.filter((o) => o.status === 'DELIVERED' || o.status === 'RECEIVED').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
              <ShoppingCart size={22} />
            </div>
            <div>
              <p className="text-sm text-[#735B4D]">{isRTL ? 'إجمالي القيمة' : 'Total Value'}</p>
              <p className="text-2xl font-bold text-[#D4AF37]">{formatCurrency(orders.reduce((sum, o) => sum + o.totalAmount, 0))}</p>
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
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'رقم الأمر' : 'PO Number'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'المورّد' : 'Supplier'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'القيمة' : 'Value'}</th>
                <th className="text-right px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="text-center px-4 py-3 font-semibold text-[#735B4D]">{isRTL ? 'إجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[#735B4D]/60">
                    {isRTL ? 'لا توجد أوامر شراء' : 'No purchase orders found'}
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const config = getStatusConfig(order.status);
                  return (
                    <tr key={order.id} className="border-b border-[#D0D6D7]/10 hover:bg-[#F2E8D4]/10 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#00373E]">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-[#735B4D]">{order.supplierName || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="primary"
                          size="sm"
                        >
                          <span className="flex items-center gap-1">
                            {React.createElement(StatusIcon(order.status), { size: 12 })}
                            {isRTL ? config.labelAr : config.labelEn}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#00373E]">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-3 text-[#735B4D]/60">{new Date(order.createdAt).toLocaleDateString('ar')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[#00373E] hover:text-[#00373E]/70 font-medium text-xs"
                          >
                            {isRTL ? 'عرض' : 'View'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`${isRTL ? 'تفاصيل أمر الشراء' : 'Purchase Order Details'} - ${selectedOrder.orderNumber}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#735B4D]">{isRTL ? 'المورّد' : 'Supplier'}</p>
                <p className="font-semibold text-[#00373E]">{selectedOrder.supplierName || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-[#735B4D]">{isRTL ? 'الحالة' : 'Status'}</p>
                <p className="font-semibold text-[#00373E]">
                  {isRTL ? getStatusConfig(selectedOrder.status).labelAr : getStatusConfig(selectedOrder.status).labelEn}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#735B4D]">{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</p>
                <p className="font-semibold text-[#00373E]">{new Date(selectedOrder.createdAt).toLocaleDateString('ar')}</p>
              </div>
              <div>
                <p className="text-sm text-[#735B4D]">{isRTL ? 'تاريخ التسليم المتوقع' : 'Expected Delivery'}</p>
                <p className="font-semibold text-[#00373E]">
                  {selectedOrder.expectedDate ? new Date(selectedOrder.expectedDate).toLocaleDateString('ar') : '—'}
                </p>
              </div>
            </div>

            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-[#735B4D] mb-2">{isRTL ? 'البنود' : 'Items'}</p>
                <div className="border border-[#D0D6D7]/30 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-[#F2E8D4]/30">
                      <tr>
                        <th className="text-right px-4 py-2 font-semibold text-[#735B4D]">{isRTL ? 'المنتج' : 'Product'}</th>
                        <th className="text-right px-4 py-2 font-semibold text-[#735B4D]">{isRTL ? 'الكمية' : 'Quantity'}</th>
                        <th className="text-right px-4 py-2 font-semibold text-[#735B4D]">{isRTL ? 'السعر' : 'Price'}</th>
                        <th className="text-right px-4 py-2 font-semibold text-[#735B4D]">{isRTL ? 'الإجمالي' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-[#D0D6D7]/10">
                          <td className="px-4 py-2 text-[#00373E]">{item.name}</td>
                          <td className="px-4 py-2 text-[#735B4D]">{item.quantity}</td>
                          <td className="px-4 py-2 text-[#735B4D]">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-2 font-semibold text-[#00373E]">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[#D0D6D7]/20">
              <p className="text-lg font-bold text-[#00373E]">{isRTL ? 'الإجمالي' : 'Total'}: {formatCurrency(selectedOrder.totalAmount)}</p>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add PO Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRTL ? 'أمر شراء جديد' : 'New Purchase Order'} size="lg">
        <div className="space-y-4">
          <div className="p-4 bg-[#F2E8D4]/20 rounded-xl text-sm text-[#735B4D]">
            {isRTL ? 'اطلب أقمشة من الموردين لمحل الخياطة' : 'Order fabric from suppliers for your shop'}
          </div>
          <input className="input-field w-full" placeholder={isRTL ? 'اسم المورد' : 'Supplier name'} value={newPo.supplierName} onChange={(e) => setNewPo({ ...newPo, supplierName: e.target.value })} />
          <input className="input-field w-full" placeholder={isRTL ? 'اسم القماش' : 'Fabric name'} value={newPo.itemName} onChange={(e) => setNewPo({ ...newPo, itemName: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" min={1} className="input-field" placeholder={isRTL ? 'الكمية (متر)' : 'Quantity (m)'} value={newPo.quantity} onChange={(e) => setNewPo({ ...newPo, quantity: Number(e.target.value) })} />
            <input type="number" min={0} className="input-field" placeholder={isRTL ? 'سعر المتر' : 'Price/m'} value={newPo.unitPrice || ''} onChange={(e) => setNewPo({ ...newPo, unitPrice: Number(e.target.value) })} />
          </div>
          <Button variant="primary" fullWidth isLoading={creating} onClick={handleCreatePo}>
            {isRTL ? 'إنشاء أمر الشراء' : 'Create PO'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
