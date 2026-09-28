import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/apiReqRes";

type RequestFn<TRes, TArgs extends unknown[] = []> = (
  ...args: TArgs
) => Promise<TRes>;

interface UseApiQueryOptions<TRes> {
  enabled?: boolean;
  initialData?: TRes;
  onSuccess?: (data: TRes) => void;
  onError?: (error: string) => void;
}

export function useApiQuery<
  TRes,
  TArgs extends unknown[] = []
>(
  request: RequestFn<TRes, TArgs>,
  defaultErrorMessage = "Request failed",
  options?: UseApiQueryOptions<TRes>
) {
  const {
    enabled = true,
    initialData,
    onSuccess,
    onError,
  } = options ?? {};

  const hasInitialData = initialData !== undefined;

  const [data, setData] = useState<TRes | null>(
    initialData ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(hasInitialData);
  const [isFetched, setIsFetched] = useState(hasInitialData);

  const mountedRef = useRef(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (...args: TArgs): Promise<TRes> => {
      if (fetchingRef.current) {
        return Promise.reject(
          new Error("Request already in progress")
        );
      }

      fetchingRef.current = true;

      try {
        if (mountedRef.current) {
          setLoading(true);
          setError(null);
          setSuccess(false);
        }

        const result = await request(...args);

        if (mountedRef.current) {
          setData(result);
          setSuccess(true);
          setIsFetched(true);
        }

        onSuccess?.(result);

        return result;
      } catch (err) {
        let message = defaultErrorMessage;

        if (isAxiosError(err)) {
          const data = err.response?.data as ApiErrorResponse;

          message =
            data?.error ??
            data?.message ??
            err.message ??
            defaultErrorMessage;
        } else if (err instanceof Error) {
          message = err.message;
        }

        if (mountedRef.current) {
          setError(message);
          setSuccess(false);
        }

        onError?.(message);

        throw err;
      } finally {
        fetchingRef.current = false;

        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      request,
      defaultErrorMessage,
      onSuccess,
      onError,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    void fetchData(...([] as unknown as TArgs));
  }, [enabled, fetchData]);

  const reset = useCallback(() => {
    setData(initialData ?? null);
    setLoading(false);
    setError(null);
    setSuccess(hasInitialData);
    setIsFetched(hasInitialData);
  }, [initialData, hasInitialData]);

  return useMemo(
    () => ({
      data,
      loading,
      error,
      success,
      isFetched,
      refetch: fetchData,
      setData,
      reset,
    }),
    [
      data,
      loading,
      error,
      success,
      isFetched,
      fetchData,
      reset,
    ]
  );
}