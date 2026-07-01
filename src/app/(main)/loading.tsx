export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="shimmer h-9 w-64 rounded-lg" />
        <div className="shimmer h-4 w-80 rounded" />
      </div>

      {/* category card row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer h-28 rounded-2xl" />
        ))}
      </div>

      {/* two shelves */}
      {Array.from({ length: 2 }).map((_, r) => (
        <div key={r} className="space-y-3">
          <div className="shimmer h-6 w-48 rounded" />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-40 shrink-0 space-y-3">
                <div className="shimmer aspect-square w-full rounded-xl" />
                <div className="shimmer h-4 w-3/4 rounded" />
                <div className="shimmer h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
