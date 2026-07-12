import Link from "next/link";
import type { ReactNode } from "react";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footerText: string;
  footerHref: string;
  footerLinkText: string;
};

export function AuthFormShell({
  title,
  description,
  children,
  footerText,
  footerHref,
  footerLinkText,
}: AuthFormShellProps) {
  return (
    <div className="w-full max-w-sm">
      {/* Mobile-only logo */}
      <div className="mb-8 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-black text-[#0a0a0a] text-sm">
          CF
        </div>
        <span className="text-[15px] font-semibold text-white">CoFo</span>
      </div>

      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-[14px] text-white/40 leading-relaxed">{description}</p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-7 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-[13px] text-white/30">
        {footerText}{" "}
        <Link
          href={footerHref}
          className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          {footerLinkText}
        </Link>
      </p>
    </div>
  );
}
