'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { Calendar, Clock, CheckCircle2, XCircle, Plus, User, FileText } from 'lucide-react';
import { hrApi } from '@/lib/api/hr';
import toast from 'react-hot-toast';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'ANNUAL' | 'SICK' | 'EMERGENCY' | 'UNPAID';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  days: number;
}

const TYPE_CONFIG = {
  ANNUAL: { label: 'سنوية', labelEn: 'Annual', variant: 'primary' as const },
  SICK: { label: 'مرضية', labelEn: 'Sick', variant: 'warning' as const },
  EMERGENCY: { label: 'طوارئ', labelEn: 'Emergency', variant: 'danger' as const },
  UNPAID: { label: 'بدون راتب', labelEn: 'Unpaid', variant: 'secondary' as const },
};

const STATUS_CONFIG = {
  PENDING: { label: 'قيد الانتظار', labelEn: 'Pending', variant: 'warning' as const, icon: <Clock size={14} /> },
  APPROVED: { label: 'موافق عليه', labelEn: 'Approved', variant: 'success' as const, icon: <CheckCircle2 size={14} /> },
  REJECTED: { label: 'مرفوض', labelEn: 'Rejected', variant: 'danger' as const, icon: <XCircle size={14} /> },
};

function calcDays(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(diff / 86400000) + 1);
}

export default function AdminLeavePage() {
  const { isRTL } = useAppStore();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    employeeId: '',
    type: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    hrApi.getLeaveRequests()
      .then((rows) => {
        if (!active) return;
        setRequests(rows.map((r) => ({
          id: r.id,
          employeeId: r.employeeId,
          employeeName: r.employeeNameAr || r.employeeName,
          type: r.type,
          startDate: r.startDate,
          endDate: r.endDate,
          reason: r.reason,
          status: r.status,
          days: calcDays(r.startDate, r.endDate),
        })));
      })
      .catch(() => { if (active) setRequests([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;

  const handleApprove = async (id: string) => {
    try {
      await hrApi.approveLeaveRequest(id);
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const } : r)));
      toast.success(isRTL ? 'تمت الموافقة' : 'Approved');
    } catch {
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'APPROVED' as const } : r)));
      toast.success(isRTL ? 'تمت الموافقة' : 'Approved');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await hrApi.rejectLeaveRequest(id);
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r)));
      toast.success(isRTL ? 'تم الرفض' : 'Rejected');
    } catch {
      setRequests(requests.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r)));
      toast.success(isRTL ? 'تم الرفض' : 'Rejected');
    }
  };

  const handleAdd = () => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeId: form.employeeId,
      employeeName: 'موظف جديد',
      type: form.type as any,
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason,
      status: 'PENDING',
      days,
    };
    setRequests([...requests, newRequest]);
    setShowAdd(false);
    setForm({ employeeId: '', type: 'ANNUAL', startDate: '', endDate: '', reason: '' });
    toast.success(isRTL ? 'تم إرسال الطلب' : 'Request submitted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'طلبات الإجازات' : 'Leave Requests'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
          {isRTL ? 'طلب إجازة' : 'Request Leave'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'موافق عليه' : 'Approved'}</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الطلبات' : 'Total Requests'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{requests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-600 flex-shrink-0" />
            <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
              {isRTL ? `${pendingCount} طلب/طلبات تنتظر موافقتك` : `${pendingCount} request(s) awaiting your approval`}
            </p>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="grid gap-4">
        {requests.map((req) => {
          const typeConfig = TYPE_CONFIG[req.type];
          const statusConfig = STATUS_CONFIG[req.status];
          return (
            <Card key={req.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-slate-100">{req.employeeName}</p>
                      <Badge variant={typeConfig.variant} size="sm">
                        {isRTL ? typeConfig.label : typeConfig.labelEn}
                      </Badge>
                      <Badge variant={statusConfig.variant} size="sm">
                        <span className="flex items-center gap-1">
                          {statusConfig.icon}
                          {isRTL ? statusConfig.label : statusConfig.labelEn}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {req.startDate} → {req.endDate}
                      </span>
                      <span>{req.days} {isRTL ? 'أيام' : 'days'}</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{req.reason}</p>
                  </div>
                </div>
                {req.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<XCircle size={14} />}
                      onClick={() => handleReject(req.id)}
                    >
                      {isRTL ? 'رفض' : 'Reject'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<CheckCircle2 size={14} />}
                      onClick={() => handleApprove(req.id)}
                    >
                      {isRTL ? 'موافقة' : 'Approve'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Request Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={isRTL ? 'طلب إجازة' : 'Request Leave'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              {isRTL ? 'نوع الإجازة' : 'Leave Type'}
            </label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="ANNUAL">{isRTL ? 'سنوية' : 'Annual'}</option>
              <option value="SICK">{isRTL ? 'مرضية' : 'Sick'}</option>
              <option value="EMERGENCY">{isRTL ? 'طوارئ' : 'Emergency'}</option>
              <option value="UNPAID">{isRTL ? 'بدون راتب' : 'Unpaid'}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'من تاريخ' : 'From'}
              </label>
              <input
                className="input-field"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
                {isRTL ? 'إلى تاريخ' : 'To'}
              </label>
              <input
                className="input-field"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1.5">
              {isRTL ? 'السبب' : 'Reason'}
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder={isRTL ? 'اكتب سبب الإجازة...' : 'Write the reason...'}
            />
          </div>
          <Button variant="primary" fullWidth onClick={handleAdd}>
            {isRTL ? 'إرسال الطلب' : 'Submit Request'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
