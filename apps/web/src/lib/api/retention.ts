import { apiClient } from "@/lib/api/client";

export interface PitchComment {
  id: string;
  startup_profile_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  parent_id: string | null;
  content: string;
  created_at: string;
}

export interface PipelineItem {
  id: string;
  user_id: string;
  target_user_id: string;
  target_name: string;
  target_email: string;
  target_role: string;
  target_subtitle?: string | null;
  stage: "matched" | "intro_sent" | "meeting_scheduled" | "due_diligence" | "term_sheet" | "closed" | "passed";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvestorUpdate {
  id: string;
  startup_profile_id: string;
  startup_name: string;
  title: string;
  month_year: string;
  mrr?: number | null;
  runway_months?: number | null;
  highlights: string;
  lowlights?: string | null;
  asks?: string | null;
  is_public: boolean;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  target_type: "startup" | "investor";
  target_id: string;
  title: string;
  subtitle?: string | null;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link_url?: string | null;
  is_read: boolean;
  created_at: string;
}

export interface EcosystemInsights {
  total_startups: number;
  total_investors: number;
  avg_valuation_inr: number;
  avg_funding_required_inr: number;
  top_industries: { industry: string; count: number }[];
  active_matches_count: number;
}

// ── Comments API ─────────────────────────────────────────────────────
export async function getPitchComments(startupProfileId: string) {
  const res = await apiClient.get<{ items: PitchComment[]; total: number }>(
    `/pitches/${startupProfileId}/comments`
  );
  return res.data;
}

export async function addPitchComment(startupProfileId: string, content: string, parentId?: string) {
  const res = await apiClient.post<PitchComment>(
    `/pitches/${startupProfileId}/comments`,
    { content, parent_id: parentId }
  );
  return res.data;
}

// ── Pipeline API ─────────────────────────────────────────────────────
export async function getPipeline() {
  const res = await apiClient.get<{ items: PipelineItem[] }>("/pipeline");
  return res.data;
}

export async function addPipelineItem(targetUserId: string, stage = "matched", notes?: string) {
  const res = await apiClient.post<PipelineItem>("/pipeline", {
    target_user_id: targetUserId,
    stage,
    notes,
  });
  return res.data;
}

export async function updatePipelineStage(itemId: string, stage: string, notes?: string) {
  const res = await apiClient.patch<PipelineItem>(`/pipeline/${itemId}`, {
    stage,
    notes,
  });
  return res.data;
}

export async function deletePipelineItem(itemId: string) {
  await apiClient.delete(`/pipeline/${itemId}`);
}

// ── Investor Updates API ─────────────────────────────────────────────
export async function getInvestorUpdates(startupProfileId: string) {
  const res = await apiClient.get<{ items: InvestorUpdate[] }>(
    `/startup-profile/${startupProfileId}/updates`
  );
  return res.data;
}

export async function createInvestorUpdate(payload: {
  title: string;
  month_year: string;
  mrr?: number;
  runway_months?: number;
  highlights: string;
  lowlights?: string;
  asks?: string;
}) {
  const res = await apiClient.post<InvestorUpdate>("/startup-profile/me/updates", payload);
  return res.data;
}

// ── Watchlist API ────────────────────────────────────────────────────
export async function getWatchlist() {
  const res = await apiClient.get<{ items: WatchlistItem[] }>("/watchlist");
  return res.data;
}

export async function toggleWatchlist(targetType: "startup" | "investor", targetId: string) {
  const res = await apiClient.post<{ saved: boolean; message: string }>("/watchlist/toggle", {
    target_type: targetType,
    target_id: targetId,
  });
  return res.data;
}

// ── Notifications API ────────────────────────────────────────────────
export async function getNotifications() {
  const res = await apiClient.get<{ items: NotificationItem[]; unread_count: number }>(
    "/notifications"
  );
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await apiClient.post<{ message: string }>("/notifications/read-all");
  return res.data;
}

// ── Ecosystem Insights API ───────────────────────────────────────────
export async function getEcosystemInsights() {
  const res = await apiClient.get<EcosystemInsights>("/insights");
  return res.data;
}
