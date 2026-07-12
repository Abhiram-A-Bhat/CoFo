"use client";

import { Search, Heart, Send, Bookmark, Volume2, VolumeX, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";
import { FormEvent, useEffect, useState, useRef } from "react";
import Link from "next/link";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerificationBadges } from "@/features/profile-verification/verification-badges";
import { getApiErrorMessage } from "@/lib/api/errors";
import { getPitchFeed } from "@/lib/api/pitch-feed";
import type { StartupDiscoveryItem } from "@/lib/api/startup-discovery";
import { env } from "@/lib/config/env";
import { getMe, type AuthUser } from "@/lib/api/auth";
import { getMyInvestorProfile, type InvestorProfile } from "@/lib/api/investor-profile";
import { calculateMatchScore } from "@/lib/matching-algorithm";

const PAGE_SIZE = 20;

export function PitchFeedPage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [items, setItems] = useState<StartupDiscoveryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [investorProfile, setInvestorProfile] = useState<InvestorProfile | null>(null);

  async function loadFeed() {
    setIsLoading(true);
    setError("");

    try {
      // 1. Fetch Auth details
      let userObj: AuthUser | null = null;
      try {
        userObj = await getMe();
        setCurrentUser(userObj);
      } catch (e) {}

      // 2. Fetch Investor details if investor
      let invProfile: InvestorProfile | null = null;
      if (userObj && (userObj.role === "investor" || localStorage.getItem("fundflow_active_workspace") === "investor")) {
        try {
          invProfile = await getMyInvestorProfile();
          setInvestorProfile(invProfile);
        } catch (e) {}
      }

      // 3. Fetch Feed items
      const response = await getPitchFeed({
        limit: PAGE_SIZE,
        offset: 0,
        query: query.trim() || undefined,
        industry: industry.trim() || undefined
      });

      // 4. Score and Sort items using the algorithm if user is logged in
      let scoredItems = [...response.items];
      if (userObj) {
        scoredItems = scoredItems.map(item => {
          const match = calculateMatchScore(item, userObj, invProfile);
          return {
            ...item,
            // Attach transient match data
            matchScore: match.score,
            matchReasons: match.reasons
          };
        });
        
        // Sort items by score descending
        scoredItems.sort((a, b) => ((b as any).matchScore || 0) - ((a as any).matchScore || 0));
      }

      setItems(scoredItems);
      setTotal(response.total);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Unable to load pitch feed."));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadFeed();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            BridgeCapita Shorts
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Pitch Feed</h1>
        </div>

        <form className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]" onSubmit={onSubmit}>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/30" />
            <Input
              className="pl-9 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 h-10"
              id="query"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search startups, traction, keywords..."
              value={query}
            />
          </div>
          <Input
            className="bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/40 h-10"
            id="industry"
            onChange={(event) => setIndustry(event.target.value)}
            placeholder="Domain (e.g., AI, SaaS)"
            value={industry}
          />
          <Button
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold h-10 px-6 transition-all"
            disabled={isLoading}
            type="submit"
          >
            Search
          </Button>
        </form>
      </div>

      {/* Pitch Feed */}
      <div className="space-y-8 w-full max-w-5xl mx-auto">
        {error ? <Alert>{error}</Alert> : null}

        {items.length > 0 ? (
          items.map((startup) => (
            <PitchCard key={startup.id} startup={startup} />
          ))
        ) : isLoading ? (
          [1, 2, 3].map((i) => <PitchCardSkeleton key={i} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-sm text-white/30">
            No pitches found.
          </div>
        )}
      </div>
    </div>
  );
}

function PitchCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden animate-shimmer">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/[0.07] animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 rounded-md bg-white/[0.07] animate-pulse" />
            <div className="h-2.5 w-20 rounded-md bg-white/[0.04] animate-pulse" />
          </div>
        </div>
        <div className="h-5 w-14 rounded-full bg-emerald-500/10 animate-pulse" />
      </div>

      {/* Media */}
      <div className="h-[300px] w-full bg-neutral-900" />

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-4">
          <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
        </div>
        <div className="h-5 w-5 rounded bg-white/[0.06] animate-pulse" />
      </div>

      {/* Body */}
      <div className="px-4 pb-5 space-y-3">
        <div className="h-3.5 w-full rounded bg-white/[0.05] animate-pulse" />
        <div className="h-3.5 w-4/5 rounded bg-white/[0.04] animate-pulse" />

        {/* Metrics grid */}
        <div className="border-t border-white/[0.06] pt-4 grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-2">
              <div className="h-2.5 w-16 rounded bg-white/[0.05] animate-pulse" />
              <div className="h-3.5 w-20 rounded bg-white/[0.07] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PitchCard({ startup }: { startup: StartupDiscoveryItem }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  // Financial metrics open by default
  const [showMetrics, setShowMetrics] = useState(true);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  // Programmatically force play on mount. Try unmuted, fallback to muted if browser blocks.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser blocked unmuted autoplay, fallback to muted autoplay
          if (videoRef.current) {
            videoRef.current.muted = true;
            setMuted(true);
            videoRef.current.play().catch((err) => {
              console.log("Muted autoplay also blocked:", err);
            });
          }
        });
      }
    }
  }, []);

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#0d0d0d] overflow-hidden shadow-xl transition-all hover:border-white/[0.14]">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 font-bold text-emerald-400 text-xs">
            {startup.startup_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-white">{startup.startup_name}</h3>
              <VerificationBadges badges={startup.verification_badges} />
            </div>
            <span className="text-[11px] text-white/35">
              {startup.industry} • {startup.headquarters || "Global"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {((startup as any).matchScore !== undefined) && (
            <div 
              title={((startup as any).matchReasons || []).join("\n")}
              className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(16,185,129,0.3)] cursor-help"
            >
              {((startup as any).matchScore)}% Match
            </div>
          )}
          {startup.stage && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/15 text-[10px] font-medium animate-pulse">
              {startup.stage}
            </Badge>
          )}
        </div>
      </div>

      {/* Media & Dynamic Video Window */}
      <div className="relative w-full max-h-[580px] bg-neutral-950 flex items-center justify-center border-y border-white/[0.04] overflow-hidden">
        {startup.pitch_video_url ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[580px] object-contain cursor-pointer"
              loop
              autoPlay
              muted={muted}
              playsInline
              preload="auto"
              src={absoluteMediaUrl(startup.pitch_video_url)}
              onClick={(e) => {
                const video = e.currentTarget;
                if (video.paused) {
                  video.play().catch((err) => console.log("Play failed:", err));
                } else {
                  video.pause();
                }
              }}
            />
            {/* Professional control strip overlay (Bottom bar style, not floating Instagram circle) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex items-center justify-between opacity-90 hover:opacity-100 transition-opacity duration-200">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-white/70 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Short Pitch
                </span>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play().catch(() => {});
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                  className="rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 px-2.5 py-1 text-xs text-white transition-all"
                >
                  Play/Pause
                </button>
              </div>
              <button
                onClick={toggleMute}
                className="flex items-center gap-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 font-medium transition-all"
              >
                {muted ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Unmute Pitch</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Mute Pitch</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-emerald-950/20 to-[#0a0a0a] p-8 text-center">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
              Pitch deck summary
            </Badge>
            <h2 className="text-2xl font-bold text-white">{startup.startup_name}</h2>
            <p className="text-xs text-white/35 max-w-xs leading-relaxed">
              Founder has not uploaded a video yet. Explore their profile and metrics below.
            </p>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLiked(!liked)}
            className={`transition-all active:scale-125 ${liked ? "text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "text-white/60 hover:text-red-400"}`}
          >
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </button>
          <Link
            href="/messages"
            className="text-white/60 hover:text-emerald-400 transition-colors"
            title="Message this founder"
          >
            <Send className="h-5 w-5" />
          </Link>
        </div>
        <button
          onClick={() => setSaved(!saved)}
          className={`transition-all active:scale-125 ${saved ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "text-white/60 hover:text-emerald-400"}`}
        >
          <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Description & Metrics */}
      <div className="px-4 pb-5 space-y-4">
        <p className="text-sm text-white/80 leading-relaxed">
          <span className="font-semibold text-white mr-2">{startup.startup_name}</span>
          {startup.description}
        </p>

        {/* Financial Metrics — expanded by default */}
        <div className="border-t border-white/[0.06] pt-4">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors mb-3"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            {showMetrics ? (
              <>Hide financial metrics <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>View financial metrics &amp; traction <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>

          <div
            className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              showMetrics ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
            }`}
          >
            <div className="overflow-hidden">
              <div className="space-y-3 pb-1">
                {/* Key metrics grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Funding Required", value: currency(startup.funding_required) },
                    { label: "Valuation", value: currency(startup.valuation) },
                    { label: "ARR", value: currency(startup.annual_recurring_revenue) },
                    { label: "Runway", value: months(startup.runway_months) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                      <span className="text-white/40 block text-[11px]">{label}</span>
                      <span className="font-semibold text-white mt-1 block">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Traction */}
                {startup.traction_summary && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs">
                    <span className="text-emerald-400 font-semibold block mb-1.5">Traction</span>
                    <p className="text-white/70 leading-relaxed">{startup.traction_summary}</p>
                  </div>
                )}

                {/* Use of Funds */}
                {startup.use_of_funds && (
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-xs">
                    <span className="text-emerald-400 font-semibold block mb-1.5">Use of Funds</span>
                    <p className="text-white/70 leading-relaxed">{startup.use_of_funds}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function absoluteMediaUrl(url: string) {
  if (url.startsWith("http")) {
    return url;
  }
  return `${env.apiUrl}${url}`;
}

function currency(value: string | null) {
  if (!value) {
    return "Not provided";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(value));
}

function months(value: number | null) {
  return value === null ? "Not provided" : `${value} months`;
}
