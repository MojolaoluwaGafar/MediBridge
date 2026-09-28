import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { VerifyCodeInput } from "../../Validation/ActivationSchema";
import type { IVerifyCodeRes } from "../../types/apiReqRes";

export function useVerifyCode() {
  const { mutate, loading, error, success } =
    useApiMutation<VerifyCodeInput, IVerifyCodeRes>(
      authService.verifyCode,
      "Code verification failed"
    );

  return {
    verifyCode: mutate,
    loading,
    error,
    success,
  };
}