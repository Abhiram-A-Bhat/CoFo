import { apiClient } from "@/lib/api/client";
import type { VerificationBadge } from "@/lib/api/profile-verification";

export type InvestorProfile = {
  id: string;
  user_id: string;
  name: string;
  organization: string;
  investment_thesis: string;
  ticket_size: string;
  avatar_url: string | null;
  verification_badges: VerificationBadge[];
  created_at: string;
  updated_at: string;
};

export type InvestorProfilePayload = {
  name: string;
  organization: string;
  investment_thesis: string;
  ticket_size: string;
};

export async function getMyInvestorProfile() {
  const response = await apiClient.get<InvestorProfile>("/investor-profile/me");
  return response.data;
}

export async function saveMyInvestorProfile(payload: InvestorProfilePayload) {
  const response = await apiClient.put<InvestorProfile>("/investor-profile/me", payload);
  return response.data;
}

export async function uploadMyInvestorAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post<InvestorProfile>(
    "/investor-profile/me/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return response.data;
}
