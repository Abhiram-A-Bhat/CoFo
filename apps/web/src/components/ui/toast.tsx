"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useToast } from "@/lib/toast-context";
import type { ToastItem, ToastVariant } from "@/lib/toast-context";

/* ── variant config ─────────────────────────────────────── */
const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle; bg: string; border: string; glow: string; progress: string }
> = {
  success: {
    icon: CheckCircle,
    bg: "bg-emerald-950/80",
    border: "border-emerald-500/25",
    glow: "shadow-[0_0_24px_-4px_rgba(16,185,129,0.25)]",
    progress: "bg-emerald-400",
  },
  error: {
    icon: XCircle,
    bg: "bg-red-950/80",
    border: "border-red-500/25",
    glow: "shadow-[0_0_24px_-4px_rgba(239,68,68,0.25)]",
    progress: "bg-red-400",
  },
  info: {
    icon: Info,
    bg: "bg-sky-950/80",
    border: "border-sky-500/25",
    glow: "shadow-[0_0_24px_-4px_rgba(56,189,248,0.25)]",
    progress: "bg-sky-400",
  },
};

/* ── single toast ───────────────────────────────────────── */
function SingleToast({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cfg = variantConfig[toast.variant];
  const Icon = cfg.icon;

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = requestAnimationFrame(() => setVisible(true));

    // Start exit animation before auto-dismiss
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration - 300);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast, onDismiss]);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border backdrop-blur-xl
        ${cfg.bg} ${cfg.border} ${cfg.glow}
        px-4 py-3.5 min-w-[320px] max-w-[420px]
        flex items-start gap-3
        transition-all duration-300 ease-out
        ${visible && !exiting ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}
      `}
      role="alert"
    >
      <Icon className="h-5 w-5 mt-0.5 shrink-0 text-white/80" />
      <p className="flex-1 text-[13px] leading-relaxed text-white/90 font-medium">
        {toast.message}
      </p>
      <button
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1 text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/[0.06]">
        <div
          className={`h-full ${cfg.progress} opacity-60`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}

/* ── toast container ────────────────────────────────────── */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <>
      {/* CSS animation for progress bar */}
      <style jsx global>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2.5 max-md:left-4 max-md:right-4 max-md:bottom-24 max-md:items-center">
        {toasts.map((toast) => (
          <SingleToast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </>
  );
}
