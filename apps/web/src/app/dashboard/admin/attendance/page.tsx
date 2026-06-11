'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { Clock, CheckCircle2, XCircle, Calendar, Users, TrendingUp } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE';
}

const FALLBACK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'خالد الأحمد',
    date: '2024-06-11',
    checkIn: '08:00',
    checkOut: '17:00',
    status: 'PRESENT',
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'محمد السلمي',
    date: '2024-06-11',
    checkIn: '08:15',
    checkOut: '17:00',
    status: 'LATE',
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'فهد القحطاني',
    date: '2024-06-11',
    checkIn: '08:00',
    checkOut: '16:30',
    status: 'EARLY_LEAVE',
  },
];

const STATUS_CONFIG = {
  PRESENT: { label: 'حاضر', labelEn: 'Present', variant: 'success' as const, icon: <CheckCircle2 size={14} /> },
  ABSENT: { label: 'غائب', labelEn: 'Absent', variant: 'error' as const, icon: <XCircle size={14} /> },
  LATE: { label: 'متأخر', labelEn: 'Late', variant: 'warning' as const, icon: <Clock size={14} /> },
  EARLY_LEAVE: { label: 'مغادرة مبكرة', labelEn: 'Early Leave', variant: 'warning' as const, icon: <Clock size={14} /> },
};

export default function AdminAttendancePage() {
  const { isRTL } = useAppStore();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(FALLBACK_ATTENDANCE);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
  const lateCount = attendance.filter((a) => a.status === 'LATE').length;

  const getStatusConfig = (status: string) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.ABSENT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'الحضور والانصراف' : 'Attendance'}</h2>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي' : 'Total'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{attendance.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'حاضر' : 'Present'}</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
              <XCircle size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'غائب' : 'Absent'}</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'متأخر' : 'Late'}</p>
              <p className="text-2xl font-bold text-amber-600">{lateCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الموظف' : 'Employee'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'دخول' : 'Check In'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'خروج' : 'Check Out'}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => {
                const config = getStatusConfig(record.status);
                return (
                  <tr key={record.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300">
                    <td className="px-4 py-3 font-medium">{record.employeeName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{record.date}</td>
                    <td className="px-4 py-3">{record.checkIn}</td>
                    <td className="px-4 py-3">{record.checkOut || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={config.variant} size="sm">
                        <span className="flex items-center gap-1">
                          {config.icon}
                          {isRTL ? config.label : config.labelEn}
                        </span>
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" icon={<CheckCircle2 size={16} />}>
            {isRTL ? 'تسجيل حضور جماعي' : 'Bulk Check-in'}
          </Button>
          <Button variant="outline" icon={<XCircle size={16} />}>
            {isRTL ? 'تسجيل غياب' : 'Mark Absent'}
          </Button>
          <Button variant="outline" icon={<TrendingUp size={16} />}>
            {isRTL ? 'تقرير الحضور الشهري' : 'Monthly Report'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
