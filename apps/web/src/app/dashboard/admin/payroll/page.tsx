'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { DollarSign, Calendar, Users, CheckCircle2, Clock, Download, FileText, TrendingUp } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'PENDING' | 'PAID';
  paidAt?: string;
}

const FALLBACK_PAYROLL: PayrollRecord[] = [
  {
    id: '1',
    employeeId: '1',
    employeeName: 'خالد الأحمد',
    month: 6,
    year: 2024,
    baseSalary: 8000,
    overtime: 500,
    bonuses: 1000,
    deductions: 300,
    netSalary: 9200,
    status: 'PAID',
    paidAt: '2024-06-01',
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: 'محمد السلمي',
    month: 6,
    year: 2024,
    baseSalary: 5000,
    overtime: 200,
    bonuses: 500,
    deductions: 150,
    netSalary: 5550,
    status: 'PAID',
    paidAt: '2024-06-01',
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: 'فهد القحطاني',
    month: 6,
    year: 2024,
    baseSalary: 4500,
    overtime: 0,
    bonuses: 300,
    deductions: 100,
    netSalary: 4700,
    status: 'PENDING',
  },
];

const MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const STATUS_CONFIG = {
  PENDING: { label: 'قيد الانتظار', labelEn: 'Pending', variant: 'warning' as const, icon: <Clock size={14} /> },
  PAID: { label: 'مدفوع', labelEn: 'Paid', variant: 'success' as const, icon: <CheckCircle2 size={14} /> },
};

export default function AdminPayrollPage() {
  const { isRTL } = useAppStore();
  const [payroll, setPayroll] = useState<PayrollRecord[]>(FALLBACK_PAYROLL);
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [selectedYear, setSelectedYear] = useState(2024);

  const filtered = payroll.filter((p) => p.month === selectedMonth && p.year === selectedYear);

  const totalBaseSalary = filtered.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalOvertime = filtered.reduce((sum, p) => sum + p.overtime, 0);
  const totalBonuses = filtered.reduce((sum, p) => sum + p.bonuses, 0);
  const totalDeductions = filtered.reduce((sum, p) => sum + p.deductions, 0);
  const totalNetSalary = filtered.reduce((sum, p) => sum + p.netSalary, 0);

  const pendingCount = filtered.filter((p) => p.status === 'PENDING').length;

  const handlePay = (id: string) => {
    setPayroll(payroll.map((p) => (p.id === id ? { ...p, status: 'PAID', paidAt: new Date().toISOString().split('T')[0] } : p)));
  };

  const getStatusConfig = (status: string) => STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.PENDING;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'مسير الرواتب' : 'Payroll'}</h2>
        <div className="flex items-center gap-3">
          <select
            className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
          <Button variant="outline" icon={<Download size={16} />}>
            {isRTL ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الموظفين' : 'Employees'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{filtered.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الراتب الأساسي' : 'Base Salary'}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{formatCurrency(totalBaseSalary)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الإضافات' : 'Additions'}</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalOvertime + totalBonuses)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'الخصومات' : 'Deductions'}</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/30 text-gold-600 flex items-center justify-center">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'صافي الرواتب' : 'Net Salary'}</p>
              <p className="text-2xl font-bold text-gold-600">{formatCurrency(totalNetSalary)}</p>
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
              {isRTL ? `${pendingCount} راتب/رواتب غير مدفوعة` : `${pendingCount} salary/salaries unpaid`}
            </p>
          </div>
          <Button size="sm" variant="warning">
            {isRTL ? 'دفع الكل' : 'Pay All'}
          </Button>
        </div>
      )}

      {/* Payroll Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الموظف' : 'Employee'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الراتب الأساسي' : 'Base'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'إضافات' : 'Additions'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'خصومات' : 'Deductions'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'صافي' : 'Net'}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const config = getStatusConfig(record.status);
                return (
                  <tr key={record.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300">
                    <td className="px-4 py-3 font-medium">{record.employeeName}</td>
                    <td className="px-4 py-3">{formatCurrency(record.baseSalary)}</td>
                    <td className="px-4 py-3 text-green-600">{formatCurrency(record.overtime + record.bonuses)}</td>
                    <td className="px-4 py-3 text-red-600">{formatCurrency(record.deductions)}</td>
                    <td className="px-4 py-3 font-bold text-gold-600">{formatCurrency(record.netSalary)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={config.variant} size="sm">
                        <span className="flex items-center gap-1">
                          {config.icon}
                          {isRTL ? config.label : config.labelEn}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {record.status === 'PENDING' ? (
                        <Button size="sm" variant="primary" onClick={() => handlePay(record.id)}>
                          {isRTL ? 'دفع' : 'Pay'}
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400">{record.paidAt}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-4">{isRTL ? 'ملخص الشهر' : 'Monthly Summary'}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الأساسي' : 'Total Base'}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{formatCurrency(totalBaseSalary)}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الإضافات' : 'Total Additions'}</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalOvertime + totalBonuses)}</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الخصومات' : 'Total Deductions'}</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
          </div>
          <div className="p-4 bg-gold-50 dark:bg-gold-900/20 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-slate-400">{isRTL ? 'إجمالي الصافي' : 'Total Net'}</p>
            <p className="text-lg font-bold text-gold-600">{formatCurrency(totalNetSalary)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
