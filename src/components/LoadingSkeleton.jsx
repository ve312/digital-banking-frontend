export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-lg">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-slate-200 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse h-32 bg-white rounded-2xl p-5 flex flex-col justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-8 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
