import { apiClient } from "@/lib/api/client";
import type { VerificationBadge } from "@/lib/api/profile-verification";

export type StartupDiscoveryItem = {
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
  verification_badges: VerificationBadge[];
};

export type StartupDiscoveryResponse = {
  items: StartupDiscoveryItem[];
  total: number;
  limit: number;
  offset: number;
};

export type StartupDiscoveryParams = {
  query?: string;
  industry?: string;
  funding_min?: string;
  funding_max?: string;
  limit?: number;
  offset?: number;
};

export async function discoverStartups(params: StartupDiscoveryParams) {
  const response = await apiClient.get<StartupDiscoveryResponse>("/startup-discovery", {
    params
  });

  return response.data;
}
