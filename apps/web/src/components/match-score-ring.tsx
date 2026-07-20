"use client";

import { useEffect, useState } from "react";

interface MatchScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

function getScoreColor(score: number): { stroke: string; text: string; glow: string } {
  if (score >= 80) return { stroke: "#10b981", text: "text-emerald-400", glow: "drop-shadow(0 0 6px rgba(16,185,129,0.4))" };
  if (score >= 60) return { stroke: "#eab308", text: "text-yellow-400", glow: "drop-shadow(0 0 6px rgba(234,179,8,0.3))" };
  if (score >= 40) return { stroke: "#f97316", text: "text-orange-400", glow: "drop-shadow(0 0 6px rgba(249,115,22,0.3))" };
  return { stroke: "#ef4444", text: "text-red-400", glow: "drop-shadow(0 0 6px rgba(239,68,68,0.3))" };
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Low";
}

export function MatchScoreRing({
  score,
  size = 56,
  strokeWidth = 4,
  showLabel = false,
  className = "",
}: MatchScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;
  const colors = getScoreColor(score);

  useEffect(() => {
    // Animate from 0 to score
    let frame: number;
    const start = performance.now();
    const duration = 800;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className="relative" style={{ width: size, height: size, filter: colors.glow }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${colors.text}`}>
            {animatedScore}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${colors.text}`}>
          {getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
