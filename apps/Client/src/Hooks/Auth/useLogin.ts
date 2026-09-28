import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { LoginInput } from "../../Validation/ActivationSchema";
import type { ILoginRes } from "../../types/apiReqRes";

export function useLogin() {
  const {
    mutate,
    loading,
    error,
    success,
  } = useApiMutation<LoginInput, ILoginRes>(
    authService.login,
    "Failed to login"
  );

  return {
    login: mutate,
    loading,
    error,
    success,
  };
}