"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { login } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/errors";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response?.token?.access_token) {
        localStorage.setItem("fundflow_access_token", response.token.access_token);
      }

      const saved = localStorage.getItem("fundflow_active_workspace");
      if (saved === "investor" || (response.user.role === "investor" && !saved)) {
        localStorage.setItem("fundflow_active_workspace", "investor");
        router.push("/startup-discovery");
      } else {
        localStorage.setItem("fundflow_active_workspace", "founder");
        router.push("/pitch-feed");
      }

      router.refresh();
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to log in."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
          {error}
        </div>
      ) : null}

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
          autoComplete="current-password"
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/20 outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 w-full rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-black hover:bg-emerald-400 active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isLoading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
