'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import toast from 'react-hot-toast';
import { Star, Scissors, User, Car, CheckCircle2, ArrowRight, MessageSquare } from 'lucide-react';

const ORDER_ID = 'ORD-1284';

interface RatingItem {
  key: 'shop' | 'tailor' | 'representative';
  labelAr: string;
  labelEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: React.ReactNode;
  name: string;
  avatarBg: string;
}

const RATING_ITEMS: RatingItem[] = [
  {
    key: 'shop',
    labelAr: 'المتجر',
    labelEn: 'The Shop',
    subtitleAr: 'خياطة الرجال الراقية',
    subtitleEn: 'Premium Menswear Tailoring',
    icon: <Scissors size={22} />,
    name: 'خياطة الرجال الراقية',
    avatarBg: 'from-primary-600 to-primary-800',
  },
  {
    key: 'tailor',
    labelAr: 'الخياط',
    labelEn: 'The Tailor',
    subtitleAr: 'أستاذ علي محمد',
    subtitleEn: 'Master Ali Mohammed',
    icon: <Scissors size={22} />,
    name: 'علي محمد',
    avatarBg: 'from-gold-500 to-gold-700',
  },
  {
    key: 'representative',
    labelAr: 'مندوب القياس',
    labelEn: 'Measurement Rep',
    subtitleAr: 'ماجد الشمري',
    subtitleEn: 'Majed Al-Shammari',
    icon: <Car size={22} />,
    name: 'ماجد الشمري',
    avatarBg: 'from-blue-600 to-blue-800',
  },
];

const QUICK_TAGS_AR = {
  shop: ['جودة ممتازة', 'التزام بالمواعيد', 'سعر مناسب', 'نظافة عالية', 'خدمة ودية'],
  tailor: ['إتقان في الخياطة', 'دقة في القياس', 'اهتمام بالتفاصيل', 'سرعة الإنجاز', 'مهارة عالية'],
  representative: ['وصل في الوقت', 'احترافية عالية', 'لطيف ومتعاون', 'دقيق في القياس', 'مظهر مهني'],
};

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const LABELS = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={36}
              className={`transition-colors ${
                i <= (hovered || value)
                  ? 'fill-gold-400 text-gold-400'
                  : 'text-gray-200 dark:text-slate-700'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-gray-500 dark:text-slate-400 h-5">
        {LABELS[hovered || value] || ''}
      </span>
    </div>
  );
}

export default function RateOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isRTL } = useAppStore();

  const [ratings, setRatings] = useState<Record<string, number>>({ shop: 0, tailor: 0, representative: 0 });
  const [comments, setComments] = useState<Record<string, string>>({ shop: '', tailor: '', representative: '' });
  const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({ shop: [], tailor: [], representative: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (key: string, tag: string) => {
    setSelectedTags(prev => ({
      ...prev,
      [key]: prev[key].includes(tag) ? prev[key].filter(t => t !== tag) : [...prev[key], tag],
    }));
  };

  const canSubmit = Object.values(ratings).every(r => r > 0);

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error(isRTL ? 'يرجى تقييم جميع العناصر' : 'Please rate all elements');
      return;
    }
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 mb-3">
            {isRTL ? 'شكراً على تقييمك!' : 'Thank you for your review!'}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
            {isRTL
              ? 'تقييمك يساعد الخياطين على تحسين خدماتهم ويساعد العملاء الآخرين في اتخاذ قراراتهم.'
              : 'Your feedback helps tailors improve their services and helps other customers make decisions.'}
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={28} className={i <= Math.round(Object.values(ratings).reduce((a, b) => a + b, 0) / 3) ? 'fill-gold-400 text-gold-400' : 'text-gray-200'} />
            ))}
          </div>
          <Button variant="primary" fullWidth onClick={() => router.push(`/dashboard/customer/orders/${id}`)}>
            {isRTL ? 'العودة للطلب' : 'Back to Order'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 dark:text-slate-400 hover:text-primary-600 mb-4">
          <ArrowRight size={16} />
          <span>{isRTL ? 'رجوع' : 'Back'}</span>
        </button>
        <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100">
          {isRTL ? 'قيّم تجربتك' : 'Rate Your Experience'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {isRTL ? `طلب رقم ${id} • قيّم كل عنصر بشكل منفصل` : `Order ${id} • Rate each element separately`}
        </p>
      </div>

      {/* Rating Cards */}
      {RATING_ITEMS.map((item) => (
        <Card key={item.key} className="p-6 dark:bg-slate-800/60">
          {/* Entity Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.avatarBg} flex items-center justify-center text-white flex-shrink-0`}>
              {item.icon}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-slate-500 mb-0.5">
                {isRTL ? item.labelAr : item.labelEn}
              </p>
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-lg">{item.name}</h3>
            </div>
          </div>

          {/* Stars */}
          <StarInput
            value={ratings[item.key]}
            onChange={(v) => setRatings(prev => ({ ...prev, [item.key]: v }))}
          />

          {/* Quick Tags */}
          {ratings[item.key] > 0 && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2">
                {isRTL ? 'ما الذي أعجبك؟' : 'What did you like?'}
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_TAGS_AR[item.key].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(item.key, tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      selectedTags[item.key].includes(tag)
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-primary-400'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comment */}
          {ratings[item.key] > 0 && (
            <div className="mt-4">
              <div className="relative">
                <MessageSquare size={15} className="absolute top-3 start-3 text-gray-300 dark:text-slate-600" />
                <textarea
                  value={comments[item.key]}
                  onChange={(e) => setComments(prev => ({ ...prev, [item.key]: e.target.value }))}
                  placeholder={isRTL ? 'أضف تعليقاً اختيارياً...' : 'Add an optional comment...'}
                  rows={2}
                  className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Submit */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-gray-100 dark:border-slate-800 p-4">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {canSubmit
              ? (isRTL ? 'إرسال التقييم' : 'Submit Review')
              : (isRTL ? 'قيّم جميع العناصر للمتابعة' : 'Rate all elements to continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
