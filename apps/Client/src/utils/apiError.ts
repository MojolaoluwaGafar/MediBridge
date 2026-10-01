import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../types/apiReqRes";

// The message to show for a failed request: the server's own message when it
// sent one, otherwise the fallback.
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.error ?? data?.message ?? fallback;
  }
  return fallback;
}
