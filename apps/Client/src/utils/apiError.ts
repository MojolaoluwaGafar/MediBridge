import { isAxiosError } from "axios";

interface ApiErrorBody {
  error?: string;
  message?: string;
  errors?: { field: string; message: string }[];
}

// The message to show for a failed request: the server's own message when it
// sent one (both { error } and { message } shapes are in use), else `fallback`.
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (isAxiosError(err)) {
    const body = err.response?.data as ApiErrorBody | undefined;
    return body?.message ?? body?.error ?? body?.errors?.[0]?.message ?? fallback;
  }
  return fallback;
}

// Field-level errors from the server, e.g. [{ field: "time", message: "..." }].
export function apiFieldErrors(err: unknown): { field: string; message: string }[] {
  if (!isAxiosError(err)) return [];
  return (err.response?.data as ApiErrorBody | undefined)?.errors ?? [];
}
