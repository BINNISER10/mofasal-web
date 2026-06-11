'use client';
import { PublicErrorBoundary } from '@/components/shared/PublicErrorBoundary';
export default function ConfirmError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PublicErrorBoundary error={error} reset={reset} title="خطأ في التأكيد" description="حدث خطأ أثناء تأكيد حسابك. يرجى المحاولة مجدداً." backLabel="الرئيسية" backHref="/" />;
}
