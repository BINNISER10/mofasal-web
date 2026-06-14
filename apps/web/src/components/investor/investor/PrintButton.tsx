'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-6 py-3 rounded-xl bg-[#00373E] text-white font-bold text-sm hover:opacity-90 transition"
    >
      طباعة / حفظ PDF
    </button>
  );
}
