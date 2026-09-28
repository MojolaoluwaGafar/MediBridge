import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { VerifyCodeInput } from "../../Validation/ActivationSchema";
import type { IVerifyCodeRes } from "../../types/apiReqRes";

export function useVerifyOTP() {
  const { mutate, loading, error, success } =
    useApiMutation<VerifyCodeInput, IVerifyCodeRes>(
      authService.verifyRecoveryCode,
      "OTP verification failed"
    );

  return {
    verifyOTP: mutate,
    loading,
    error,
    success,
  };
}