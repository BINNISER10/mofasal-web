'use client';
import React from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAppStore } from '@/lib/stores/appStore';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const { isRTL } = useAppStore();

  const sections = isRTL ? [
    { title: '1. جمع البيانات', body: 'نجمع المعلومات الشخصية التي تقدمها عند التسجيل مثل الاسم والبريد الإلكتروني ورقم الجوال، بالإضافة إلى بيانات الاستخدام لتحسين الخدمة.' },
    { title: '2. استخدام البيانات', body: 'تُستخدم بياناتك لتقديم الخدمة ومعالجة الطلبات وإرسال الإشعارات المتعلقة بطلباتك وتحسين تجربة المستخدم.' },
    { title: '3. حماية البيانات', body: 'نستخدم تشفير SSL وأحدث تقنيات الأمان لحماية بياناتك. لا نبيع أو نشارك بياناتك الشخصية مع أطراف ثالثة دون موافقتك.' },
    { title: '4. ملفات تعريف الارتباط', body: 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك على المنصة. يمكنك تعطيلها من إعدادات المتصفح مع العلم أن ذلك قد يؤثر على بعض الوظائف.' },
    { title: '5. حقوقك', body: 'يحق لك طلب الاطلاع على بياناتك أو تصحيحها أو حذفها في أي وقت عبر التواصل مع فريق الدعم.' },
  ] : [
    { title: '1. Data Collection', body: 'We collect personal information you provide during registration such as name, email, and phone number, as well as usage data to improve our service.' },
    { title: '2. Data Usage', body: 'Your data is used to provide the service, process orders, send order-related notifications, and improve user experience.' },
    { title: '3. Data Protection', body: 'We use SSL encryption and the latest security technologies to protect your data. We do not sell or share your personal data with third parties without your consent.' },
    { title: '4. Cookies', body: 'We use cookies to improve your experience on the platform. You can disable them in your browser settings, though this may affect some functionality.' },
    { title: '5. Your Rights', body: 'You have the right to request access to, correction of, or deletion of your data at any time by contacting our support team.' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isRTL ? 'سياسة الخصوصية' : 'Privacy Policy'}
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
