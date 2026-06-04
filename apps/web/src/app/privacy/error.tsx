'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function PrivacyError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ" description="حدث خطأ أثناء تحميل سياسة الخصوصية." backLabel="الرئيسية" backHref="/" />;
}
