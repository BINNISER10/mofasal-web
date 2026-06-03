'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/stores/appStore';
import { formatCurrency } from '@/lib/utils/formatting';
import { accountingApi, Account, JournalEntry, TrialBalance } from '@/lib/api/accounting';
import { Plus, Trash2, BookOpen, Scale } from 'lucide-react';
import toast from 'react-hot-toast';

interface DraftLine {
  accountCode: string;
  debit: string;
  credit: string;
}

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  ASSET: { ar: 'أصول', en: 'Asset' },
  LIABILITY: { ar: 'التزامات', en: 'Liability' },
  EQUITY: { ar: 'حقوق ملكية', en: 'Equity' },
  REVENUE: { ar: 'إيرادات', en: 'Revenue' },
  EXPENSE: { ar: 'مصروفات', en: 'Expense' },
};

export default function MerchantAccountingPage() {
  const { isRTL } = useAppStore();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState<DraftLine[]>([
    { accountCode: '', debit: '', credit: '' },
    { accountCode: '', debit: '', credit: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [acc, tb, jr] = await Promise.all([
        accountingApi.getAccounts(),
        accountingApi.getTrialBalance(),
        accountingApi.getJournal({ limit: '50' }),
      ]);
      setAccounts(acc);
      setTrialBalance(tb);
      setJournal(jr);
    } catch (err) {
      console.error('Failed to load accounting data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSeed = async () => {
    try {
      await accountingApi.seedAccounts();
      toast.success(isRTL ? 'تم تجهيز شجرة الحسابات' : 'Chart of accounts ready');
      loadAll();
    } catch {
      toast.error(isRTL ? 'تعذّر التجهيز' : 'Failed to seed accounts');
    }
  };

  const totals = useMemo(() => {
    const debit = lines.reduce((a, l) => a + (parseFloat(l.debit) || 0), 0);
    const credit = lines.reduce((a, l) => a + (parseFloat(l.credit) || 0), 0);
    return { debit: Math.round(debit * 100) / 100, credit: Math.round(credit * 100) / 100 };
  }, [lines]);

  const balanced = totals.debit === totals.credit && totals.debit > 0;

  const updateLine = (i: number, field: keyof DraftLine, value: string) => {
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, { accountCode: '', debit: '', credit: '' }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));

  const handlePost = async () => {
    if (!description.trim()) { toast.error(isRTL ? 'أدخل الوصف' : 'Enter a description'); return; }
    if (!balanced) { toast.error(isRTL ? 'القيد غير متوازن' : 'Entry is not balanced'); return; }
    const payloadLines = lines
      .filter((l) => l.accountCode && (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0))
      .map((l) => ({ accountCode: l.accountCode, debit: parseFloat(l.debit) || 0, credit: parseFloat(l.credit) || 0 }));
    if (payloadLines.length < 2) { toast.error(isRTL ? 'القيد يتطلب سطرين على الأقل' : 'At least two lines required'); return; }

    setSaving(true);
    try {
      await accountingApi.postEntry({ description, lines: payloadLines });
      toast.success(isRTL ? 'تم ترحيل القيد' : 'Entry posted');
      setShowForm(false);
      setDescription('');
      setLines([{ accountCode: '', debit: '', credit: '' }, { accountCode: '', debit: '', credit: '' }]);
      loadAll();
    } catch (e: any) {
      toast.error(e?.message || (isRTL ? 'تعذّر الترحيل' : 'Failed to post entry'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Card className="p-8 text-center text-gray-500 dark:text-slate-400">{isRTL ? 'جاري التحميل...' : 'Loading...'}</Card>;
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المحاسبة' : 'Accounting'}</h2>
        <Card className="p-10 text-center">
          <BookOpen size={40} className="text-primary-300 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-slate-300 font-semibold mb-1">{isRTL ? 'لم يتم تجهيز شجرة الحسابات بعد' : 'Chart of accounts not set up yet'}</p>
          <p className="text-sm text-gray-400 dark:text-slate-500 mb-5">{isRTL ? 'ابدأ بشجرة حسابات قياسية جاهزة للخياطة الرجالية' : 'Start with a standard chart of accounts'}</p>
          <Button variant="primary" onClick={handleSeed}>{isRTL ? 'تجهيز شجرة الحسابات' : 'Set up accounts'}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'المحاسبة' : 'Accounting'}</h2>
        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setShowForm((s) => !s)}>
          {isRTL ? 'قيد يدوي' : 'New Entry'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 space-y-4">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={isRTL ? 'وصف القيد' : 'Entry description'}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm"
          />
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={line.accountCode}
                  onChange={(e) => updateLine(i, 'accountCode', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm"
                >
                  <option value="">{isRTL ? 'اختر حساباً' : 'Select account'}</option>
                  {accounts.map((a) => <option key={a.id} value={a.code}>{a.code} - {a.name}</option>)}
                </select>
                <input
                  type="number" value={line.debit}
                  onChange={(e) => updateLine(i, 'debit', e.target.value)}
                  placeholder={isRTL ? 'مدين' : 'Debit'}
                  className="w-24 px-2 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm"
                />
                <input
                  type="number" value={line.credit}
                  onChange={(e) => updateLine(i, 'credit', e.target.value)}
                  placeholder={isRTL ? 'دائن' : 'Credit'}
                  className="w-24 px-2 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-sm"
                />
                {lines.length > 2 && (
                  <button onClick={() => removeLine(i)} className="text-red-500 p-1"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={addLine} className="text-sm text-primary-700 font-semibold flex items-center gap-1"><Plus size={14} />{isRTL ? 'إضافة سطر' : 'Add line'}</button>
            <div className="text-sm">
              <span className={balanced ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                {isRTL ? 'مدين' : 'Dr'} {formatCurrency(totals.debit)} / {isRTL ? 'دائن' : 'Cr'} {formatCurrency(totals.credit)}
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button variant="primary" size="sm" isLoading={saving} disabled={!balanced} onClick={handlePost}>{isRTL ? 'ترحيل' : 'Post'}</Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
          <Scale size={16} className="text-primary-600" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'ميزان المراجعة' : 'Trial Balance'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
              <th className="text-right px-4 py-2 font-semibold">{isRTL ? 'الحساب' : 'Account'}</th>
              <th className="text-right px-4 py-2 font-semibold">{isRTL ? 'النوع' : 'Type'}</th>
              <th className="text-right px-4 py-2 font-semibold">{isRTL ? 'مدين' : 'Debit'}</th>
              <th className="text-right px-4 py-2 font-semibold">{isRTL ? 'دائن' : 'Credit'}</th>
            </tr></thead>
            <tbody>
              {trialBalance?.rows.map((r) => (
                <tr key={r.code} className="border-b border-gray-50 dark:border-slate-700 dark:text-slate-300">
                  <td className="px-4 py-2">{r.code} - {r.name}</td>
                  <td className="px-4 py-2"><Badge variant="info" size="sm">{isRTL ? (TYPE_LABELS[r.type]?.ar || r.type) : (TYPE_LABELS[r.type]?.en || r.type)}</Badge></td>
                  <td className="px-4 py-2 font-semibold">{r.debit ? formatCurrency(r.debit) : '-'}</td>
                  <td className="px-4 py-2 font-semibold">{r.credit ? formatCurrency(r.credit) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr className="bg-gray-50 dark:bg-slate-800 font-bold dark:text-slate-100">
              <td className="px-4 py-2" colSpan={2}>{isRTL ? 'الإجمالي' : 'Total'}</td>
              <td className="px-4 py-2">{formatCurrency(trialBalance?.totalDebit || 0)}</td>
              <td className="px-4 py-2">{formatCurrency(trialBalance?.totalCredit || 0)}</td>
            </tr></tfoot>
          </table>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-primary-600" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'دفتر اليومية' : 'Journal'}</h3>
        </div>
        {journal.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-slate-500 py-4 text-center">{isRTL ? 'لا توجد قيود بعد' : 'No journal entries yet'}</p>
        ) : (
          <div className="space-y-3">
            {journal.map((entry) => (
              <div key={entry.id} className="border border-gray-100 dark:border-slate-700 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-800 dark:text-slate-200 text-sm">{entry.description}</p>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{(entry.date || '').slice(0, 10)}</span>
                </div>
                {entry.lines.map((l) => (
                  <div key={l.id} className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-400 py-0.5">
                    <span>{l.account.code} - {l.account.name}</span>
                    <span>{l.debit ? `${isRTL ? 'مدين' : 'Dr'} ${formatCurrency(l.debit)}` : `${isRTL ? 'دائن' : 'Cr'} ${formatCurrency(l.credit)}`}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
