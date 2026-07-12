import { apiClient } from "@/lib/api/client";
import type { VerificationBadge } from "@/lib/api/profile-verification";

export type InvestorMatch = {
  investor_id: string;
  name: string;
  organization: string;
  investment_thesis: string;
  ticket_size: string;
  verification_badges: VerificationBadge[];
  match_score: number;
  reasons: string[];
};

export type StartupMatch = {
  startup_id: string;
  startup_name: string;
  industry: string;
  description: string;
  funding_required: string;
  verification_badges: VerificationBadge[];
  match_score: number;
  reasons: string[];
};

export type InvestorMatchesResponse = {
  startup_id: string;
  startup_name: string;
  items: InvestorMatch[];
};

export type StartupMatchesResponse = {
  investor_id: string;
  investor_name: string;
  items: StartupMatch[];
};

export async function getInvestorMatches() {
  const response = await apiClient.get<InvestorMatchesResponse>("/matching/investors");
  return response.data;
}

export async function getStartupMatches() {
  const response = await apiClient.get<StartupMatchesResponse>("/matching/startups");
  return response.data;
}
