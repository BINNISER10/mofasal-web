'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { cn } from '@/lib/utils/cn';
import { Search, Filter, Clock, User, Globe, Shield } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';

const severityColors = { info: 'info', warning: 'warning', error: 'error' } as const;

export default function AdminAuditLogsPage() {
  const { isRTL } = useAppStore();
  const [filter, setFilter] = useState('ALL');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (filter !== 'ALL') params.severity = filter;
        const res = await adminApi.getAuditLogs(params);
        setLogs(res.logs);
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'سجل التدقيق' : 'Audit Logs'}</h2>
        <div className="flex gap-2">
          {['ALL', 'info', 'warning', 'error'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', filter === f ? 'bg-primary-700 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600')}>
              {isRTL ? { ALL: 'الكل', info: 'معلومات', warning: 'تحذيرات', error: 'أخطاء' }[f] || f : f}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الإجراء' : 'Action'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المستخدم' : 'User'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">IP</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'التفاصيل' : 'Details'}</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'الوقت' : 'Time'}</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-slate-400">{isRTL ? 'المستوى' : 'Severity'}</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 dark:text-slate-300">
                  <td className="px-4 py-3 font-medium">{log.action}</td>
                  <td className="px-4 py-3">
                    <div><span className="font-medium">{log.user}</span> <span className="text-gray-400 dark:text-slate-500 text-xs">({log.role})</span></div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 font-mono text-xs">{log.ip}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-slate-400 max-w-xs truncate">{log.details}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-slate-400 text-xs">{log.timestamp}</td>
                  <td className="px-4 py-3 text-center"><Badge variant={severityColors[log.severity as keyof typeof severityColors]} size="sm">{log.severity}</Badge></td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'لا توجد سجلات' : 'No logs found'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </div>
  );
}
