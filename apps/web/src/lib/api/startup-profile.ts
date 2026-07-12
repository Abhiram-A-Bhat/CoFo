import { apiClient } from "@/lib/api/client";
import type { VerificationBadge } from "@/lib/api/profile-verification";

export type StartupProfile = {
  id: string;
  user_id: string;
  startup_name: string;
  industry: string;
  website_url: string | null;
  headquarters: string | null;
  founded_year: number | null;
  stage: string | null;
  business_model: string | null;
  target_market: string | null;
  description: string;
  funding_required: string;
  monthly_revenue: string | null;
  annual_recurring_revenue: string | null;
  gross_margin_percent: string | null;
  net_profit: string | null;
  burn_rate: string | null;
  runway_months: number | null;
  customer_count: number | null;
  valuation: string | null;
  revenue_projection_year1: string | null;
  revenue_projection_year2: string | null;
  revenue_projection_year3: string | null;
  profit_projection_year1: string | null;
  profit_projection_year2: string | null;
  profit_projection_year3: string | null;
  patents_filed: number | null;
  patents_granted: number | null;
  traction_summary: string | null;
  use_of_funds: string | null;
  pitch_video_url: string | null;
  logo_url: string | null;
  verification_badges: VerificationBadge[];
  created_at: string;
  updated_at: string;
};

export type StartupProfilePayload = {
  startup_name: string;
  industry: string;
  website_url?: string | null;
  headquarters?: string | null;
  founded_year?: number | null;
  stage?: string | null;
  business_model?: string | null;
  target_market?: string | null;
  description: string;
  funding_required: string;
  monthly_revenue?: string | null;
  annual_recurring_revenue?: string | null;
  gross_margin_percent?: string | null;
  net_profit?: string | null;
  burn_rate?: string | null;
  runway_months?: number | null;
  customer_count?: number | null;
  valuation?: string | null;
  revenue_projection_year1?: string | null;
  revenue_projection_year2?: string | null;
  revenue_projection_year3?: string | null;
  profit_projection_year1?: string | null;
  profit_projection_year2?: string | null;
  profit_projection_year3?: string | null;
  patents_filed?: number | null;
  patents_granted?: number | null;
  traction_summary?: string | null;
  use_of_funds?: string | null;
};

export async function getMyStartupProfile() {
  const response = await apiClient.get<StartupProfile>("/startup-profile/me");
  return response.data;
}

export async function saveMyStartupProfile(payload: StartupProfilePayload) {
  const response = await apiClient.put<StartupProfile>("/startup-profile/me", payload);
  return response.data;
}

export async function uploadMyStartupPitchVideo(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<StartupProfile>(
    "/startup-profile/me/pitch-video",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return response.data;
}

export async function uploadMyStartupLogo(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<StartupProfile>(
    "/startup-profile/me/logo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return response.data;
}
