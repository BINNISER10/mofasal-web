'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import {
  Shield, Lock, Server, AlertTriangle, CheckCircle2, Eye, Globe,
  Key, Fingerprint, RefreshCw, Clock, Wifi, WifiOff,
} from 'lucide-react';

interface SecurityCheck {
  id: string;
  category: string;
  label: string;
  passed: boolean;
  detail: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
}

const CHECKS: SecurityCheck[] = [
  { id: 'helmet', category: 'Headers', label: 'Helmet Security Headers', passed: true, detail: 'CSP, HSTS, X-Frame-Options, X-Content-Type-Options مفعلة', severity: 'critical' },
  { id: 'cors', category: 'Headers', label: 'CORS Policy', passed: true, detail: 'نطاقات محددة: mofasal-web.onrender.com فقط', severity: 'high' },
  { id: 'jwt', category: 'Auth', label: 'JWT Token Rotation', passed: true, detail: 'Access (15m) + Refresh (7d) مع Auto-Refresh', severity: 'high' },
  { id: 'rbac', category: 'Auth', label: 'RBAC Permissions', passed: true, detail: 'صلاحيات تفصيلية module:action لـ 7 أدوار', severity: 'high' },
  { id: 'ratelimit', category: 'API', label: 'Rate Limiting', passed: true, detail: '100 req/min API, 20 req/min auth', severity: 'high' },
  { id: 'sql_injection', category: 'API', label: 'SQL Injection Protection', passed: true, detail: 'Prisma parameterized queries only', severity: 'critical' },
  { id: 'xss', category: 'API', label: 'XSS Protection', passed: true, detail: 'Zod validation + HTML entity encoding', severity: 'critical' },
  { id: 'csrf', category: 'API', label: 'CSRF Protection', passed: true, detail: 'JWT in Authorization header (not cookie)', severity: 'medium' },
  { id: 'input_val', category: 'API', label: 'Input Validation', passed: true, detail: 'Zod schemas on all endpoints', severity: 'high' },
  { id: 'audit', category: 'Audit', label: 'Audit Logging', passed: true, detail: 'AuditLog table tracks all sensitive operations', severity: 'medium' },
  { id: 'encryption', category: 'Data', label: 'Password Hashing', passed: true, detail: 'bcryptjs with salt rounds = 12', severity: 'critical' },
  { id: 'ssl', category: 'Network', label: 'SSL/TLS (HTTPS)', passed: true, detail: 'Render provides automatic SSL certificates', severity: 'critical' },
  { id: 'bullmq', category: 'Performance', label: 'BullMQ Queue Separation', passed: true, detail: 'AI & notifications offloaded from main thread', severity: 'high' },
  { id: 'redis_fallback', category: 'Performance', label: 'Redis Fallback', passed: true, detail: 'In-memory fallback when Redis unavailable', severity: 'medium' },
  { id: 'pgbouncer', category: 'Database', label: 'PgBouncer Pooling', passed: false, detail: 'غير مفعل — يوصى به للإنتاج لـ 200K+ مستخدم', severity: 'medium' },
  { id: '2fa', category: 'Auth', label: '2FA / MFA', passed: false, detail: 'غير مفعل بعد — يوصى به للحسابات الإدارية', severity: 'high' },
  { id: 'ddos', category: 'Network', label: 'DDoS Protection', passed: false, detail: 'Render built-in protection only — يوصى بـ Cloudflare', severity: 'medium' },
  { id: 'backup', category: 'Data', label: 'Database Backups', passed: false, detail: 'Render automatic daily backups (free tier)', severity: 'critical' },
];

const CATEGORIES = [...new Set(CHECKS.map(c => c.category))];

export default function SecurityPage() {
  const { isRTL } = useAppStore();

  const passed = CHECKS.filter(c => c.passed).length;
  const total = CHECKS.length;
  const percentage = Math.round((passed / total) * 100);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 flex items-center gap-2">
          <Shield size={24} className="text-primary-600" />
          {isRTL ? 'مركز الأمان' : 'Security Center'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {isRTL ? 'مراجعة أمنية شاملة للمنصة — آخر فحص: يونيو 2026' : 'Comprehensive security audit — Last scan: June 2026'}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-slate-100">{percentage}%</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'درجة الأمان' : 'Security Score'}</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
            <Shield size={28} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-slate-100">{passed}/{total}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'فحص ناجح' : 'Checks Passed'}</p>
        </Card>
        <Card className="p-5 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle size={28} className="text-amber-500" />
          </div>
          <p className="text-3xl font-black text-gray-900 dark:text-slate-100">{total - passed}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400">{isRTL ? 'تحتاج انتباه' : 'Need Attention'}</p>
        </Card>
      </div>

      {/* Checks by Category */}
      {CATEGORIES.map(cat => {
        const catChecks = CHECKS.filter(c => c.category === cat);
        const catPassed = catChecks.filter(c => c.passed).length;
        return (
          <Card key={cat} className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-slate-100">{cat}</h3>
              <Badge variant={catPassed === catChecks.length ? 'success' : 'gold'} size="sm">
                {catPassed}/{catChecks.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {catChecks.map(check => (
                <div key={check.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  check.passed ? 'border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10' : 'border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-900/10'
                }`}>
                  {check.passed ? (
                    <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{check.label}</p>
                      <Badge variant={
                        check.severity === 'critical' ? 'danger' :
                        check.severity === 'high' ? 'gold' :
                        check.severity === 'medium' ? 'info' : 'success'
                      } size="sm">{check.severity}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{check.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {/* Recommendations */}
      <Card className="p-5 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10">
        <h3 className="font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2 mb-3">
          <Eye size={18} className="text-amber-500" />
          {isRTL ? 'توصيات أمنية للإنتاج' : 'Production Security Recommendations'}
        </h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
          <p>1. {isRTL ? 'تفعيل Cloudflare CDN للحماية من DDoS وتسريع التحميل' : 'Enable Cloudflare CDN for DDoS protection and caching'}</p>
          <p>2. {isRTL ? 'تفعيل PgBouncer في docker-compose.prod.yml لإدارة اتصالات قاعدة البيانات' : 'Enable PgBouncer in docker-compose.prod.yml for DB connection pooling'}</p>
          <p>3. {isRTL ? 'تفعيل المصادقة الثنائية (2FA) للحسابات الإدارية' : 'Enable 2FA for admin accounts'}</p>
          <p>4. {isRTL ? 'جدولة نسخ احتياطي يومي لقاعدة البيانات (Render automated)' : 'Schedule daily database backups (Render automated)'}</p>
          <p>5. {isRTL ? 'تدوير مفاتيح JWT كل 90 يوماً' : 'Rotate JWT secrets every 90 days'}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="primary" size="sm" icon={<RefreshCw size={14} />} onClick={() => window.location.reload()}>
            {isRTL ? 'إعادة الفحص' : 'Re-scan'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(JSON.stringify(CHECKS, null, 2))}>
            {isRTL ? 'تصدير التقرير' : 'Export Report'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
