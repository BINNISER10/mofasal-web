'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { hrApi, Employee } from '@/lib/api/hr';
import { Users, Plus, Edit3, Trash2, Search, Filter, Building2, Phone, Mail, Calendar, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const POSITIONS = [
  'Master Tailor',
  'Tailor',
  'Sales Representative',
  'Accountant',
  'Manager',
  'Cashier',
  'Delivery Driver',
];

export default function AdminHRPage() {
  const { isRTL } = useAppStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    position: POSITIONS[1],
    salary: '',
    departmentId: '',
  });

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hrApi.getEmployees({ limit: '50' });
      setEmployees(res.items);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error(isRTL ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const filtered = employees.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.phone && e.phone.includes(search)) ||
    e.position.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.phone || !form.salary) {
      toast.error(isRTL ? 'أكمل البيانات المطلوبة' : 'Complete required fields');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await hrApi.updateEmployee(editingId, {
          name: form.name,
          phone: form.phone,
          position: form.position,
          salary: parseFloat(form.salary),
          departmentId: form.departmentId || undefined,
        });
        toast.success(isRTL ? 'تم التحديث' : 'Updated successfully');
      } else {
        await hrApi.createEmployee({
          name: form.name,
          phone: form.phone,
          position: form.position,
          salary: parseFloat(form.salary),
          departmentId: form.departmentId || undefined,
        });
        toast.success(isRTL ? 'تمت الإضافة' : 'Added successfully');
      }
      await fetchEmployees();
      setShowAdd(false);
      setEditingId(null);
      setForm({ name: '', phone: '', position: POSITIONS[1], salary: '', departmentId: '' });
    } catch (error) {
      console.error('Failed to save employee:', error);
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setForm({
      name: employee.name,
      phone: employee.phone || '',
      position: employee.position,
      salary: employee.salary.toString(),
      departmentId: employee.department?.id || '',
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure you want to delete?')) return;
    try {
      await hrApi.deleteEmployee(id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted successfully');
      await fetchEmployees();
    } catch (error) {
      console.error('Failed to delete employee:', error);
      toast.error(isRTL ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  const activeCount = employees.filter((e) => e.isActive).length;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة الموظفين' : 'Employee Management'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          {isRTL ? 'إضافة موظف' : 'Add Employee'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الموظفين' : 'Total Employees'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{employees.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'نشطون' : 'Active'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/30 text-gold-600 flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الرواتب' : 'Total Salaries'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(totalSalary)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder={isRTL ? 'بحث بالاسم أو الهاتف أو المسمى الوظيفي...' : 'Search by name, phone, or position...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Employees List */}
      <div className="grid gap-4">
        {filtered.map((emp) => (
          <Card key={emp.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-slate-100">{emp.name}</p>
                    <Badge variant={emp.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                      {emp.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{emp.positionAr || emp.position}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {emp.phone}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {emp.hireDate}
                    </span>
                    {emp.departmentName && (
                      <span className="flex items-center gap-1">
                        <Building2 size={12} /> {emp.departmentName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="font-bold text-primary-700">{formatCurrency(emp.salary)}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => { setEditingId(emp.id); setShowAdd(true); }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRTL ? 'إضافة موظف' : 'Add Employee'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              {isRTL ? 'الاسم' : 'Name'}
            </label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={isRTL ? 'مثال: أحمد محمد' : 'e.g., Ahmed Mohammed'}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الهاتف' : 'Phone'}
              </label>
              <input
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9665xxxxxxxx"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الراتب' : 'Salary'}
              </label>
              <input
                className="input-field"
                type="number"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="5000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              {isRTL ? 'المسمى الوظيفي' : 'Position'}
            </label>
            <select
              className="input-field"
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" fullWidth onClick={handleAdd}>
            {isRTL ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
