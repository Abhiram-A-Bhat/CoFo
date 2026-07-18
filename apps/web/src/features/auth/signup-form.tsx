"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { signup, getGoogleAuthUrl } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

const INVESTMENT_DOMAINS = [
  "AI",
  "Fintech",
  "Healthtech",
  "Climate",
  "SaaS",
  "Consumer",
  "Deeptech",
  "Marketplace",
  "Enterprise",
  "Edtech"
];

export function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"founder" | "investor">("founder");
  const [investmentInterests, setInvestmentInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const auth = await signup({
        email,
        password,
        full_name: fullName || undefined,
        role,
        investment_interests: role === "investor" ? investmentInterests : []
      });
      
      if (auth?.token?.access_token) {
        localStorage.setItem("fundflow_access_token", auth.token.access_token);
      }
      
      router.push("/choose-interface");
      router.refresh();
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to create account."));
    } finally {
      setIsLoading(false);
    }
  }

  function toggleInvestmentInterest(domain: string) {
    setInvestmentInterests((currentInterests) =>
      currentInterests.includes(domain)
        ? currentInterests.filter((interest) => interest !== domain)
        : [...currentInterests, domain]
    );
  }

  function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setTimeout(() => {
      setIsGoogleLoading(false);
    }, 8000);
    window.location.href = getGoogleAuthUrl();
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      ) : null}

      {/* Google Sign Up */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-[14px] font-medium text-white transition-all hover:bg-white/[0.08] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGoogleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
        {isGoogleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.08]" />
        <span className="text-[12px] text-white/30">or sign up with email</span>
        <div className="h-px flex-1 bg-white/[0.08]" />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="fullName" className="block text-[13px] font-medium text-white/60">
          Full name
        </label>
        <input
          autoComplete="name"
          id="fullName"
          name="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ada Lovelace"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-[13px] font-medium text-white/60">
          Email address
        </label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-[13px] font-medium text-white/60">
          Password
        </label>
        <input
          autoComplete="new-password"
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 8 characters with 1 capital"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-[13px] font-medium text-white/60">Workspace Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("founder")}
            className={`rounded-xl py-2.5 text-[13px] font-bold border transition-all ${
              role === "founder"
                ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                : "bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            Founder
          </button>
          <button
            type="button"
            onClick={() => setRole("investor")}
            className={`rounded-xl py-2.5 text-[13px] font-bold border transition-all ${
              role === "investor"
                ? "bg-orange-500 text-white border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                : "bg-white/[0.03] text-white/60 border-white/10 hover:border-white/20 hover:text-white"
            }`}
          >
            Investor
          </button>
        </div>
      </div>

      {/* Smoothly expanding container for Investor Interests */}
      <div 
        className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          role === "investor" 
            ? "grid-rows-[1fr] opacity-100 mt-4 border-t border-white/[0.06] pt-4" 
            : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2.5 pb-2">
            <label className="block text-[13px] font-medium text-white/60">
              Investment Interests
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INVESTMENT_DOMAINS.map((domain) => {
                const selected = investmentInterests.includes(domain);
                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleInvestmentInterest(domain)}
                    className={`rounded-xl py-2 px-3 text-[12px] font-medium border text-left transition-all duration-200 active:scale-[0.97] ${
                      selected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                        : "bg-white/[0.02] border-white/15 text-white/60 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    {domain}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed">
              Select sectors to personalize discovery feed and recommendations.
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-4 w-full rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-black hover:bg-emerald-400 active:scale-[0.99] hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
