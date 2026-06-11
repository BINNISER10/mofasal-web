'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function CheckoutError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ في الدفع" description="حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مجدداً." backLabel="العودة للسلة" backHref="/shops" />;
}
