// Instant skeleton shown while the dashboard layout authenticates the user.
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar skeleton */}
      <aside className="hidden w-64 border-r border-white/[0.06] px-4 py-8 md:flex md:flex-col justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <div className="h-8 w-28 rounded-lg bg-white/[0.06] animate-pulse mx-3" />
          {/* Nav items */}
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </div>
        {/* User */}
        <div className="space-y-3 border-t border-white/[0.06] pt-4">
          <div className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
          <div className="flex items-center gap-3 px-3">
            <div className="h-8 w-8 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="space-y-1 flex-1">
              <div className="h-3 w-24 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-2.5 w-16 rounded bg-white/[0.03] animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content — pitch feed skeleton */}
      <main className="flex-1 md:pl-64 pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 space-y-6">
          {/* Header */}
          <div className="border-b border-white/[0.08] pb-6 space-y-4">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-emerald-500/20 animate-pulse" />
              <div className="h-8 w-40 rounded-xl bg-white/[0.07] animate-pulse" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 flex-1 rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-10 w-36 rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-10 w-20 rounded-xl bg-emerald-500/10 animate-pulse" />
            </div>
          </div>

          {/* Feed cards */}
          {[1, 2, 3].map((i) => (
            <PitchCardSkeleton key={i} />
          ))}
        </div>
      </main>

      {/* Mobile nav skeleton */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-white/[0.06] bg-[#0a0a0a]/90 flex items-center justify-around px-2 md:hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-4 w-4 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-2 w-8 rounded bg-white/[0.04] animate-pulse" />
          </div>
        ))}
      </nav>
    </div>
  );
}

function PitchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-white/[0.07] animate-pulse" />
            <div className="h-2.5 w-20 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </div>
        <div className="h-5 w-14 rounded-full bg-emerald-500/10 animate-pulse" />
      </div>

      {/* Media */}
      <div className="aspect-video w-full bg-neutral-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite] -translate-x-full" />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-4">
          <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
        </div>
        <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
      </div>

      {/* Description */}
      <div className="px-4 pb-4 space-y-2">
        <div className="h-3.5 w-full rounded bg-white/[0.05] animate-pulse" />
        <div className="h-3.5 w-4/5 rounded bg-white/[0.04] animate-pulse" />

        {/* Metrics grid */}
        <div className="border-t border-white/[0.06] pt-4 mt-3 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-1.5">
              <div className="h-2.5 w-16 rounded bg-white/[0.05] animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-white/[0.07] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
