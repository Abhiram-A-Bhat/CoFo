"use client";

import { useState } from "react";
import { Check, Zap, ShieldCheck, Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/toast-context";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: "founder" | "investor";
}

export function PricingModal({ isOpen, onClose, defaultPlan = "founder" }: PricingModalProps) {
  const toast = useToast();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = (planName: string) => {
    setLoadingPlan(planName);
    setTimeout(() => {
      setLoadingPlan(null);
      toast.success(`Redirecting to secure checkout for ${planName}...`);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-emerald-500/30 bg-[#0d0d0d] p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" /> Unlock Pro Fundraising Power
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Accelerate Your Deal Velocity
          </h2>
          <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto">
            Get 10x visibility, unlimited investor introductions, and verified diligence badges.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] p-1 mt-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${billingCycle === "monthly" ? "bg-white text-black font-bold shadow-md" : "text-white/50 hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all flex items-center gap-1 ${billingCycle === "yearly" ? "bg-emerald-500 text-black font-bold shadow-md" : "text-white/50 hover:text-white"}`}
            >
              Yearly <span className="text-[9px] bg-black/30 text-white px-1.5 py-0.5 rounded-full">Save 25%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Founder Pro */}
          <div className="relative rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 via-[#111] to-[#0d0d0d] p-6 space-y-5">
            <div className="space-y-1">
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                FOUNDER PRO
              </Badge>
              <h3 className="text-xl font-bold text-white">Raise Pro</h3>
              <p className="text-xs text-white/40">For founders actively raising pre-seed to Series A rounds.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">
                {billingCycle === "yearly" ? "₹1,999" : "₹2,499"}
              </span>
              <span className="text-xs text-white/40">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-white/70">
              {[
                "Top Priority placement in Pitch Feed Reels",
                "Gold 'Featured Pitch' badge & border",
                "Unlimited direct investor introductions",
                "Pitch Deck PDF upload & Data Room access",
                "Who Viewed My Profile & Pitch Video Analytics",
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe("Founder Pro")}
              disabled={loadingPlan === "Founder Pro"}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-10 rounded-xl transition-all"
            >
              {loadingPlan === "Founder Pro" ? "Processing..." : "Upgrade Founder Pro"}
            </Button>
          </div>

          {/* Investor Pass */}
          <div className="relative rounded-2xl border border-sky-500/40 bg-gradient-to-b from-sky-500/10 via-[#111] to-[#0d0d0d] p-6 space-y-5">
            <div className="space-y-1">
              <Badge className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[10px]">
                INVESTOR PASS
              </Badge>
              <h3 className="text-xl font-bold text-white">Deal Flow Pass</h3>
              <p className="text-xs text-white/40">For angels, VCs, &amp; family offices sourcing proprietary deals.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">
                {billingCycle === "yearly" ? "₹3,499" : "₹4,299"}
              </span>
              <span className="text-xs text-white/40">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-white/70">
              {[
                "Advanced financial filters (ARR, Gross Margin, Burn)",
                "Export curated startup pipeline CSV lists",
                "Direct Pitch Deck downloads & Data Room access",
                "Priority warm intros to top 1% matched founders",
                "Verified Investor trust badge on messages",
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleSubscribe("Investor Pass")}
              disabled={loadingPlan === "Investor Pass"}
              className="w-full bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs h-10 rounded-xl transition-all"
            >
              {loadingPlan === "Investor Pass" ? "Processing..." : "Get Investor Pass"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
