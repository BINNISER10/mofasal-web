'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { useAuthStore } from '@/lib/stores/authStore';
import toast from 'react-hot-toast';
import { Home, Briefcase, Plus, Edit3, Trash2, Star } from 'lucide-react';
import { usersApi, Address } from '@/lib/api/users';

const emptyForm = { label: '', street: '', district: '', city: 'الرياض', buildingNumber: '', apartmentNumber: '', isDefault: false };

export default function CustomerAddressesPage() {
  const { isRTL } = useAppStore();
  const user = useAuthStore((s) => s.user);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadAddresses = async () => {
    if (!user?.id) return;
    try {
      const res = await usersApi.getAddresses(user.id);
      setAddresses(res.addresses);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAddresses(); }, [user?.id]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      label: addr.label,
      street: addr.street,
      district: addr.district || '',
      city: addr.city,
      buildingNumber: addr.buildingNumber || '',
      apartmentNumber: addr.apartmentNumber || '',
      isDefault: addr.isDefault,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user?.id || !form.label || !form.street || !form.city) {
      toast.error(isRTL ? 'أكمل الحقول المطلوبة' : 'Fill required fields');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await usersApi.updateAddress(user.id, editing.id, form);
        toast.success(isRTL ? 'تم تحديث العنوان' : 'Address updated');
      } else {
        await usersApi.createAddress(user.id, form);
        toast.success(isRTL ? 'تمت إضافة العنوان' : 'Address added');
      }
      setShowModal(false);
      await loadAddresses();
    } catch {
      toast.error(isRTL ? 'فشل حفظ العنوان' : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addr: Address) => {
    if (!user?.id) return;
    if (!confirm(isRTL ? 'حذف هذا العنوان؟' : 'Delete this address?')) return;
    try {
      await usersApi.deleteAddress(user.id, addr.id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      await loadAddresses();
    } catch {
      toast.error(isRTL ? 'فشل الحذف' : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'العناوين' : 'Addresses'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={openAdd}>
          {isRTL ? 'إضافة عنوان' : 'Add Address'}
        </Button>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : addresses.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد عناوين. أضف عنوانك الأول' : 'No addresses yet. Add your first address'}</Card>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0 mt-1">
                    {addr.label === 'Work' || addr.label === 'العمل' ? <Briefcase size={20} /> : <Home size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-slate-100">{addr.label}</h3>
                      {addr.isDefault && <Star size={14} className="text-gold-500" />}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{addr.street}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-500">{addr.district}, {addr.city}</p>
                    {addr.buildingNumber && (
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        {isRTL ? 'مبنى' : 'Building'} {addr.buildingNumber}
                        {addr.apartmentNumber ? `, ${isRTL ? 'شقة' : 'Apt'} ${addr.apartmentNumber}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(addr)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-primary-600">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => handleDelete(addr)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? (isRTL ? 'تعديل العنوان' : 'Edit Address') : (isRTL ? 'إضافة عنوان' : 'Add Address')} size="md">
        <div className="space-y-3">
          <input className="input-field w-full" placeholder={isRTL ? 'التسمية (المنزل / العمل)' : 'Label'} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input className="input-field w-full" placeholder={isRTL ? 'الشارع' : 'Street'} value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <input className="input-field w-full" placeholder={isRTL ? 'الحي' : 'District'} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <input className="input-field w-full" placeholder={isRTL ? 'المدينة' : 'City'} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder={isRTL ? 'رقم المبنى' : 'Building'} value={form.buildingNumber} onChange={(e) => setForm({ ...form, buildingNumber: e.target.value })} />
            <input className="input-field" placeholder={isRTL ? 'الشقة' : 'Apt'} value={form.apartmentNumber} onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            {isRTL ? 'العنوان الافتراضي' : 'Default address'}
          </label>
          <Button variant="primary" fullWidth isLoading={saving} onClick={handleSave}>
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
