"use client";

import { useState, useEffect } from "react";
import { Keyboard, X } from "lucide-react";

export function KeyboardShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const shortcuts = [
    { key: "Ctrl + K", desc: "Open Command Palette & Global Search" },
    { key: "H", desc: "Go to Home / Pitch Feed Reels" },
    { key: "S", desc: "Explore Counterparts & Discovery" },
    { key: "M", desc: "Open Direct Messages & Inbox" },
    { key: "?", desc: "Toggle Keyboard Shortcuts Dialog" },
    { key: "ESC", desc: "Close Modals or Search Windows" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setIsOpen(false)} />

      <div className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0d0d0d] p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Keyboard Shortcuts</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-white/40 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div key={s.key} className="flex items-center justify-between p-2.5 rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <span className="text-xs text-white/70">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-mono font-bold text-emerald-400">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
