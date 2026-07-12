"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Home, Sparkles, MessageSquare, User, Compass, HelpCircle, X } from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const items = [
    { label: "Go to Home / Pitch Feed", href: "/pitch-feed", icon: Home, category: "Navigation" },
    { label: "Go to Explore Discoveries", href: "/startup-discovery", icon: Compass, category: "Navigation" },
    { label: "Go to Matches", href: "/matching", icon: Sparkles, category: "Navigation" },
    { label: "Go to Messages", href: "/messages", icon: MessageSquare, category: "Navigation" },
    { label: "Go to Profile Settings", href: "/startup-profile", icon: User, category: "Navigation" },
  ];

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette (Ctrl + K)
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Close Command Palette (Esc)
      if (e.key === "Escape") {
        setIsOpen(false);
      }

      // Quick Nav Shortcuts (N, M, S) when not in input fields
      const activeElement = document.activeElement?.tagName;
      if (activeElement !== "INPUT" && activeElement !== "TEXTAREA") {
        if (e.key.toLowerCase() === "m") {
          e.preventDefault();
          router.push("/messages");
        }
        if (e.key.toLowerCase() === "s") {
          e.preventDefault();
          router.push("/startup-discovery");
        }
        if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          router.push("/pitch-feed");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!isOpen) return null;

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3.5">
          <Search className="h-4.5 w-4.5 text-white/30" />
          <input
            className="flex-1 bg-transparent text-[14px] text-white placeholder:text-white/20 outline-none"
            placeholder="Type a command or search pages (Ctrl+K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] text-white/40">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1.5">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-[13px] text-white/70 hover:bg-white/[0.04] hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] text-white/20 font-medium uppercase tracking-wider">{item.category}</span>
                </button>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-white/30">
              No results found.
            </div>
          )}
        </div>

        {/* Keyboard hints footer */}
        <div className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.01] px-4 py-2 text-[10px] text-white/30">
          <div className="flex items-center gap-4">
            <span>Shortcuts: <kbd className="bg-white/5 border border-white/10 px-1 rounded">H</kbd> Home</span>
            <span><kbd className="bg-white/5 border border-white/10 px-1 rounded">S</kbd> Search</span>
            <span><kbd className="bg-white/5 border border-white/10 px-1 rounded">M</kbd> Messages</span>
          </div>
          <span>Ctrl + K to toggle</span>
        </div>
      </div>
    </div>
  );
}
