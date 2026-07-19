"use client";

import { ArrowRight, Building2, Loader2, Sparkles, Target, BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  getInvestorMatches,
  getStartupMatches,
  InvestorMatch,
  StartupMatch
} from "@/lib/api/matching";
import { VerificationBadges } from "@/features/profile-verification/verification-badges";

type MatchMode = "investors" | "startups";

export function MatchingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<MatchMode>("investors");
  const [investorMatches, setInvestorMatches] = useState<InvestorMatch[]>([]);
  const [startupMatches, setStartupMatches] = useState<StartupMatch[]>([]);
  const [contextName, setContextName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadMatches(nextMode = mode) {
    setMode(nextMode);
    setIsLoading(true);
    setError("");

    try {
      if (nextMode === "investors") {
        const response = await getInvestorMatches();
        setInvestorMatches(response.items);
        setContextName(response.startup_name);
      } else {
        const response = await getStartupMatches();
        setStartupMatches(response.items);
        setContextName(response.investor_name);
      }
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to load matches."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMatches("investors");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeItems = mode === "investors" ? investorMatches : startupMatches;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,rgba(45,212,191,0.10),transparent_72%)]" />
      <div className="relative mx-auto max-w-6xl space-y-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Fit engine
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">Matching</h1>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Compare startup and investor profiles using thesis, industry, keyword, and ticket-size fit.
            </p>
          </div>
          <div className="flex rounded-xl border border-white/10 bg-white/[0.04] p-1">
            <Button
              onClick={() => loadMatches("investors")}
              size="sm"
              type="button"
              variant={mode === "investors" ? "default" : "ghost"}
            >
              Investors
            </Button>
            <Button
              onClick={() => loadMatches("startups")}
              size="sm"
              type="button"
              variant={mode === "startups" ? "default" : "ghost"}
            >
              Startups
            </Button>
          </div>
        </div>

        <Card className="border-white/15">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="flex items-center text-lg">
              {mode === "investors" ? (
                <Target className="mr-2 h-5 w-5 text-primary" />
              ) : (
                <Building2 className="mr-2 h-5 w-5 text-primary" />
              )}
              {mode === "investors" ? "Investor matches" : "Startup matches"}
            </CardTitle>
            <CardDescription>
              {contextName
                ? `Ranked matches for ${contextName}.`
                : "Ranked matches will appear once your profile is available."}
            </CardDescription>
          </CardHeader>
        </Card>

        {error ? <Alert>{error}</Alert> : null}

        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading matches
          </div>
        ) : activeItems.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {mode === "investors"
              ? investorMatches.map((match) => (
                  <InvestorMatchCard key={match.investor_id} match={match} />
                ))
              : startupMatches.map((match) => (
                  <StartupMatchCard key={match.startup_id} match={match} />
                ))}
          </div>
        ) : (
          <Card className="border border-white/10 bg-[#0d0d0d]">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">No {mode === "investors" ? "investor" : "startup"} matches yet</h3>
                <p className="text-xs text-white/40 max-w-sm">
                  Complete and verify your profile metrics to feed the fit engine and generate target matching signals.
                </p>
              </div>
              <Button 
                onClick={() => router.push(mode === "investors" ? "/startup-profile" : "/investor-profile")}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 h-9"
              >
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

function InvestorMatchCard({ match }: { match: InvestorMatch }) {
  return (
    <Card className="transition-all duration-300 border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] bg-[#0d0d0d]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-lg text-white">{match.name}</CardTitle>
            <CardDescription className="text-white/40">{match.organization}</CardDescription>
          </div>
          <ScoreBadge score={match.match_score} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadges badges={match.verification_badges} />
          <Badge className="bg-white/[0.04] text-white/70 border border-white/10">{formatCurrency(match.ticket_size)} ticket</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 border-t border-white/[0.06] pt-4">
        <p className="line-clamp-3 text-sm text-white/60 leading-relaxed">
          {match.investment_thesis}
        </p>
        <ReasonList reasons={match.reasons} />
      </CardContent>
    </Card>
  );
}

function StartupMatchCard({ match }: { match: StartupMatch }) {
  return (
    <Card className="transition-all duration-300 border-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.05)] bg-[#0d0d0d]">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <CardTitle className="text-lg text-white">{match.startup_name}</CardTitle>
            <CardDescription className="text-white/40">{match.industry}</CardDescription>
          </div>
          <ScoreBadge score={match.match_score} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <VerificationBadges badges={match.verification_badges} />
          <Badge className="bg-white/[0.04] text-white/70 border border-white/10">{formatCurrency(match.funding_required)} raise</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 border-t border-white/[0.06] pt-4">
        <p className="line-clamp-3 text-sm text-white/60 leading-relaxed">{match.description}</p>
        <ReasonList reasons={match.reasons} />
      </CardContent>
    </Card>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
      <span className="text-lg font-bold leading-none text-emerald-400">{score}%</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/40 mt-1">Match</span>
    </div>
  );
}

function ReasonList({ reasons }: { reasons: string[] }) {
  return (
    <div className="space-y-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
        <BrainCircuit className="h-3.5 w-3.5" />
        <span>Match Rationale</span>
      </div>
      {reasons.map((reason) => (
        <div className="flex items-start gap-2 text-xs text-white/70" key={reason}>
          <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
          <span>{reason}</span>
        </div>
      ))}
    </div>
  );
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}

