import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { ForgotPasswordInput } from "../../Validation/ActivationSchema";
import type { CodeReqResponse } from "../../types/apiReqRes";

export function useCodeReq() {
  const { mutate, loading, error, success } =
    useApiMutation<ForgotPasswordInput, CodeReqResponse>(
      authService.codeReq,
      "Failed to send reset code"
    );

  return {
    codeReq: mutate,
    loading,
    error,
    success,
  };
}