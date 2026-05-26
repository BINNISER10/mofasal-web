'use client';
import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAppStore } from '@/lib/stores/appStore';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const { isRTL } = useAppStore();

  const sections = isRTL ? [
    { title: '1. قبول الشروط', body: 'باستخدامك لمنصة مفصل، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام الخدمة.' },
    { title: '2. الخدمات المقدمة', body: 'تتيح منصة مفصل للمستخدمين التواصل مع خياطين محترفين وتجار أقمشة في المملكة العربية السعودية. المنصة وسيط فقط ولا تتحمل مسؤولية جودة الخدمات المقدمة من الخياطين.' },
    { title: '3. حسابات المستخدمين', body: 'أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك. يجب إخطارنا فوراً عند أي استخدام غير مصرح به لحسابك.' },
    { title: '4. المدفوعات', body: 'جميع المعاملات المالية تتم عبر بوابات دفع آمنة. تخضع عمليات الاسترداد لسياسة كل متجر على حدة.' },
    { title: '5. الملكية الفكرية', body: 'جميع المحتويات والتصاميم والعلامات التجارية على المنصة هي ملك لمنصة مفصل ومحمية بموجب قوانين الملكية الفكرية.' },
    { title: '6. تعديل الشروط', body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني المسجل.' },
  ] : [
    { title: '1. Acceptance of Terms', body: 'By using the MUFASAL platform, you agree to be bound by these terms and conditions. If you do not agree, please do not use the service.' },
    { title: '2. Services Provided', body: 'MUFASAL connects users with professional tailors and fabric merchants in Saudi Arabia. The platform is a marketplace intermediary and is not responsible for the quality of services provided by tailors.' },
    { title: '3. User Accounts', body: 'You are responsible for maintaining the confidentiality of your login credentials. You must notify us immediately of any unauthorized use of your account.' },
    { title: '4. Payments', body: 'All financial transactions are processed through secure payment gateways. Refunds are subject to each shop\'s individual policy.' },
    { title: '5. Intellectual Property', body: 'All content, designs, and trademarks on the platform are the property of MUFASAL and protected by intellectual property laws.' },
    { title: '6. Modification of Terms', body: 'We reserve the right to modify these terms at any time. You will be notified of any material changes via your registered email.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isRTL ? 'الشروط والأحكام' : 'Terms & Conditions'}
          </h1>
          <p className="text-gray-400 text-sm">{isRTL ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {sections.map((s, i) => (
            <div key={i}>
              <h2 className="font-bold text-gray-900 mb-2">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
