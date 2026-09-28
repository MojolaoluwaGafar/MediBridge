import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { SetPasswordInput } from "../../Validation/ActivationSchema";
import type { ISetPasswordRes } from "../../types/apiReqRes";

export function useSetPassword() {
  const { mutate, loading, error, success } =
    useApiMutation<SetPasswordInput, ISetPasswordRes>(
      authService.setPassword,
      "Failed to set password"
    );

  return {
    setPassword: mutate,
    loading,
    error,
    success,
  };
}