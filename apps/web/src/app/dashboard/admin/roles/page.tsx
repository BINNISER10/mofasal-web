'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { rolesApi, Role } from '@/lib/api/roles';
import { Shield, Plus, Edit3, Trash2, Search, Users, Lock, Unlock, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardStatLink } from '@/components/shared/DashboardStatLink';

const MODULES = [
  { id: 'orders', label: 'الطلبات', labelEn: 'Orders' },
  { id: 'products', label: 'المنتجات', labelEn: 'Products' },
  { id: 'inventory', label: 'المخزون', labelEn: 'Inventory' },
  { id: 'manufacturing', label: 'التصنيع', labelEn: 'Manufacturing' },
  { id: 'hr', label: 'الموارد البشرية', labelEn: 'HR' },
  { id: 'payroll', label: 'الرواتب', labelEn: 'Payroll' },
  { id: 'accounting', label: 'المحاسبة', labelEn: 'Accounting' },
  { id: 'reports', label: 'التقارير', labelEn: 'Reports' },
  { id: 'settings', label: 'الإعدادات', labelEn: 'Settings' },
  { id: 'roles', label: 'الأدوار', labelEn: 'Roles' },
  { id: 'pos', label: 'نقطة البيع', labelEn: 'POS' },
  { id: 'procurement', label: 'المشتريات', labelEn: 'Procurement' },
];

const ACTIONS = ['view', 'create', 'update', 'delete', 'approve', 'export'];

export default function AdminRolesPage() {
  const { isRTL } = useAppStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    displayNameAr: '',
    permissions: {} as Record<string, string[]>,
  });

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const data = await rolesApi.getRoles();
        setRoles(data);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const filtered = roles.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.displayNameAr && r.displayNameAr.includes(search))
  );

  const togglePermission = (module: string, action: string) => {
    const current = form.permissions[module] || [];
    const updated = current.includes(action)
      ? current.filter((a) => a !== action)
      : [...current, action];
    setForm({
      ...form,
      permissions: { ...form.permissions, [module]: updated },
    });
  };

  const toggleAllModule = (module: string) => {
    const current = form.permissions[module] || [];
    const updated = current.length === ACTIONS.length ? [] : ACTIONS;
    setForm({
      ...form,
      permissions: { ...form.permissions, [module]: updated },
    });
  };

  const handleSave = async () => {
    try {
      if (editingRole) {
        await rolesApi.updateRole(editingRole.id, {
          displayName: form.displayName,
          displayNameAr: form.displayNameAr,
          permissions: form.permissions,
        });
        toast.success(isRTL ? 'تم تحديث الدور' : 'Role updated');
      } else {
        await rolesApi.createRole({
          name: form.name,
          displayName: form.displayName,
          displayNameAr: form.displayNameAr,
          permissions: form.permissions,
        });
        toast.success(isRTL ? 'تم إضافة الدور' : 'Role added');
      }
      const data = await rolesApi.getRoles();
      if (data.length > 0) setRoles(data);
      setShowAdd(false);
      setEditingRole(null);
      setForm({ name: '', displayName: '', displayNameAr: '', permissions: {} });
    } catch (error) {
      console.error('Failed to save role:', error);
      toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save');
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setForm({
      name: role.name,
      displayName: role.displayName,
      displayNameAr: role.displayNameAr || '',
      permissions: { ...role.permissions },
    });
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    const role = roles.find((r) => r.id === id);
    if (role?.isSystem) {
      toast.error(isRTL ? 'لا يمكن حذف دور النظام' : 'Cannot delete system role');
      return;
    }
    try {
      await rolesApi.deleteRole(id);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
      const data = await rolesApi.getRoles();
      if (data.length > 0) setRoles(data);
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error(isRTL ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'إدارة الأدوار والصلاحيات' : 'Roles & Permissions'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          {isRTL ? 'دور جديد' : 'New Role'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardStatLink href="/dashboard/admin/roles">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <Shield size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الأدوار' : 'Total Roles'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{roles.length}</p>
            </div>
          </div>
        </Card>
        </DashboardStatLink>
        <DashboardStatLink href="/dashboard/admin/users">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'المستخدمين' : 'Users'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{roles.reduce((sum, r) => sum + r.userCount, 0)}</p>
            </div>
          </div>
        </Card>
        </DashboardStatLink>
        <DashboardStatLink href="/dashboard/admin/roles">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Lock size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'أدوار النظام' : 'System Roles'}</p>
              <p className="text-2xl font-bold text-amber-600">{roles.filter((r) => r.isSystem).length}</p>
            </div>
          </div>
        </Card>
        </DashboardStatLink>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Search size={18} className="text-gray-400" />
          <input
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder={isRTL ? 'بحث عن دور...' : 'Search roles...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Roles List */}
      <div className="grid gap-4">
        {filtered.map((role) => (
          <Card key={role.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-primary-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-slate-100">{role.displayName}</p>
                    {role.displayNameAr && <span className="text-sm text-gray-500 dark:text-slate-400">({role.displayNameAr})</span>}
                    {role.isSystem && <Badge variant="primary" size="sm">{isRTL ? 'نظام' : 'System'}</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    {Object.keys(role.permissions).length} {isRTL ? 'وحدة' : 'module(s)'} • {role.userCount} {isRTL ? 'مستخدم' : 'user(s)'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(role)}
                  className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                {!role.isSystem && (
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={editingRole ? isRTL ? 'تعديل الدور' : 'Edit Role' : isRTL ? 'دور جديد' : 'New Role'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'}
              </label>
              <input
                className="input-field"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="e.g., Manager"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'الاسم (عربي)' : 'Name (AR)'}
              </label>
              <input
                className="input-field"
                value={form.displayNameAr}
                onChange={(e) => setForm({ ...form, displayNameAr: e.target.value })}
                placeholder={isRTL ? 'مثال: مدير' : 'e.g., Manager'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
              {isRTL ? 'الصلاحيات' : 'Permissions'}
            </label>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {MODULES.map((module) => {
                const modulePerms = form.permissions[module.id] || [];
                const allSelected = modulePerms.length === ACTIONS.length;
                return (
                  <div key={module.id} className="border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-medium text-gray-900 dark:text-slate-100">{isRTL ? module.label : module.labelEn}</p>
                      <button
                        onClick={() => toggleAllModule(module.id)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                          allSelected
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {allSelected ? <Check size={12} /> : <Unlock size={12} />}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ACTIONS.map((action) => {
                        const isSelected = modulePerms.includes(action);
                        return (
                          <button
                            key={action}
                            onClick={() => togglePermission(module.id, action)}
                            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                              isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {action}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Button variant="primary" fullWidth onClick={handleSave}>
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
