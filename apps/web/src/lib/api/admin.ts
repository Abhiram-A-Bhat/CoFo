import { apiClient } from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/auth";

export type AdminUserListResponse = {
  items: AuthUser[];
};

export type AdminUserUpdatePayload = {
  role: string;
  is_active: boolean;
};

export type AdminAnnouncement = {
  id: string;
  content: string;
  created_at: string;
  is_active: boolean;
};

export type AdminMatchSettings = {
  industry_weight: number;
  ticket_weight: number;
  model_weight: number;
};

export type AdminVerificationRequest = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  linkedin_url: string | null;
  website_url: string | null;
  company_registration: string | null;
  verification_badges: string[];
  created_at: string;
};

export async function listAdminUsers() {
  const response = await apiClient.get<AdminUserListResponse>("/admin/users");
  return response.data;
}

export async function updateAdminUser(userId: string, payload: AdminUserUpdatePayload) {
  const response = await apiClient.put<AuthUser>(`/admin/users/${userId}`, payload);
  return response.data;
}

export async function listAdminVerifications() {
  const response = await apiClient.get<AdminVerificationRequest[]>("/admin/verifications");
  return response.data;
}

export async function approveAdminVerification(verificationId: string) {
  const response = await apiClient.post(`/admin/verifications/${verificationId}/approve`);
  return response.data;
}

export async function rejectAdminVerification(verificationId: string, reason?: string) {
  const response = await apiClient.post(`/admin/verifications/${verificationId}/reject`, null, {
    params: { reason }
  });
  return response.data;
}

export async function listAdminAnnouncements() {
  const response = await apiClient.get<AdminAnnouncement[]>("/admin/announcements");
  return response.data;
}

export async function createAdminAnnouncement(content: string) {
  const response = await apiClient.post<AdminAnnouncement>("/admin/announcements", { content });
  return response.data;
}

export async function deleteAdminAnnouncement(announcementId: string) {
  const response = await apiClient.delete(`/admin/announcements/${announcementId}`);
  return response.data;
}

export async function getAdminSettings() {
  const response = await apiClient.get<AdminMatchSettings>("/admin/settings");
  return response.data;
}

export async function updateAdminSettings(payload: AdminMatchSettings) {
  const response = await apiClient.put<AdminMatchSettings>("/admin/settings", payload);
  return response.data;
}
