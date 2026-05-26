'use client';
import React, { useState } from 'react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useAppStore } from '@/lib/stores/appStore';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const { isRTL } = useAppStore();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {isRTL ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-gray-500">{isRTL ? 'نحن هنا للمساعدة في أي وقت' : 'We\'re here to help anytime'}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            {[
              { icon: <Phone size={20} />, label: isRTL ? 'الهاتف' : 'Phone', value: '+966 55 123 4567' },
              { icon: <Mail size={20} />, label: isRTL ? 'البريد الإلكتروني' : 'Email', value: 'info@mufasal.com' },
              { icon: <MapPin size={20} />, label: isRTL ? 'العنوان' : 'Address', value: isRTL ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                  <p className="font-semibold text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <Send size={28} className="text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{isRTL ? 'تم الإرسال بنجاح!' : 'Message Sent!'}</h3>
                <p className="text-gray-500 text-sm">{isRTL ? 'سنرد عليك خلال 24 ساعة' : 'We\'ll get back to you within 24 hours'}</p>
                <button onClick={() => setSent(false)} className="mt-4 text-primary-600 text-sm font-medium hover:underline">
                  {isRTL ? 'إرسال رسالة أخرى' : 'Send another message'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-gray-900 mb-4">{isRTL ? 'أرسل رسالة' : 'Send a Message'}</h3>
                {[
                  { key: 'name', label: isRTL ? 'الاسم' : 'Name', type: 'text' },
                  { key: 'email', label: isRTL ? 'البريد الإلكتروني' : 'Email', type: 'email' },
                  { key: 'subject', label: isRTL ? 'الموضوع' : 'Subject', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      value={(form as any)[field.key]}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{isRTL ? 'الرسالة' : 'Message'}</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
                >
                  <Send size={16} />
                  {isRTL ? 'إرسال' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
