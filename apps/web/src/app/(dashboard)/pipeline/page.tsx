"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Sparkles, 
  Plus, 
  Trash2, 
  Loader2, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Search
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/toast-context";
import { getPipeline, updatePipelineStage, deletePipelineItem, type PipelineItem } from "@/lib/api/retention";

const PIPELINE_STAGES: { id: PipelineItem["stage"]; label: string; color: string; bg: string; border: string }[] = [
  { id: "matched", label: "Matched", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "intro_sent", label: "Intro Sent", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: "meeting_scheduled", label: "Meeting Scheduled", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "due_diligence", label: "Due Diligence", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { id: "term_sheet", label: "Term Sheet", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "closed", label: "Closed 🎉", color: "text-emerald-300", bg: "bg-emerald-400/15", border: "border-emerald-400/30" },
];

export default function PipelinePage() {
  const toast = useToast();
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);

  async function loadData() {
    setIsLoading(true);
    try {
      const res = await getPipeline();
      setItems(res.items);
    } catch (_) {
      toast.error("Failed to load deal pipeline.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleStageMove = async (itemId: string, currentStage: PipelineItem["stage"], direction: "next" | "prev") => {
    const stageIds = PIPELINE_STAGES.map((s) => s.id);
    const currentIndex = stageIds.indexOf(currentStage);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (nextIndex < 0 || nextIndex >= stageIds.length) return;

    const nextStage = stageIds[nextIndex];
    setMovingId(itemId);

    try {
      const updated = await updatePipelineStage(itemId, nextStage);
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      toast.success(`Moved deal to ${PIPELINE_STAGES.find((s) => s.id === nextStage)?.label}`);
    } catch (_) {
      toast.error("Could not update stage.");
    } finally {
      setMovingId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deletePipelineItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.info("Item removed from pipeline");
    } catch (_) {
      toast.error("Failed to remove item");
    }
  };

  return (
    <main className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Fundraising Operations
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Deal Pipeline Board</h1>
          <p className="text-xs text-white/40 mt-1 max-w-xl">
            Track your matches, active pitch meetings, due diligence, and closed deals in one real-time workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..."
              className="pl-8 bg-white/[0.04] border-white/10 text-white text-xs h-9"
            />
          </div>
          <Link href="/matching">
            <Button variant="outline" className="border-white/10 text-white/80 hover:text-white text-xs h-9">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
              Find New Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* Kanban Columns */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {PIPELINE_STAGES.map((s) => (
            <div key={s.id} className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((col) => {
            const colItems = items.filter(
              (item) =>
                item.stage === col.id &&
                (searchQuery === "" ||
                  item.target_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (item.target_subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()))
            );
            return (
              <div key={col.id} className="flex flex-col min-w-[200px] rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-2 mb-2 border-b border-white/[0.06]">
                  <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  <Badge variant="outline" className="border-white/10 text-[10px] text-white/40">
                    {colItems.length}
                  </Badge>
                </div>

                {/* Cards Container */}
                <div className="flex-1 space-y-3 min-h-[400px]">
                  {colItems.length > 0 ? (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/30 p-3 text-xs space-y-2 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-white truncate max-w-[130px]">
                              {item.target_subtitle || item.target_name}
                            </p>
                            <p className="text-[10px] text-white/40 capitalize">{item.target_role}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-white/20 hover:text-red-400 p-1 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] text-white/60 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04]">
                            {item.notes}
                          </p>
                        )}

                        {/* Stage Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={col.id === "matched" || movingId === item.id}
                            onClick={() => handleStageMove(item.id, item.stage, "prev")}
                            className="h-6 px-1.5 text-[10px] text-white/40 hover:text-white"
                          >
                            ← Back
                          </Button>
                          <Link href="/messages">
                            <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] text-emerald-400 hover:text-emerald-300">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={col.id === "closed" || movingId === item.id}
                            onClick={() => handleStageMove(item.id, item.stage, "next")}
                            className="h-6 px-1.5 text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                          >
                            Next →
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/[0.06] text-[11px] text-white/20 text-center px-2">
                      Drop deals here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
