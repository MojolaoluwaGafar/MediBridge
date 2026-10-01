import { useCallback, useState } from "react";
import { useApiQuery } from "../Api/useApiQuery";
import { accountService } from "../../API/services/accountService";
import { useAuth } from "../Auth/useAuth";
import type { IAccountProfile, IChangePasswordPayload } from "../../types/account";

type Action = "phone" | "password" | "photo";

// The signed-in user's account. Every change that the header shows (the photo)
// is copied into the auth context so the whole portal updates at once.
// Each action throws on failure so the form that called it can show the error.
export function useAccount() {
  const { updateUser } = useAuth();
  const { data, loading, error, setData } = useApiQuery(
    accountService.getAccount,
    "Couldn't load your account."
  );
  const [pending, setPending] = useState<Action | null>(null);

  const applyProfile = useCallback(
    (profile: IAccountProfile) => {
      setData((current) => (current ? { ...current, profile } : current));
      updateUser({ img: profile.img ?? undefined });
    },
    [setData, updateUser]
  );

  const run = useCallback(async <T,>(action: Action, task: () => Promise<T>) => {
    setPending(action);
    try {
      return await task();
    } finally {
      setPending(null);
    }
  }, []);

  const updatePhone = (phone: string) =>
    run("phone", async () => {
      const res = await accountService.updatePhone(phone);
      applyProfile(res.profile);
      return res;
    });

  const uploadPhoto = (file: File) =>
    run("photo", async () => {
      const res = await accountService.uploadPhoto(file);
      applyProfile(res.profile);
      return res;
    });

  const removePhoto = () =>
    run("photo", async () => {
      const res = await accountService.removePhoto();
      applyProfile(res.profile);
      return res;
    });

  const changePassword = (payload: IChangePasswordPayload) =>
    run("password", () => accountService.changePassword(payload));

  return {
    profile: data?.profile ?? null,
    loading,
    error,
    pending,
    updatePhone,
    uploadPhoto,
    removePhoto,
    changePassword,
  };
}
