import { apiClient } from "@/lib/api/client";
import type { VerificationBadge } from "@/lib/api/profile-verification";

export type InvestorDiscoveryItem = {
  id: string;
  user_id: string;
  name: string;
  organization: string;
  investment_thesis: string;
  ticket_size: string;
  verification_badges: VerificationBadge[];
};

export type InvestorDiscoveryResponse = {
  items: InvestorDiscoveryItem[];
  total: number;
  limit: number;
  offset: number;
};

export type InvestorDiscoveryParams = {
  query?: string;
  organization?: string;
  ticket_min?: string;
  ticket_max?: string;
  limit?: number;
  offset?: number;
};

export async function discoverInvestors(params: InvestorDiscoveryParams) {
  const response = await apiClient.get<InvestorDiscoveryResponse>("/investor-discovery", {
    params
  });

  return response.data;
}
