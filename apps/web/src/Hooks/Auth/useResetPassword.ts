import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { ResetPasswordInput } from "../../Validation/ActivationSchema";
import type { ISetPasswordRes } from "../../types/apiReqRes";

export function useResetPassword() {
  const { mutate, loading, error, success } =
    useApiMutation<ResetPasswordInput, ISetPasswordRes>(
      authService.resetPassword,
      "Password reset failed"
    );

  return {
    resetPassword: mutate,
    loading,
    error,
    success,
  };
}