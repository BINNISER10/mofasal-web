export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .fixed.bottom-6.left-6 { display: none !important; }
      `}</style>
      {children}
    </>
  );
}
