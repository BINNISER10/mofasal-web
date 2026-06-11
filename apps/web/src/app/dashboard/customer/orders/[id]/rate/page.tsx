'use client';
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/stores/appStore';
import { reviewsApi } from '@/lib/api/reviews';
import toast from 'react-hot-toast';
import { Star, ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function RateOrderPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isRTL } = useAppStore();
  const [shopRating, setShopRating] = useState(0);
  const [tailorRating, setTailorRating] = useState(0);
  const [repRating, setRepRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (shopRating === 0) { toast.error(isRTL ? 'يرجى تقييم المتجر' : 'Please rate the shop'); return; }
    try {
      setIsSubmitting(true);
      await reviewsApi.create({ orderId: id as string, shopRating, tailorRating: tailorRating || undefined, representativeRating: repRating || undefined, comment: comment || undefined });
      setSubmitted(true);
      toast.success(isRTL ? 'شكراً لتقييمك!' : 'Thank you for your review!');
    } catch { toast.error(isRTL ? 'فشل إرسال التقييم' : 'Failed to submit review'); }
    finally { setIsSubmitting(false); }
  };

  if (submitted) {
    return <div className="flex items-center justify-center min-h-[70vh] p-6"><div className="text-center max-w-md mx-auto"><div className="w-24 h-24 rounded-full bg-[#00373E]/10 flex items-center justify-center mx-auto mb-6"><Star size={48} className="text-[#D4AF37] fill-[#D4AF37]" /></div><h1 className="text-2xl font-black text-[#00373E] mb-3">{isRTL ? 'شكراً لتقييمك!' : 'Thank You!'}</h1><p className="text-[#735B4D]/60 mb-6">{isRTL ? 'تقييمك يساعدنا على تحسين الخدمة' : 'Your review helps us improve'}</p><Button variant="primary" onClick={() => router.push('/dashboard/customer/orders')}>{isRTL ? 'العودة لطلباتي' : 'Back to Orders'}</Button></div></div>;
  }

  const renderStars = (rating: number, setRating: (n: number) => void, label: string) => (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#00373E]">{label}</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className="p-1 transition-transform hover:scale-110"><Star size={28} className={n <= rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#D0D6D7]'} /></button>)}
        {rating > 0 && <span className="text-sm font-bold text-[#00373E] ms-2">{rating}/5</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-[#F2E8D4]/30">{isRTL ? <ChevronRight size={20} className="text-[#735B4D]" /> : <ChevronLeft size={20} className="text-[#735B4D]" />}</button>
        <h1 className="text-xl font-bold text-[#00373E]">{isRTL ? 'تقييم الطلب' : 'Rate Order'}</h1>
      </div>
      <Card className="p-6 space-y-6">
        <div className="text-center mb-4"><Star size={40} className="text-[#D4AF37] mx-auto mb-2" /><h2 className="text-lg font-bold text-[#00373E]">{isRTL ? 'كيف كانت تجربتك؟' : 'How was your experience?'}</h2></div>
        {renderStars(shopRating, setShopRating, isRTL ? 'تقييم المتجر' : 'Shop Rating')}
        {renderStars(tailorRating, setTailorRating, isRTL ? 'تقييم الخياط' : 'Tailor Rating')}
        {renderStars(repRating, setRepRating, isRTL ? 'تقييم المندوب' : 'Representative Rating')}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#00373E]">{isRTL ? 'تعليق (اختياري)' : 'Comment (optional)'}</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={isRTL ? 'شاركنا رأيك...' : 'Share your thoughts...'} rows={4} className="w-full px-4 py-3 rounded-xl border border-[#D0D6D7]/30 bg-white text-[#00373E] placeholder-[#735B4D]/40 focus:outline-none focus:ring-2 focus:ring-[#00373E]/20 resize-none" />
        </div>
        <Button variant="gold" fullWidth size="lg" isLoading={isSubmitting} onClick={handleSubmit} icon={<Send size={18} />}>{isRTL ? 'إرسال التقييم' : 'Submit Review'}</Button>
      </Card>
    </div>
  );
}