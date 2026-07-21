"use client";

import { useEffect, useState } from "react";
import { 
  Building2, 
  Sparkles, 
  Trash2, 
  Loader2, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Briefcase,
  Search,
  ChevronRight,
  MoreVertical,
  Calendar,
  Layers,
  FileText,
  UserCheck
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
  { id: "matched", label: "Matched", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "intro_sent", label: "Intro Sent", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { id: "meeting_scheduled", label: "Meeting Scheduled", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { id: "due_diligence", label: "Due Diligence", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/30" },
  { id: "term_sheet", label: "Term Sheet", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { id: "closed", label: "Closed 🎉", color: "text-emerald-300", bg: "bg-emerald-400/20", border: "border-emerald-400/40" },
];

export default function PipelinePage() {
  const toast = useToast();
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleStageChange = async (itemId: string, newStage: PipelineItem["stage"]) => {
    setUpdatingId(itemId);
    try {
      const updated = await updatePipelineStage(itemId, newStage);
      setItems((prev) => prev.map((item) => (item.id === itemId ? updated : item)));
      const stageLabel = PIPELINE_STAGES.find((s) => s.id === newStage)?.label;
      toast.success(`Deal moved to ${stageLabel}`);
    } catch (_) {
      toast.error("Could not update pipeline stage.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deletePipelineItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.info("Deal removed from pipeline.");
    } catch (_) {
      toast.error("Failed to remove item.");
    }
  };

  // Metrics calculation
  const totalDeals = items.length;
  const activeMeetings = items.filter((i) => i.stage === "meeting_scheduled").length;
  const inDiligence = items.filter((i) => i.stage === "due_diligence").length;
  const closedDeals = items.filter((i) => i.stage === "closed").length;

  return (
    <main className="space-y-6 pb-12 w-full max-w-none">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Dealflow CRM
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">Deal Pipeline</h1>
          <p className="text-xs text-white/40 mt-1 max-w-xl">
            Manage your matches, active pitch meetings, due diligence requests, and closed deals in an interactive Kanban board.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-white/30" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter deals by name or domain..."
              className="pl-8 bg-white/[0.04] border-white/10 text-white text-xs h-9 focus-visible:ring-emerald-500/30"
            />
          </div>
          <Link href="/matching">
            <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs h-9 px-4">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Find Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-white/40 block">Total Pipeline Deals</span>
            <span className="text-xl font-extrabold text-white mt-0.5 block">{totalDeals}</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Briefcase className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-white/40 block">Meetings Scheduled</span>
            <span className="text-xl font-extrabold text-amber-400 mt-0.5 block">{activeMeetings}</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Calendar className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-white/40 block">Due Diligence</span>
            <span className="text-xl font-extrabold text-sky-400 mt-0.5 block">{inDiligence}</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-white/40 block">Closed Deals</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-0.5 block">{closedDeals}</span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Horizontal Kanban Board Container */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="min-w-[290px] w-[290px] shrink-0 rounded-2xl border border-white/[0.06] bg-[#0d0d0d] p-4 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-thin">
          {PIPELINE_STAGES.map((col) => {
            const colItems = items.filter(
              (item) =>
                item.stage === col.id &&
                (searchQuery === "" ||
                  item.target_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (item.target_subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()))
            );

            return (
              <div
                key={col.id}
                className="flex flex-col min-w-[300px] w-[300px] shrink-0 rounded-2xl border border-white/[0.08] bg-[#0d0d0d] p-3.5 space-y-3"
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${col.border} ${col.bg}`}>
                  <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  <Badge variant="outline" className="border-white/10 text-white/70 text-[10px] font-bold">
                    {colItems.length}
                  </Badge>
                </div>

                {/* Cards Column */}
                <div className="flex-1 space-y-3 min-h-[460px]">
                  {colItems.length > 0 ? (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative rounded-2xl border border-white/10 bg-white/[0.03] hover:border-emerald-500/40 p-4 space-y-3 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase">
                              {item.target_name.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-xs truncate">
                                {item.target_subtitle || item.target_name}
                              </h4>
                              <p className="text-[10px] text-white/40 truncate capitalize">
                                {item.target_name} · {item.target_role}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-white/20 hover:text-red-400 p-1 transition-colors rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100"
                            title="Remove deal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Optional Notes */}
                        {item.notes && (
                          <p className="text-[11px] text-white/60 bg-white/[0.02] p-2.5 rounded-xl border border-white/[0.04] leading-relaxed">
                            {item.notes}
                          </p>
                        )}

                        {/* Stage Selector Dropdown */}
                        <div className="space-y-1 pt-1">
                          <label className="text-[9px] font-bold uppercase tracking-wider text-white/30 block">
                            Stage Status
                          </label>
                          <select
                            disabled={updatingId === item.id}
                            value={item.stage}
                            onChange={(e) => handleStageChange(item.id, e.target.value as PipelineItem["stage"])}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500/40"
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id} className="bg-[#0d0d0d] text-white">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2.5">
                          <span className="text-[10px] text-white/30">
                            {new Date(item.updated_at).toLocaleDateString()}
                          </span>
                          <Link href="/messages">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2.5 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-medium rounded-lg"
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] text-[11px] text-white/20 text-center px-4 space-y-1">
                      <Layers className="h-5 w-5 text-white/10" />
                      <span>No deals in this stage</span>
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
