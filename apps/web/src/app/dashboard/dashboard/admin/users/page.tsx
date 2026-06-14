'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { Search, Filter, MoreVertical, Ban, CheckCircle, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { adminApi, AdminUser } from '@/lib/api/admin';

export default function AdminUsersPage() {
  const { isRTL } = useAppStore();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (statusFilter !== 'ALL') params.status = statusFilter;
        const res = await adminApi.getUsers(params);
        setUsers(res.users);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [statusFilter]);

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await adminApi.updateUserStatus(userId, status);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
      setShowActions(null);
    } catch (err) {
      console.error('Failed to update user status', err);
    }
  };

  const columns = [
    { key: 'name', header: isRTL ? 'الاسم' : 'Name', sortable: true,
      render: (user: AdminUser) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{user.phone}</p>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email', render: (u: AdminUser) => <span className="text-gray-600 dark:text-slate-400 text-sm">{u.email}</span> },
    { key: 'role', header: isRTL ? 'الدور' : 'Role', sortable: true,
      render: (u: AdminUser) => (
        <Badge variant={u.role === 'admin' ? 'error' : u.role === 'tailor' ? 'info' : u.role === 'merchant' ? 'warning' : 'success'} size="sm">
          {isRTL ? { admin: 'مدير', tailor: 'خياط', merchant: 'تاجر', customer: 'عميل' }[u.role] || u.role : u.role}
        </Badge>
      )
    },
    { key: 'status', header: isRTL ? 'الحالة' : 'Status', sortable: true,
      render: (u: AdminUser) => (
        <Badge variant={u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' || u.status === 'BANNED' ? 'error' : u.status === 'PENDING_VERIFICATION' ? 'warning' : 'neutral'} size="sm">
          {isRTL ? { ACTIVE: 'نشط', INACTIVE: 'غير نشط', SUSPENDED: 'موقوف', BANNED: 'محظور', PENDING_VERIFICATION: 'قيد التحقق' }[u.status] || u.status : u.status}
        </Badge>
      )
    },
    { key: 'ordersCount', header: isRTL ? 'الطلبات' : 'Orders', sortable: true },
    { key: 'actions', header: '', width: '60px',
      render: (user: AdminUser) => (
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(showActions === user.id ? null : user.id); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>
          {showActions === user.id && (
            <div className={cn('absolute top-full mt-1 z-40 bg-white dark:bg-slate-800 rounded-xl shadow-jahez-lg border border-gray-100 dark:border-slate-700 w-44 overflow-hidden', isRTL ? 'left-0' : 'right-0')}>
              {[
                { icon: <CheckCircle size={14} />, label: isRTL ? 'تفعيل' : 'Activate', color: 'text-green-600', status: 'ACTIVE' },
                { icon: <Ban size={14} />, label: isRTL ? 'تعليق' : 'Suspend', color: 'text-yellow-600', status: 'SUSPENDED' },
                { icon: <AlertTriangle size={14} />, label: isRTL ? 'حظر' : 'Ban', color: 'text-red-600', status: 'BANNED' },
              ].map((action, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300"
                  onClick={() => handleStatusChange(user.id, action.status)}
                >
                  <span className={action.color}>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
          {isRTL ? 'إدارة المستخدمين' : 'User Management'}
        </h2>
        <div className="flex gap-2">
          {['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                statusFilter === f ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-600'
              )}
            >
              {isRTL ? { ALL: 'الكل', ACTIVE: 'نشط', SUSPENDED: 'موقوف', BANNED: 'محظور', PENDING_VERIFICATION: 'قيد التحقق' }[f] || f : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>
      ) : (
        <Table
          columns={columns}
          data={users}
          keyExtractor={(u) => u.id}
          searchable
          onRowClick={(user) => setSelectedUser(user)}
        />
      )}

      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={isRTL ? 'تفاصيل المستخدم' : 'User Details'}
        size="md"
        footer={
          <div className="flex gap-2">
            <Button variant="success" size="sm">{isRTL ? 'تفعيل' : 'Activate'}</Button>
            <Button variant="warning" size="sm">{isRTL ? 'تعليق' : 'Suspend'}</Button>
            <Button variant="danger" size="sm">{isRTL ? 'حظر' : 'Ban'}</Button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {selectedUser.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-bold">{selectedUser.name}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">{selectedUser.email}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400" dir="ltr">{selectedUser.phone}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'الدور' : 'Role'}</p>
                <p className="font-semibold dark:text-slate-200">{selectedUser.role}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</p>
                <Badge variant="success">{selectedUser.status}</Badge>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'تاريخ التسجيل' : 'Registered'}</p>
                <p className="font-semibold dark:text-slate-200">{selectedUser.createdAt}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <p className="text-gray-500 dark:text-slate-400">{isRTL ? 'عدد الطلبات' : 'Orders'}</p>
                <p className="font-semibold dark:text-slate-200">{selectedUser.ordersCount}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
