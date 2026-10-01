import { useCallback } from "react";
import { useApiQuery } from "../Api/useApiQuery";
import { useApiMutation } from "../Api/useApiMutation";
import { useAuth } from "../Auth/useAuth";
import { accountService } from "../../API/services/accountService";
import type { IAccountRes } from "../../types/account";

export function useAccount() {
  const { updateUser } = useAuth();
  const { data, loading, error, isFetched, setData } = useApiQuery(
    accountService.getAccount,
    "Failed to load your account"
  );

  // After a photo change, update this page and the header's avatar together.
  const applyProfile = useCallback(
    (res: IAccountRes) => {
      setData(res);
      updateUser({ img: res.profile.img ?? undefined });
    },
    [setData, updateUser]
  );

  const { mutate: upload, loading: uploading, error: uploadError } = useApiMutation(
    accountService.uploadPhoto,
    "Couldn't upload your photo"
  );
  const { mutate: remove, loading: removing, error: removeError } = useApiMutation(
    accountService.removePhoto,
    "Couldn't remove your photo"
  );

  const uploadPhoto = useCallback(
    async (file: File) => applyProfile(await upload(file)),
    [upload, applyProfile]
  );
  const removePhoto = useCallback(
    async () => applyProfile(await remove(undefined)),
    [remove, applyProfile]
  );

  return {
    profile: data?.profile ?? null,
    loading: loading || (!isFetched && !error),
    error,
    uploadPhoto,
    removePhoto,
    photoBusy: uploading || removing,
    photoError: uploadError ?? removeError,
  };
}

export function useChangePassword() {
  const { mutate, loading } = useApiMutation(accountService.changePassword, "Couldn't change your password");
  return { changePassword: mutate, loading };
}
