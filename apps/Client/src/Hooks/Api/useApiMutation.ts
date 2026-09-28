import { useState, useCallback, useRef, useEffect } from "react";
import { isAxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/apiReqRes";

type MutationFn<TReq, TRes> = (
  payload: TReq
) => Promise<TRes>;

export function useApiMutation<TReq, TRes>(
  mutation: MutationFn<TReq, TRes>,
  defaultErrorMessage = "Request failed"
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(
    async (payload: TReq): Promise<TRes> => {
      try {
        if (mountedRef.current) {
          setLoading(true);
          setError(null);
          setSuccess(false);
        }

        const data = await mutation(payload);

        if (mountedRef.current) {
          setSuccess(true);
        }

        return data;
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

        throw err;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [mutation, defaultErrorMessage]
  );

  return {
    mutate,
    loading,
    error,
    success,
  };
}