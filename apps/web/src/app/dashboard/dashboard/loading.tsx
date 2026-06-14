export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-200 dark:bg-slate-700 rounded-xl mb-6" />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
            <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-7 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 mb-4">
        <div className="h-5 w-32 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-48 bg-gray-100 dark:bg-slate-700 rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700">
        <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 dark:border-slate-700 last:border-0">
            <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 bg-gray-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-slate-700/60 rounded" />
            </div>
            <div className="h-6 w-16 bg-gray-100 dark:bg-slate-700/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
