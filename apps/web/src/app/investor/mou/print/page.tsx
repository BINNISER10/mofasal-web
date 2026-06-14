import { MouDocument } from '@/components/investor/MouDocument';

export const metadata = {
  title: 'مذكرة تفاهم — PDF | مفصل',
  robots: { index: false, follow: false },
};

export default function MouPrintPage() {
  return <MouDocument mode="print" />;
}
