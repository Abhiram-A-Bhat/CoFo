"use client";

import { 
  Search, 
  Heart, 
  Send, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  MessageSquare, 
  Loader2,
  X,
  Sparkles,
  Info,
  Share2
} from "lucide-react";
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
import { getPitchComments, addPitchComment, toggleWatchlist, type PitchComment } from "@/lib/api/retention";
import { useToast } from "@/lib/toast-context";
import { ShareModal } from "@/components/share-modal";

const PAGE_SIZE = 20;

type ScoredStartupDiscoveryItem = StartupDiscoveryItem & {
  matchScore?: number;
  matchReasons?: string[];
};

export function PitchFeedPage() {
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("");
  const [items, setItems] = useState<ScoredStartupDiscoveryItem[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  async function loadFeed() {
    setIsLoading(true);
    setError("");

    try {
      let userObj: AuthUser | null = null;
      try {
        userObj = await getMe();
      } catch (_e) {}

      let invProfile: InvestorProfile | null = null;
      if (userObj && (userObj.role === "investor" || localStorage.getItem("fundflow_active_workspace") === "investor")) {
        try {
          invProfile = await getMyInvestorProfile();
        } catch (_e) {}
      }

      const response = await getPitchFeed({
        limit: PAGE_SIZE,
        offset: 0,
        query: query.trim() || undefined,
        industry: industry.trim() || undefined
      });

      let scoredItems: ScoredStartupDiscoveryItem[] = [...response.items];
      if (userObj) {
        scoredItems = scoredItems.map(item => {
          const match = calculateMatchScore(item, userObj, invProfile);
          return {
            ...item,
            matchScore: match.score,
            matchReasons: match.reasons
          };
        });
        scoredItems.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      }

      setItems(scoredItems);
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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] md:min-h-screen py-2 sm:py-4">
      {/* Search Header Bar (Floating Compact) */}
      <div className="w-full max-w-[420px] mb-3 px-2">
        <form className="flex gap-2" onSubmit={onSubmit}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
            <Input
              className="pl-8 bg-white/[0.06] border-white/10 text-white placeholder:text-white/30 text-xs h-9 focus-visible:ring-emerald-500/40 rounded-xl"
              id="query"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search pitches &amp; startups..."
              value={query}
            />
          </div>
          <Button
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-9 px-4 rounded-xl transition-all"
            disabled={isLoading}
            type="submit"
          >
            Find
          </Button>
        </form>
      </div>

      {/* Fullscreen Vertical Reel Container */}
      <div className="relative w-full max-w-[420px] h-[calc(100vh-140px)] min-h-[580px] max-h-[780px] bg-black rounded-3xl border border-white/15 overflow-hidden shadow-2xl">
        {error ? (
          <div className="p-4"><Alert>{error}</Alert></div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            <span className="text-xs font-medium">Loading Pitch Reels...</span>
          </div>
        ) : items.length > 0 ? (
          <div 
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
            onScroll={(e) => {
              const el = e.currentTarget;
              const index = Math.round(el.scrollTop / el.clientHeight);
              if (index !== activeIndex && index >= 0 && index < items.length) {
                setActiveIndex(index);
              }
            }}
          >
            {items.map((startup, idx) => (
              <ReelItem key={startup.id} startup={startup} isActive={idx === activeIndex} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
            <Sparkles className="h-8 w-8 text-emerald-400" />
            <p className="text-xs text-white/40">No pitch reels found matching your query.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * REEL ITEM (INSTAGRAM SHORTS STYLE VERTICAL PLAYER)
 * ───────────────────────────────────────────────────────────── */
function ReelItem({ startup, isActive }: { startup: ScoredStartupDiscoveryItem; isActive: boolean }) {
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(12);
  const [saved, setSaved] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PitchComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const [showMetrics, setShowMetrics] = useState(false);
  const [expandDesc, setExpandDesc] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Play/pause based on scroll active status
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.currentTime = 0;
        const p = videoRef.current.play();
        if (p !== undefined) {
          p.then(() => setIsPlaying(true)).catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              setMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
          });
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleToggleWatchlist = async () => {
    try {
      const res = await toggleWatchlist("startup", startup.id);
      setSaved(res.saved);
      if (res.saved) {
        toast.success(`Saved ${startup.startup_name} to Watchlist`);
      } else {
        toast.info(`Removed from Watchlist`);
      }
    } catch (_) {
      setSaved(!saved);
    }
  };

  const handleLoadComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await getPitchComments(startup.id);
        setComments(res.items);
      } catch (_) {}
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setPostingComment(true);
    try {
      const newComment = await addPitchComment(startup.id, commentInput.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentInput("");
      toast.success("Comment posted!");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Could not post comment"));
    } finally {
      setPostingComment(false);
    }
  };

  return (
    <div className="relative h-full w-full snap-start snap-always bg-black overflow-hidden flex items-center justify-center select-none">
      {/* Video Stream or Poster Fallback */}
      {startup.pitch_video_url ? (
        <video
          ref={videoRef}
          className="h-full w-full object-cover cursor-pointer"
          loop
          playsInline
          muted={muted}
          src={absoluteMediaUrl(startup.pitch_video_url)}
          onClick={togglePlay}
          onDoubleClick={handleLike}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-emerald-950/40 via-[#0a0a0a] to-black p-8 text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-2xl">
            {startup.startup_name.slice(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{startup.startup_name}</h2>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
            {startup.stage || "Early Stage"} · {startup.industry}
          </Badge>
          <p className="text-xs text-white/40 max-w-xs leading-relaxed">
            Tap metrics button on the right to view financial snapshot &amp; traction data.
          </p>
        </div>
      )}

      {/* Top Header Control Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Pitch Reel</span>
        </div>
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 hover:text-white"
        >
          {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Right Floating Action Icons Bar (Instagram Reels Style) */}
      <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4">
        {/* Match Score Badge */}
        {startup.matchScore !== undefined && (
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-black font-extrabold text-xs shadow-[0_0_16px_rgba(16,185,129,0.5)]">
              {startup.matchScore}%
            </div>
            <span className="text-[9px] font-bold uppercase text-white/60">Match</span>
          </div>
        )}

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border transition-all active:scale-125 ${liked ? "border-red-500/40 text-red-500 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.4)]" : "border-white/10 text-white/80 group-hover:text-white"}`}>
            <Heart className="h-5 w-5" fill={liked ? "currentColor" : "none"} />
          </div>
          <span className="text-[10px] font-semibold text-white/70">{likeCount}</span>
        </button>

        {/* Comments */}
        <button onClick={handleLoadComments} className="flex flex-col items-center gap-1 group">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border transition-all ${showComments ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-white/80 group-hover:text-white"}`}>
            <MessageSquare className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold text-white/70">{comments.length}</span>
        </button>

        {/* Watchlist */}
        <button onClick={handleToggleWatchlist} className="flex flex-col items-center gap-1 group">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border transition-all active:scale-125 ${saved ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-white/80 group-hover:text-white"}`}>
            <Bookmark className="h-5 w-5" fill={saved ? "currentColor" : "none"} />
          </div>
          <span className="text-[10px] font-semibold text-white/70">Save</span>
        </button>

        {/* Financial Metrics Sheet Toggle */}
        <button onClick={() => setShowMetrics(!showMetrics)} className="flex flex-col items-center gap-1 group">
          <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border transition-all ${showMetrics ? "border-sky-500/40 text-sky-400 bg-sky-500/10" : "border-white/10 text-white/80 group-hover:text-white"}`}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold text-white/70">Data</span>
        </button>

        {/* Share */}
        <button onClick={() => setIsShareOpen(true)} className="flex flex-col items-center gap-1 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 group-hover:text-emerald-400 transition-all">
            <Share2 className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold text-white/70">Share</span>
        </button>

        {/* Direct Message */}
        <Link href="/messages" className="flex flex-col items-center gap-1 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/80 group-hover:text-emerald-400 transition-all">
            <Send className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-semibold text-white/70">Chat</span>
        </Link>
      </div>

      {/* Bottom Content Info Overlay */}
      <div className="absolute bottom-0 left-0 right-14 p-4 pb-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 space-y-2 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs">
            {startup.startup_name.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">{startup.startup_name}</h3>
          <VerificationBadges badges={startup.verification_badges} />
        </div>

        <p className="text-xs text-white/80 leading-snug line-clamp-2">
          {startup.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-[10px] text-white/50 pt-1">
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-white/80">{startup.industry}</span>
          <span>Raise: {currency(startup.funding_required)}</span>
          <span>Valuation: {currency(startup.valuation)}</span>
        </div>
      </div>

      {/* Comments Slide-up Sheet */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 top-1/3 z-30 bg-[#0d0d0d] border-t border-white/15 rounded-t-3xl p-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Comments ({comments.length})</span>
            <button onClick={() => setShowComments(false)} className="p-1 text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {loadingComments ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" /></div>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <div key={c.id} className="p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs space-y-1">
                  <div className="flex justify-between text-white/40 text-[10px]">
                    <span className="font-semibold text-white capitalize">{c.user_name} ({c.user_role})</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white/80">{c.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/30 text-center py-6">No comments yet. Ask the founder a question!</p>
            )}
          </div>

          <form onSubmit={handlePostComment} className="flex gap-2 pt-2 border-t border-white/[0.06]">
            <Input
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              className="bg-white/[0.06] border-white/10 text-white text-xs h-9"
            />
            <Button type="submit" disabled={postingComment} className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-9 px-4">
              {postingComment ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Post"}
            </Button>
          </form>
        </div>
      )}

      {/* Financial Metrics Slide-up Sheet */}
      {showMetrics && (
        <div className="absolute inset-x-0 bottom-0 top-1/4 z-30 bg-[#0d0d0d] border-t border-white/15 rounded-t-3xl p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Financial Diligence &amp; Traction
            </span>
            <button onClick={() => setShowMetrics(false)} className="p-1 text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
              <span className="text-white/40 text-[10px] block">Funding Required</span>
              <span className="font-bold text-white">{currency(startup.funding_required)}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
              <span className="text-white/40 text-[10px] block">Valuation</span>
              <span className="font-bold text-white">{currency(startup.valuation)}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
              <span className="text-white/40 text-[10px] block">ARR</span>
              <span className="font-bold text-white">{currency(startup.annual_recurring_revenue)}</span>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl">
              <span className="text-white/40 text-[10px] block">Runway</span>
              <span className="font-bold text-white">{startup.runway_months ? `${startup.runway_months} mos` : "N/A"}</span>
            </div>
          </div>

          {startup.traction_summary && (
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-emerald-400 block">Traction Summary</span>
              <p className="text-white/70 text-[11px] leading-relaxed">{startup.traction_summary}</p>
            </div>
          )}

          {startup.use_of_funds && (
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-emerald-400 block">Use of Funds</span>
              <p className="text-white/70 text-[11px] leading-relaxed">{startup.use_of_funds}</p>
            </div>
          )}
        </div>
      )}

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={startup.startup_name}
      />
    </div>
  );
}

function absoluteMediaUrl(url: string) {
  if (url.startsWith("http")) return url;
  return `${env.apiUrl}${url}`;
}

function currency(value: string | null) {
  if (!value) return "N/A";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(Number(value));
}
