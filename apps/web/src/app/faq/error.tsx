'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function FAQError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ" description="حدث خطأ أثناء تحميل الأسئلة الشائعة." backLabel="الرئيسية" backHref="/" />;
}
