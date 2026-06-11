export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900" />
          <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full bg-primary-600/10 flex items-center justify-center">
            <span className="text-lg font-black text-primary-600">م</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 dark:text-slate-500 animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
}
