"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Trophy, Sparkles, Building2, ArrowUpRight, Award } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/toast-context";
import { getFantasyPortfolio, type FantasyPortfolio } from "@/lib/api/retention";

export default function PortfolioPage() {
  const toast = useToast();
  const [data, setData] = useState<FantasyPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getFantasyPortfolio();
      setData(res);
    } catch (_) {
      toast.error("Failed to load Virtual Portfolio.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function currency(val: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <main className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" /> AngelArena League
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">AngelArena</h1>
          <p className="text-xs text-white/40 mt-1 max-w-xl">
            Test your startup scouting talent! Back high-potential startups with ₹10 Lakhs in virtual credits, track portfolio ROI, and climb the scout leaderboard.
          </p>
        </div>
        <Link href="/pitch-feed">
          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-9 px-5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Back Pitch in Arena
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Available Credits</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-xl font-bold text-emerald-400">{currency(data?.available_credits || 0)}</div>}
            <p className="text-[11px] text-white/30 mt-1">Free virtual capital</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Total Invested</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-xl font-bold text-white">{currency(data?.total_invested || 0)}</div>}
            <p className="text-[11px] text-white/30 mt-1">Deployed in startup bets</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-xl font-bold text-sky-400">{currency(data?.current_portfolio_value || 0)}</div>}
            <p className="text-[11px] text-white/30 mt-1">Current valuation</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Net Return</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-20" /> : (
              <div className={`text-xl font-bold ${data && data.net_return_percent >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {data?.net_return_percent.toFixed(1)}%
              </div>
            )}
            <p className="text-[11px] text-white/30 mt-1">Unrealized ROI gain</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Table */}
      <Card className="border-white/10 bg-[#0d0d0d]">
        <CardHeader className="p-6 border-b border-white/[0.06]">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-400" /> Your Virtual Angel Investments
          </CardTitle>
          <CardDescription className="text-xs text-white/40">
            Startups you backed with virtual capital. Gains increase as deals build traction.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
            </div>
          ) : (data?.investments || []).length > 0 ? (
            <div className="space-y-3">
              {(data?.investments || []).map((inv) => (
                <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] gap-3">
                  <div>
                    <span className="font-bold text-white text-sm block">{inv.startup_name}</span>
                    <span className="text-xs text-white/40 capitalize">{inv.industry}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-white/30 block text-[10px]">Invested</span>
                      <span className="font-semibold text-white">{currency(inv.amount)}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block text-[10px]">Current Value</span>
                      <span className="font-semibold text-sky-400">{currency(inv.current_value)}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block text-[10px]">ROI</span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px]">
                        +{inv.return_percent.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-3">
              <Trophy className="h-10 w-10 text-white/20 mx-auto" />
              <p className="text-xs text-white/40">You haven&apos;t placed any virtual startup predictions yet!</p>
              <Link href="/pitch-feed">
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-5 h-8">
                  Browse Pitches &amp; Predict
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Global Scout Leaderboard */}
      <Card className="border-white/10 bg-[#0d0d0d]">
        <CardHeader className="p-6 border-b border-white/[0.06]">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" /> Global Scout Leaderboard
          </CardTitle>
          <CardDescription className="text-xs text-white/40">
            Top predictors ranked by net virtual portfolio ROI
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {[
            { rank: "#1", name: "Aarav Sharma", score: "+45.2% ROI", val: "₹14.5L", badge: "🥇 Gold Scout" },
            { rank: "#2", name: "Priya Nair", score: "+38.7% ROI", val: "₹13.8L", badge: "🥈 Silver Scout" },
            { rank: "#3", name: "Rohan Patel", score: "+29.4% ROI", val: "₹12.9L", badge: "🥉 Bronze Scout" },
            { rank: "#4", name: "You (Your Account)", score: `${data?.net_return_percent.toFixed(1) || 0}% ROI`, val: currency(data?.current_portfolio_value || 1000000), badge: "🚀 Active Scout" },
          ].map((scout) => (
            <div key={scout.rank} className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${scout.rank === "#4" ? "border-emerald-500/40 bg-emerald-500/10 font-bold text-white" : "border-white/[0.06] bg-white/[0.02] text-white/80"}`}>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-amber-400 text-sm w-6">{scout.rank}</span>
                <div>
                  <span className="font-semibold block">{scout.name}</span>
                  <span className="text-[10px] text-white/40">{scout.badge}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-400 block">{scout.score}</span>
                <span className="text-[10px] text-white/40">{scout.val}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
