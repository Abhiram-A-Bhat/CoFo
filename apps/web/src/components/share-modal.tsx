"use client";

import { useState } from "react";
import { Copy, Check, Share2, X, MessageCircle, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/lib/toast-context";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export function ShareModal({ isOpen, onClose, title, url }: ShareModalProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://bridgecapita.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`Check out ${title} on BridgeCapita — the fundraising platform:`);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0d0d0d] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Share Pitch</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-white/60">Share <span className="font-semibold text-white">{title}</span> with investors and advisors:</p>

        {/* Copy Link Input */}
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="bg-white/[0.04] border-white/10 text-white text-xs h-10 select-all"
          />
          <Button
            onClick={handleCopy}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs h-10 px-4 shrink-0"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <a
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs font-semibold transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            <span>WhatsApp</span>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 hover:bg-sky-500/10 text-sky-400 text-xs font-semibold transition-all"
          >
            <Linkedin className="h-5 w-5" />
            <span>LinkedIn</span>
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-xs font-semibold transition-all"
          >
            <Twitter className="h-5 w-5" />
            <span>X / Twitter</span>
          </a>
        </div>
      </div>
    </div>
  );
}
