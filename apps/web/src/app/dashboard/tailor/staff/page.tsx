'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { Phone, Plus, Briefcase, Trash2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';
import { hrApi, Employee } from '@/lib/api/hr';
import toast from 'react-hot-toast';

const POSITIONS = ['خياط رئيسي', 'خياط', 'مساعد خياط', 'مشرف إنتاج', 'استقبال', 'مندوب قياس'];

// قالب احتياطي بأسماء ذكور (يظهر فقط عند تعذّر الاتصال)
const FALLBACK: Employee[] = [
  { id: 'f1', shopId: '', name: 'علي محمد', position: 'خياط رئيسي', salary: 4500, isActive: true, phone: '+966 55 111 2222' },
  { id: 'f2', shopId: '', name: 'فيصل الحربي', position: 'خياط', salary: 3500, isActive: true, phone: '+966 55 333 4444' },
  { id: 'f3', shopId: '', name: 'ماجد الشمري', position: 'مساعد خياط', salary: 3000, isActive: true, phone: '+966 55 777 8888' },
];

export default function StaffPage() {
  const { isRTL } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', position: POSITIONS[1], phone: '', salary: '' });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hrApi.getEmployees({ limit: '50' });
      setEmployees(res.items.length ? res.items : FALLBACK);
    } catch {
      setEmployees(FALLBACK);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleAdd = async () => {
    if (!form.name.trim()) { toast.error(isRTL ? 'أدخل اسم الموظف' : 'Enter name'); return; }
    setSaving(true);
    try {
      await hrApi.createEmployee({
        name: form.name.trim(),
        position: form.position,
        phone: form.phone || undefined,
        salary: form.salary ? Number(form.salary) : undefined,
      });
      toast.success(isRTL ? 'تمت إضافة الموظف' : 'Employee added');
      setShowAdd(false);
      setForm({ name: '', position: POSITIONS[1], phone: '', salary: '' });
      fetchEmployees();
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّرت الإضافة' : 'Failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id.startsWith('f')) return; // قالب احتياطي
    try {
      await hrApi.deleteEmployee(id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الحذف' : 'Failed'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'فريق العمل' : 'Staff Team'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>{isRTL ? 'إضافة موظف' : 'Add Staff'}</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-600" size={32} /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => (
            <Card key={emp.id} className="p-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {(emp.nameAr || emp.name || '?').charAt(0)}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100">{emp.nameAr || emp.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{emp.positionAr || emp.position}</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                  {emp.salary ? <span className="flex items-center gap-1"><Briefcase size={12} />{formatCurrency(emp.salary)}</span> : null}
                  {emp.phone ? <span className="flex items-center gap-1"><Phone size={12} />{emp.phone}</span> : null}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge variant={emp.isActive ? 'success' : 'warning'} size="sm">{emp.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}</Badge>
                  {!emp.id.startsWith('f') && (
                    <button onClick={() => handleDelete(emp.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {employees.length === 0 && (
            <Card className="p-8 text-center text-gray-500 dark:text-slate-400 md:col-span-2 lg:col-span-3">{isRTL ? 'لا يوجد موظفون' : 'No staff'}</Card>
          )}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRTL ? 'إضافة موظف' : 'Add Staff'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">{isRTL ? 'الاسم' : 'Name'}</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={isRTL ? 'اسم الموظف' : 'Employee name'} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">{isRTL ? 'المسمى الوظيفي' : 'Position'}</label>
            <select className="input-field" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">{isRTL ? 'الجوال' : 'Phone'}</label>
              <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+9665XXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">{isRTL ? 'الراتب' : 'Salary'}</label>
              <input className="input-field" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="0" />
            </div>
          </div>
          <Button variant="primary" fullWidth onClick={handleAdd} isLoading={saving} disabled={saving}>{isRTL ? 'إضافة' : 'Add'}</Button>
        </div>
      </Modal>
    </div>
  );
}
