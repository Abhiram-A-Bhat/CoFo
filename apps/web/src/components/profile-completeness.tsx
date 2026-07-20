"use client";

import { CheckCircle, Circle } from "lucide-react";
import { useEffect, useState } from "react";

interface ProfileField {
  key: string;
  label: string;
  filled: boolean;
}

interface ProfileCompletenessProps {
  fields: ProfileField[];
  className?: string;
}

export function ProfileCompleteness({ fields, className = "" }: ProfileCompletenessProps) {
  const filled = fields.filter((f) => f.filled).length;
  const total = fields.length;
  const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
  const [animatedPercent, setAnimatedPercent] = useState(0);

  // Animated progress
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 900;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedPercent(Math.round(percent * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  // Color based on %
  function getColor() {
    if (animatedPercent >= 80) return { ring: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" };
    if (animatedPercent >= 60) return { ring: "#eab308", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/20" };
    if (animatedPercent >= 40) return { ring: "#f97316", bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" };
    return { ring: "#ef4444", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" };
  }

  const colors = getColor();
  const size = 72;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;

  const [showChecklist, setShowChecklist] = useState(false);
  const missingFields = fields.filter((f) => !f.filled);

  return (
    <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 ${className}`}>
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors.ring}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-base font-bold ${colors.text}`}>{animatedPercent}%</span>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white mb-1">Profile Completeness</h3>
          <p className="text-xs text-white/40 mb-2">
            {filled}/{total} fields completed
            {missingFields.length > 0 && (
              <>
                {" · "}
                <button
                  onClick={() => setShowChecklist(!showChecklist)}
                  className={`${colors.text} hover:underline font-medium`}
                >
                  {showChecklist ? "Hide" : "Show"} missing fields
                </button>
              </>
            )}
          </p>
          {/* Inline progress bar */}
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${animatedPercent}%`, backgroundColor: colors.ring }}
            />
          </div>
        </div>
      </div>

      {/* Missing fields checklist */}
      {showChecklist && missingFields.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <div className="grid grid-cols-2 gap-2">
            {fields.map((f) => (
              <div key={f.key} className="flex items-center gap-2 text-xs">
                {f.filled ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-white/20 shrink-0" />
                )}
                <span className={f.filled ? "text-white/50 line-through" : "text-white/70"}>
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── helper to compute fields for a startup profile ──── */
export function getStartupProfileFields(profile: Record<string, unknown> | null): ProfileField[] {
  if (!profile) return [];

  const fieldMap: [string, string][] = [
    ["startup_name", "Startup Name"],
    ["industry", "Industry"],
    ["description", "Description"],
    ["headquarters", "Headquarters"],
    ["website_url", "Website URL"],
    ["founded_year", "Founded Year"],
    ["stage", "Stage"],
    ["business_model", "Business Model"],
    ["target_market", "Target Market"],
    ["funding_required", "Funding Required"],
    ["monthly_revenue", "Monthly Revenue"],
    ["annual_recurring_revenue", "Annual Recurring Revenue"],
    ["gross_margin_percent", "Gross Margin %"],
    ["burn_rate", "Burn Rate"],
    ["runway_months", "Runway (Months)"],
    ["customer_count", "Customer Count"],
    ["valuation", "Valuation"],
    ["traction_summary", "Traction Summary"],
    ["use_of_funds", "Use of Funds"],
    ["pitch_video_url", "Pitch Video"],
  ];

  return fieldMap.map(([key, label]) => ({
    key,
    label,
    filled: profile[key] !== null && profile[key] !== undefined && profile[key] !== "" && profile[key] !== 0,
  }));
}

export function getInvestorProfileFields(profile: Record<string, unknown> | null): ProfileField[] {
  if (!profile) return [];

  const fieldMap: [string, string][] = [
    ["name", "Display Name"],
    ["organization", "Organization"],
    ["investment_thesis", "Investment Thesis"],
    ["ticket_size", "Ticket Size"],
  ];

  return fieldMap.map(([key, label]) => ({
    key,
    label,
    filled: profile[key] !== null && profile[key] !== undefined && profile[key] !== "" && profile[key] !== 0,
  }));
}
