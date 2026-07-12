import { apiClient } from "@/lib/api/client";
import type {
  StartupDiscoveryItem,
  StartupDiscoveryParams
} from "@/lib/api/startup-discovery";

export type PitchFeedResponse = {
  items: StartupDiscoveryItem[];
  total: number;
  limit: number;
  offset: number;
};

export type PitchFeedParams = StartupDiscoveryParams;

export async function getPitchFeed(params: PitchFeedParams) {
  const response = await apiClient.get<PitchFeedResponse>("/pitch-feed", {
    params
  });
  return response.data;
}
