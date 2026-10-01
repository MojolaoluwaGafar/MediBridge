import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import SettingsCard from "./SettingsCard";
import Input from "../../Input";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "../../../Validation/AccountSchema";
import { showToast } from "../../../utils/toastHelper";
import { getApiErrorMessage } from "../../../utils/apiError";

type Props = {
  saving: boolean;
  onChangePassword: (values: ChangePasswordInput) => Promise<unknown>;
};

const FIELDS: { name: keyof ChangePasswordInput; label: string; autoComplete: string }[] = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
];

export default function ChangePassword({ saving, onChangePassword }: Props) {
  const [showPasswords, setShowPasswords] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const submit = async (values: ChangePasswordInput) => {
    try {
      await onChangePassword(values);
      reset();
      showToast("Password changed");
    } catch (err) {
      // Show field errors from the server (e.g. a wrong current password) on the field.
      const fieldErrors = isAxiosError(err)
        ? (err.response?.data as { errors?: { field: string; message: string }[] })?.errors
        : undefined;
      const known = fieldErrors?.filter((e) => FIELDS.some((f) => f.name === e.field)) ?? [];
      known.forEach((e) => setError(e.field as keyof ChangePasswordInput, { message: e.message }));
      if (!known.length) {
        showToast(getApiErrorMessage(err, "Couldn't change your password."), "error");
      }
    }
  };

  return (
    <SettingsCard title="Change password" description="Use at least 8 characters.">
      <form onSubmit={handleSubmit(submit)} className="flex max-w-md flex-col gap-4" noValidate>
        {FIELDS.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="text-sm text-[#757575]">
              {field.label}
            </label>
            <Input
              {...register(field.name)}
              id={field.name}
              type={showPasswords ? "text" : "password"}
              autoComplete={field.autoComplete}
              className="mt-1 h-10"
            />
            {errors[field.name] && (
              <p className="pt-1 text-sm text-red-600">{errors[field.name]?.message}</p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className="flex w-fit items-center gap-2 text-sm text-[#28574E]"
        >
          {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPasswords ? "Hide passwords" : "Show passwords"}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="h-10 w-full rounded-md bg-[#28574E] px-6 text-sm text-white transition-colors hover:bg-[#4f8379] disabled:opacity-50 sm:w-fit"
        >
          {saving ? "Saving…" : "Update password"}
        </button>
      </form>
    </SettingsCard>
  );
}
