import axios from "axios";

import { env } from "@/lib/config/env";

export const apiClient = axios.create({
  baseURL: `${env.apiUrl}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});
