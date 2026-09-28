import api from "../index";

import type {
  ILoginRes,
  CodeReqResponse,
  IVerifyCodeRes,
  IVerifyUserRes,
  ISetPasswordRes,
} from "../../types/apiReqRes";

import type {
  LoginInput,
  VerifyUserInput,
  VerifyCodeInput,
  SetPasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../../Validation/ActivationSchema";

export const authService = {
  async login(payload: LoginInput): Promise<ILoginRes> {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },

  async verifyUser(
    payload: VerifyUserInput
  ): Promise<IVerifyUserRes> {
    const { data } = await api.post(
      "/api/auth/verifyUser",
      payload
    );

    return data;
  },

  async verifyCode(
    payload: VerifyCodeInput
  ): Promise<IVerifyCodeRes> {
    const { data } = await api.post(
      "/api/auth/verifyCode",
      payload
    );

    return data;
  },

  async verifyRecoveryCode(
    payload: VerifyCodeInput
  ): Promise<IVerifyCodeRes> {
    const { data } = await api.post(
      "/api/auth/verifyRecoveryCode",
      payload
    );

    return data;
  },

  async setPassword(
    payload: SetPasswordInput
  ): Promise<ISetPasswordRes> {
    const { data } = await api.post(
      "/api/auth/setPassword",
      payload
    );

    return data;
  },

  async resetPassword(
    payload: ResetPasswordInput
  ): Promise<ISetPasswordRes> {
    const { data } = await api.post(
      "/api/auth/resetPassword",
      payload
    );

    return data;
  },

  async codeReq(
    payload: ForgotPasswordInput
  ): Promise<CodeReqResponse> {
    const { data } = await api.post(
      "/api/auth/codeReq",
      payload
    );

    return data;
  },
};