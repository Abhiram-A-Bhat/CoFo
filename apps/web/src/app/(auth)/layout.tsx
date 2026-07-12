import type { ReactNode } from "react";
import Link from "next/link";
import { WaveBackground } from "@/components/wave-background";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Animated background canvas */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <WaveBackground />
      </div>

      {/* Left panel — visible on large screens */}
      <div className="relative z-10 hidden w-[52%] flex-col justify-between p-14 lg:flex">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-black text-[#0a0a0a] text-sm tracking-tighter">
            CF
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">CoFo</span>
        </Link>

        {/* Centre copy */}
        <div className="space-y-6 max-w-md">
          <div>
            <h1 className="text-4xl font-bold tracking-tight leading-[1.15] text-white">
              Connecting founders
              <br />
              <span className="text-white/30">and investors directly.</span>
            </h1>
            <p className="mt-4 text-[14px] leading-relaxed text-white/40">
              Create a structured profile to show real traction, get matched based on thesis and ticket fit, and message counterparts directly.
            </p>
          </div>

          {/* Real product features */}
          <div className="space-y-4 pt-2">
            {[
              {
                title: "Structured pitch profiles",
                desc: "Organise traction, runway, and projections so investors get clean signal.",
              },
              {
                title: "Fit-ranked matching",
                desc: "Filter opportunities by industry sectors, ticket range, and investment mandates.",
              },
              {
                title: "Direct workspace messaging",
                desc: "Skip warm introductions and build relationships directly inside the application.",
              },
            ].map((feat) => (
              <div key={feat.title} className="space-y-0.5">
                <h4 className="text-[13px] font-semibold text-white">{feat.title}</h4>
                <p className="text-[12px] text-white/45 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footnote */}
        <div className="text-[11px] text-white/20">
          CoFo Workspace Integration
        </div>
      </div>

      {/* Right panel — form */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 lg:p-12">
        {children}
      </div>
    </main>
  );
}
