import { apiClient } from "@/lib/api/client";

export type VerificationBadge =
  | "LinkedIn submitted"
  | "Website submitted"
  | "Company registration submitted";

export type ProfileVerification = {
  id: string;
  user_id: string;
  linkedin_url: string | null;
  website_url: string | null;
  company_registration: string | null;
  verification_badges: VerificationBadge[];
  created_at: string;
  updated_at: string;
};

export type ProfileVerificationPayload = {
  linkedin_url?: string;
  website_url?: string;
  company_registration?: string;
};

export async function getMyProfileVerification() {
  const response = await apiClient.get<ProfileVerification>("/profile-verification/me");
  return response.data;
}

export async function saveMyProfileVerification(payload: ProfileVerificationPayload) {
  const response = await apiClient.put<ProfileVerification>(
    "/profile-verification/me",
    payload
  );
  return response.data;
}
