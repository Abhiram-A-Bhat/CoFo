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

    const data = error.response?.data as ApiErrorBody | undefined;
    const detail = data?.detail;

    if (!detail) {
      return `${fallback} (Server returned ${error.response.status}: ${error.response.statusText || "No response detail"})`;
    }

    // Pydantic validation errors come back as an array of objects
    if (Array.isArray(detail)) {
      const messages = detail.map((e) => e.msg).filter(Boolean);
      return messages.length > 0 ? `${fallback} (${messages.join(". ")})` : fallback;
    }

    return `${fallback} (${detail})`;
  }

  if (error instanceof Error) {
    return `${fallback} (${error.message})`;
  }

  return fallback;
}
