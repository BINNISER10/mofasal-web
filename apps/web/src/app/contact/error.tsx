'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function ContactError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ في صفحة التواصل" description="حدث خطأ. يرجى المحاولة مجدداً." backLabel="الرئيسية" backHref="/" />;
}
