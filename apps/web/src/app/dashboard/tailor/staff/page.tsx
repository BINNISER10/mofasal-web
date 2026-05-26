'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAppStore } from '@/lib/stores/appStore';
import { Users, Star, Phone, Clock, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatting';

export default function StaffPage() {
  const { isRTL } = useAppStore();
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">{isRTL ? 'فريق العمل' : 'Staff Team'}</h2>
        <Button variant="primary" size="sm" icon={<Plus size={16} />}>{isRTL ? 'إضافة موظف' : 'Add Staff'}</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} hover onClick={() => setSelectedStaff({ id: i })} className="p-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3">
                {['ع', 'ف', 'ن', 'م', 'ه'][i]}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-slate-100">{['علي محمد', 'فيصل الحربي', 'نورة القحطاني', 'ماجد الشمري', 'هند العتيبي'][i]}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{['خياط رئيسي', 'خياط', 'مساعد خياط', 'خياط', 'استقبال'][i]}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                <span className="flex items-center gap-1"><Star size={12} className="text-gold-500" />{[4.9, 4.5, 4.2, 4.7, 4.8][i]}</span>
                <span className="flex items-center gap-1"><Phone size={12} />{['+966 55 111 2222', '+966 55 333 4444', '+966 55 555 6666', '+966 55 777 8888', '+966 55 999 0000'][i]}</span>
              </div>
              <div className="mt-3">
                <Badge variant={i < 4 ? 'success' : 'warning'} size="sm">{i < 4 ? 'نشط' : 'في إجازة'}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!selectedStaff} onClose={() => setSelectedStaff(null)} title={isRTL ? 'تفاصيل الموظف' : 'Staff Details'} size="md">
        {selectedStaff && (
          <div className="text-sm">
            <p className="text-gray-500">{isRTL ? 'بيانات الموظف' : 'Staff info'} #{selectedStaff.id + 1}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
