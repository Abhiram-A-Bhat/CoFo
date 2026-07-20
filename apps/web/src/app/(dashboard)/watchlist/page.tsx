"use client";

import { useEffect, useState } from "react";
import { Bookmark, Sparkles, Trash2, ArrowRight, Building2, UserCheck } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/toast-context";
import { getWatchlist, toggleWatchlist, type WatchlistItem } from "@/lib/api/retention";

export default function WatchlistPage() {
  const toast = useToast();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getWatchlist();
      setItems(res.items);
    } catch (_) {
      toast.error("Failed to load watchlist.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRemove = async (item: WatchlistItem) => {
    try {
      await toggleWatchlist(item.target_type, item.target_id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.info(`Removed ${item.title} from Watchlist`);
    } catch (_) {
      toast.error("Could not remove item");
    }
  };

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const headers = ["Title", "Type", "Subtitle", "Saved Date"];
    const rows = items.map((i) => [
      `"${i.title.replace(/"/g, '""')}"`,
      i.target_type,
      `"${(i.subtitle || "").replace(/"/g, '""')}"`,
      new Date(i.created_at).toLocaleDateString(),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BridgeCapita_Watchlist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Watchlist exported to CSV!");
  };

  return (
    <main className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Saved Items
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Watchlist</h1>
          <p className="text-xs text-white/40 mt-1 max-w-xl">
            Keep track of bookmarked founders, startups, and investors to monitor their updates over time.
          </p>
        </div>
        {items.length > 0 && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 text-xs font-semibold h-9"
          >
            Export Deal List CSV
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="border-white/10 bg-[#0d0d0d] hover:border-emerald-500/30 transition-all">
              <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] capitalize">
                      {item.target_type}
                    </Badge>
                    <span className="text-[10px] text-white/30">
                      Saved {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base text-white truncate">{item.title}</CardTitle>
                  {item.subtitle && <CardDescription className="text-white/40 truncate text-xs">{item.subtitle}</CardDescription>}
                </div>
                <button
                  onClick={() => handleRemove(item)}
                  className="text-white/20 hover:text-red-400 p-1 transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="mt-3 flex gap-2">
                  <Link href="/messages" className="flex-1">
                    <Button variant="outline" className="w-full border-white/10 text-white/80 hover:text-white text-xs h-8">
                      Contact
                    </Button>
                  </Link>
                  <Link href="/pitch-feed" className="flex-1">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-8">
                      View Pitch
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-white/10 bg-[#0d0d0d]">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
            <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-400 border border-emerald-500/20">
              <Bookmark className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-white">Your Watchlist is empty</h3>
              <p className="text-xs text-white/40 max-w-sm">
                Click the bookmark icon on any pitch card or discovery profile to save startups and investors for quick access.
              </p>
            </div>
            <Link href="/pitch-feed">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-6 h-9">
                Browse Pitch Feed
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
