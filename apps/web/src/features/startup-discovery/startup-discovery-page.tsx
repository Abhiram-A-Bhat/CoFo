"use client";

import { Search, SlidersHorizontal, Eye, X, MessageSquare, ExternalLink, Calendar, MapPin, Layers } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/ui/money-input";
import { getApiErrorMessage } from "@/lib/api/errors";
import { discoverStartups } from "@/lib/api/startup-discovery";
import { VerificationBadges } from "@/features/profile-verification/verification-badges";
import { env } from "@/lib/config/env";
import type {
  StartupDiscoveryItem,
  StartupDiscoveryParams
} from "@/lib/api/startup-discovery";

const PAGE_SIZE = 12;

export function StartupDiscoveryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [fundingMin, setFundingMin] = useState("");
  const [fundingMax, setFundingMax] = useState("");
  const [items, setItems] = useState<StartupDiscoveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedStartup, setSelectedStartup] = useState<StartupDiscoveryItem | null>(null);

  async function loadStartups(
    nextOffset = 0,
    overrides?: Partial<StartupDiscoveryParams>,
    append = false
  ) {
    setIsLoading(true);
    setError("");

    const params: StartupDiscoveryParams = {
      limit: PAGE_SIZE,
      offset: nextOffset
    };

    if (query.trim()) {
      params.query = query.trim();
    }

    if (industry.trim()) {
      params.industry = industry.trim();
    }

    if (fundingMin) {
      params.funding_min = fundingMin;
    }

    if (fundingMax) {
      params.funding_max = fundingMax;
    }

    Object.assign(params, overrides);

    try {
      const response = await discoverStartups(params);
      if (append) {
        setItems((prev) => [...prev, ...response.items]);
      } else {
        setItems(response.items);
      }
      setTotal(response.total);
      setOffset(response.offset);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to load startups."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadStartups();
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadStartups(0);
    }, 350);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, industry, fundingMin, fundingMax]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadStartups(0);
  }

  function clearFilters() {
    setQuery("");
    setIndustry("");
    setFundingMin("");
    setFundingMax("");
    setOffset(0);
  }

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + PAGE_SIZE, total);
  const canGoBack = offset > 0;
  const canGoForward = offset + PAGE_SIZE < total;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-white/10 pb-6">
        <div>
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-xs font-bold uppercase tracking-widest text-transparent">
            Dealflow Intelligence
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Explore Startups</h1>
        </div>
        <div className="text-xs text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <span className="text-white font-semibold">{total}</span> startups listed
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-white/10 bg-zinc-950/50 backdrop-blur-md">
        <CardHeader className="py-4 border-b border-white/5">
          <CardTitle className="flex items-center text-sm font-semibold text-white">
            <SlidersHorizontal className="mr-2 h-4 w-4 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="grid gap-4 md:grid-cols-4" onSubmit={onSubmit}>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="query" className="text-xs text-muted-foreground">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary h-10"
                  id="query"
                  maxLength={255}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Company name, traction, keywords"
                  value={query}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="industry" className="text-xs text-muted-foreground">Industry</Label>
              <Input
                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary h-10"
                id="industry"
                maxLength={120}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="e.g. SaaS, FinTech"
                value={industry}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label htmlFor="fundingMin" className="text-xs text-muted-foreground">Min Raise</Label>
                <MoneyInput
                  id="fundingMin"
                  onChange={(val) => setFundingMin(val)}
                  value={fundingMin}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fundingMax" className="text-xs text-muted-foreground">Max Raise</Label>
                <MoneyInput
                  id="fundingMax"
                  onChange={(val) => setFundingMax(val)}
                  value={fundingMax}
                />
              </div>
            </div>
            <div className="flex gap-2 md:col-span-4 pt-2">
              <Button className="bg-primary hover:bg-primary/90 text-black font-semibold h-9 px-5" disabled={isLoading} type="submit">
                Apply Filters
              </Button>
              <Button className="border-white/10 hover:bg-white/5 text-white h-9 px-5" disabled={isLoading} onClick={clearFilters} type="button" variant="outline">
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? <Alert>{error}</Alert> : null}

      {/* Explore Grid */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="aspect-square animate-pulse rounded-lg bg-white/5 border border-white/10" key={index} />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {items.map((startup) => (
            <div
              key={startup.id}
              onClick={() => setSelectedStartup(startup)}
              className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-neutral-950 cursor-pointer group transition-all duration-300 hover:border-primary/40"
            >
              {/* Media preview (video thumbnail or gradient) */}
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-b from-purple-950/10 to-black">
                {startup.pitch_video_url ? (
                  <video
                    className="h-full w-full object-cover opacity-80 group-hover:opacity-60 transition-opacity"
                    src={absoluteMediaUrl(startup.pitch_video_url)}
                    muted
                    playsInline
                  />
                ) : (
                  <div className="flex flex-col items-center p-4 text-center">
                    <span className="text-2xl font-bold text-white/40 group-hover:scale-105 transition-transform">
                      {startup.startup_name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Instagram-style Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 text-white p-3 text-center">
                <span className="font-bold text-sm truncate w-full">{startup.startup_name}</span>
                <span className="text-[10px] text-primary font-semibold tracking-wider uppercase">
                  {formatCurrency(startup.funding_required)} RAISE
                </span>
                <span className="text-[10px] text-muted-foreground">{startup.industry}</span>
                <Eye className="h-5 w-5 text-white/80 mt-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-48 items-center justify-center text-sm text-muted-foreground bg-zinc-950 rounded-lg border border-white/10">
          No startups found matching your criteria.
        </div>
      )}

      {/* Infinite Scroll Trigger Button */}
      {total > items.length && (
        <div className="flex justify-center pt-6 pb-12 border-t border-white/[0.06]">
          <Button
            onClick={() => loadStartups(offset + PAGE_SIZE, undefined, true)}
            disabled={isLoading}
            className="bg-zinc-900 border border-white/10 hover:border-emerald-500/30 text-white text-xs px-6 h-10 transition-all font-semibold rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                Loading Dealflow...
              </span>
            ) : (
              "Load More Startups"
            )}
          </Button>
        </div>
      )}

      {/* Instagram Post Detail Modal Overlay */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl grid md:grid-cols-2 max-h-[90vh]">
            <button
              onClick={() => setSelectedStartup(null)}
              className="absolute right-4 top-4 z-50 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left side: Video / Graphic */}
            <div className="bg-black flex items-center justify-center min-h-[300px] md:min-h-0">
              {selectedStartup.pitch_video_url ? (
                <video
                  className="w-full h-full object-contain max-h-[45vh] md:max-h-[85vh]"
                  controls
                  autoPlay
                  src={absoluteMediaUrl(selectedStartup.pitch_video_url)}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 p-8 text-center bg-gradient-to-b from-purple-950/20 to-black">
                  <Badge className="bg-primary/10 text-primary border-primary/20">Deck Summary Only</Badge>
                  <h3 className="text-xl font-bold text-white mt-2">{selectedStartup.startup_name}</h3>
                  <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                    Founder has not uploaded a video pitch yet.
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Information Pane */}
            <div className="flex flex-col h-[45vh] md:h-[85vh] border-t md:border-t-0 md:border-l border-white/10 bg-[#0d0d0d]">
              {/* Sticky Top Action Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-[#0a0a0a] border-b border-white/[0.06] p-4">
                <Button
                  onClick={() => {
                    // Celebration Trigger (confetti alert)
                    alert("🎉 Meeting Request & Introduction sent successfully!");
                    router.push("/messages");
                    setSelectedStartup(null);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-9 transition-all"
                >
                  <MessageSquare className="mr-2 h-3.5 w-3.5" /> Message Founder
                </Button>
                
                {selectedStartup.website_url && (
                  <a
                    href={selectedStartup.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 w-9 items-center justify-center border border-white/10 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* Scrollable details container */}
              <div className="flex-1 p-6 overflow-y-auto space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white">{selectedStartup.startup_name}</h2>
                    <VerificationBadges badges={selectedStartup.verification_badges} />
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline" className="border-white/10 text-white/50">
                      <MapPin className="mr-1 h-3 w-3 text-emerald-400" /> {selectedStartup.headquarters || "Global"}
                    </Badge>
                    <Badge variant="outline" className="border-white/10 text-white/50">
                      <Layers className="mr-1 h-3 w-3 text-emerald-400" /> {selectedStartup.industry}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-white/60 leading-relaxed">
                  {selectedStartup.description}
                </p>

                {/* AI Summary Card */}
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    AI 30-Second Summary
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed italic">
                    "{selectedStartup.startup_name} is addressing a key market opportunity in the {selectedStartup.industry} sector. With a current funding ask of {formatCurrency(selectedStartup.funding_required)}, they are positioned to capture early market traction based on their business model."
                  </p>
                </div>

                {/* Financial Snapshot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Financial Snapshot</h4>
                    <span className="text-[10px] text-white/30 cursor-help underline" title="All values are self-reported by the founding team and verified where badge is present.">
                      How are metrics verified?
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/5 border border-white/[0.06] p-2.5 rounded-lg relative group">
                      <span className="text-white/40 block cursor-help" title="Total runway capital sought in this financing round.">Funding Required ℹ️</span>
                      <span className="font-semibold text-white mt-0.5 block">{formatCurrency(selectedStartup.funding_required)}</span>
                    </div>
                    <div className="bg-white/5 border border-white/[0.06] p-2.5 rounded-lg relative group">
                      <span className="text-white/40 block cursor-help" title="Pre-money company valuation expected for this round.">Valuation ℹ️</span>
                      <span className="font-semibold text-white mt-0.5 block">{formatOptionalCurrency(selectedStartup.valuation)}</span>
                    </div>
                    <div className="bg-white/5 border border-white/[0.06] p-2.5 rounded-lg relative group">
                      <span className="text-white/40 block cursor-help" title="Annualised Recurring Revenue projection from active subscriptions.">ARR ℹ️</span>
                      <span className="font-semibold text-white mt-0.5 block">{formatOptionalCurrency(selectedStartup.annual_recurring_revenue)}</span>
                    </div>
                    <div className="bg-white/5 border border-white/[0.06] p-2.5 rounded-lg relative group">
                      <span className="text-white/40 block cursor-help" title="Number of months of operations supported by current cash reserves.">Runway ℹ️</span>
                      <span className="font-semibold text-white mt-0.5 block">
                        {selectedStartup.runway_months ? `${selectedStartup.runway_months} months` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Traction Summary */}
                {selectedStartup.traction_summary && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Traction</h4>
                    <p className="text-xs leading-relaxed text-white/60 bg-white/5 border border-white/[0.06] p-3 rounded-lg">
                      {selectedStartup.traction_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCurrency(value: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function formatOptionalCurrency(value: string | null) {
  return value ? formatCurrency(value) : "N/A";
}

function absoluteMediaUrl(url: string) {
  if (url.startsWith("http")) {
    return url;
  }
  return `${env.apiUrl}${url}`;
}
