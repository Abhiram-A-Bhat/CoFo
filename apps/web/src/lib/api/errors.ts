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
    const data = error.response?.data as ApiErrorBody | undefined;
    const detail = data?.detail;

    if (!detail) return fallback;

    // Pydantic validation errors come back as an array of objects
    if (Array.isArray(detail)) {
      const messages = detail.map((e) => e.msg).filter(Boolean);
      return messages.length > 0 ? messages.join(". ") : fallback;
    }

    return detail;
  }

  return fallback;
}
