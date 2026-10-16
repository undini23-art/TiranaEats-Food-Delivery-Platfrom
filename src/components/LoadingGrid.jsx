export default function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-72 animate-pulse rounded-lg bg-white shadow-sm">
          <div className="h-40 rounded-t-lg bg-zinc-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-2/3 rounded bg-zinc-200" />
            <div className="h-4 w-1/2 rounded bg-zinc-200" />
            <div className="h-8 w-full rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
