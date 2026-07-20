"use client";

import { useEffect, useState } from "react";
import { TrendingUp, BarChart3, Building2, Users, DollarSign, Award, Sparkles, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getEcosystemInsights, type EcosystemInsights } from "@/lib/api/retention";

export default function InsightsPage() {
  const [data, setData] = useState<EcosystemInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getEcosystemInsights();
        setData(res);
      } catch (_) {}
      setIsLoading(false);
    }
    loadData();
  }, []);

  function formatCurrency(val: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  }

  return (
    <main className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-white/[0.08] pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Ecosystem Intelligence
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Valuation &amp; Market Insights</h1>
        <p className="text-xs text-white/40 mt-1 max-w-xl">
          Real-time fundraising benchmarks, average deal sizes, and industry activity trends across BridgeCapita.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Total Startups</CardTitle>
            <Building2 className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold text-white">{data?.total_startups}</div>}
            <p className="text-[11px] text-white/30 mt-1">Actively seeking capital</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Active Investors</CardTitle>
            <Users className="h-4 w-4 text-sky-400" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-20" /> : <div className="text-2xl font-bold text-white">{data?.total_investors}</div>}
            <p className="text-[11px] text-white/30 mt-1">Angels, VCs &amp; Syndicates</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Avg. Valuation</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-lg font-bold text-emerald-400">{formatCurrency(data?.avg_valuation_inr || 0)}</div>}
            <p className="text-[11px] text-white/30 mt-1">Median startup valuation benchmark</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-white/40">Avg. Raise Target</CardTitle>
            <Activity className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-lg font-bold text-purple-400">{formatCurrency(data?.avg_funding_required_inr || 0)}</div>}
            <p className="text-[11px] text-white/30 mt-1">Average check size requested</p>
          </CardContent>
        </Card>
      </div>

      {/* Breakdown Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Sectors */}
        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-6 pb-4 border-b border-white/[0.06]">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              Most Active Industries
            </CardTitle>
            <CardDescription className="text-xs text-white/40">
              Sector concentration across all published startup pitches
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
              </div>
            ) : (data?.top_industries || []).length > 0 ? (
              (data?.top_industries || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                  <span className="text-xs font-semibold text-white capitalize">{item.industry}</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                    {item.count} startups
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/30 text-center py-4">No sector data available yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Platform Match Engine Analytics */}
        <Card className="border-white/10 bg-[#0d0d0d]">
          <CardHeader className="p-6 pb-4 border-b border-white/[0.06]">
            <CardTitle className="text-base text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              Fit Engine Activity
            </CardTitle>
            <CardDescription className="text-xs text-white/40">
              Algorithmic match calculations performed
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/60">Total Pairwise Match Computations:</span>
                <span className="font-bold text-emerald-400">{data?.active_matches_count || 0}</span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Our fit engine automatically scores startup thesis against investor ticket sizes to rank high-conviction deals.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
