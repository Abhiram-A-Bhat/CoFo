import { AxiosError } from "axios";

type PydanticValidationError = {
  type: string;
  loc: (string | number)[];
  msg: string;
  input: unknown;
  ctx?: Record<string, unknown>;
};

type ApiErrorBody = {
  detail?: string | PydanticValidationError[];
};

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    if (!error.response) {
      // Network error, server down, or CORS preflight block
      return `${fallback} (Network Error: Connection refused or CORS preflight block. Ensure backend is running and CORS_ORIGINS environment variable is set correctly.)`;
    }

    const data = error.response?.data;

    // 1. Handle plain string responses (e.g. "Unauthorized", "Forbidden")
    if (typeof data === "string" && data.trim()) {
      return `${fallback} (${data.trim()})`;
    }

    // 2. Handle structured JSON error objects
    if (data && typeof data === "object") {
      const detail = (data as ApiErrorBody).detail;
      const message = (data as any).message || (data as any).error;

      if (detail) {
        // Pydantic validation errors come back as an array of objects
        if (Array.isArray(detail)) {
          const messages = detail.map((e) => e.msg || JSON.stringify(e)).filter(Boolean);
          return messages.length > 0 ? `${fallback} (${messages.join(". ")})` : fallback;
        }
        if (typeof detail === "string") {
          return `${fallback} (${detail})`;
        }
        return `${fallback} (${JSON.stringify(detail)})`;
      }

      if (message && typeof message === "string") {
        return `${fallback} (${message})`;
      }
    }

    // 3. Fallback to status text
    const statusText = error.response.statusText || "No response detail";
    return `${fallback} (Server returned ${error.response.status}: ${statusText})`;
  }

  if (error instanceof Error) {
    return `${fallback} (${error.message})`;
  }

  return fallback;
}
