import { useApiMutation } from "../Api/useApiMutation";
import { authService } from "../../API/services/authService";

import type { VerifyUserInput } from "../../Validation/ActivationSchema";
import type { IVerifyUserRes } from "../../types/apiReqRes";

export function useVerifyUser() {
  const { mutate, loading, error, success } =
    useApiMutation<VerifyUserInput, IVerifyUserRes>(
      authService.verifyUser,
      "ID verification failed"
    );

  return {
    verifyUser: mutate,
    loading,
    error,
    success,
  };
}