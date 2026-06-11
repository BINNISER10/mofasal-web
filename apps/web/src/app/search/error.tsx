'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function SearchError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ في البحث" description="حدث خطأ أثناء البحث. يرجى المحاولة مجدداً." backLabel="الرئيسية" backHref="/" />;
}
