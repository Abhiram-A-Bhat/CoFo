import { apiClient } from "@/lib/api/client";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  role: "founder" | "investor" | "admin";
  investment_interests: string[];
  active_workspace: "founder" | "investor" | null;
  is_active: boolean;
  created_at: string;
};

export type AuthResponse = {
  user: AuthUser;
  token: {
    access_token: string;
    token_type: "bearer";
    expires_in: number;
  };
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = LoginPayload & {
  full_name?: string;
  role: "founder" | "investor";
  investment_interests?: string[];
};

export async function login(payload: LoginPayload) {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function signup(payload: SignupPayload) {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function logout() {
  const response = await apiClient.post<{ message: string }>("/auth/logout");
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<AuthUser>("/auth/me");
  return response.data;
}

export async function updateMyPreferences(payload: { active_workspace: "founder" | "investor" }) {
  const response = await apiClient.patch<AuthUser>("/auth/me/preferences", payload);
  return response.data;
}

export type UpdateProfilePayload = {
  full_name?: string;
  password?: string;
};

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await apiClient.patch<AuthUser>("/auth/me", payload);
  return response.data;
}

