'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function TermsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ" description="حدث خطأ أثناء تحميل الشروط والأحكام." backLabel="الرئيسية" backHref="/" />;
}
