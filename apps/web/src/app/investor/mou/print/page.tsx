import { MouPageClient } from '@/components/investor/MouPageClient';

export const metadata = {
  title: 'مذكرة تفاهم — PDF | مفصل',
  robots: { index: false, follow: false },
};

export default function MouPrintPage() {
  return <MouPageClient mode="print" showSignPanel={false} showFooter={false} />;
}
