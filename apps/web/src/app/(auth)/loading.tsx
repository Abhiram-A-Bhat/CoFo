// Instant skeleton shown by Next.js during the auth route transition.
// This prevents the blank white flash while the real layout loads.
export default function AuthLoading() {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Left panel skeleton */}
      <div className="hidden w-[52%] flex-col justify-between p-14 lg:flex">
        {/* Logo */}
        <div className="h-8 w-28 rounded-lg bg-white/[0.06] animate-pulse" />

        {/* Copy block */}
        <div className="space-y-6 max-w-md">
          <div className="space-y-3">
            <div className="h-10 w-3/4 rounded-xl bg-white/[0.06] animate-pulse" />
            <div className="h-10 w-1/2 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-4 w-full rounded-lg bg-white/[0.04] animate-pulse mt-4" />
            <div className="h-4 w-5/6 rounded-lg bg-white/[0.03] animate-pulse" />
          </div>
          <div className="space-y-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-3.5 w-40 rounded-md bg-white/[0.06] animate-pulse" />
                <div className="h-3 w-full rounded-md bg-white/[0.03] animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="h-3 w-32 rounded bg-white/[0.04] animate-pulse" />
      </div>

      {/* Right panel — form skeleton */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm space-y-5">
          <div className="space-y-2">
            <div className="h-7 w-36 rounded-lg bg-white/[0.07] animate-pulse" />
            <div className="h-4 w-64 rounded-lg bg-white/[0.04] animate-pulse" />
          </div>
          <div className="space-y-3 pt-2">
            <div className="h-12 w-full rounded-xl bg-white/[0.05] animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-white/[0.05] animate-pulse" />
            <div className="h-12 w-full rounded-xl bg-emerald-500/10 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
