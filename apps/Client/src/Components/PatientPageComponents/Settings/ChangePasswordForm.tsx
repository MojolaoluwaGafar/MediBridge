import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../Button";
import { changePasswordSchema, type ChangePasswordInput } from "../../../Validation/AccountSchema";
import { useChangePassword } from "../../../Hooks/Account/useAccount";
import { showToast } from "../../../utils/toastHelper";

type FieldName = keyof ChangePasswordInput;

const FIELDS: { name: FieldName; label: string; autoComplete: string }[] = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
];

export default function ChangePasswordForm() {
  const [visible, setVisible] = useState(false);
  const { changePassword, loading } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) });

  const submit = async (values: ChangePasswordInput) => {
    try {
      await changePassword(values);
      reset();
      showToast("Password changed");
    } catch (err) {
      // Put the server's answer next to the field it is about, when it says.
      const data = isAxiosError(err)
        ? (err.response?.data as { message?: string; errors?: { field: string; message: string }[] } | undefined)
        : undefined;
      const fieldErrors = data?.errors?.filter((e) => FIELDS.some((f) => f.name === e.field)) ?? [];

      if (fieldErrors.length) {
        fieldErrors.forEach((e) => setError(e.field as FieldName, { message: e.message }));
      } else {
        showToast(data?.message ?? "Couldn't change your password. Please try again.", "error");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {FIELDS.map(({ name, label, autoComplete }) => (
          <label key={name} className="block">
            <span className="block pb-1 text-sm">{label}</span>
            <span className="relative block">
              <input
                type={visible ? "text" : "password"}
                autoComplete={autoComplete}
                aria-invalid={Boolean(errors[name])}
                {...register(name)}
                className="h-10 w-full rounded-md border border-[#D9D9D9] px-3 pr-10 text-sm focus:outline-none focus:border-[#28574E]"
              />
              {name === "currentPassword" && (
                <button
                  type="button"
                  onClick={() => setVisible((v) => !v)}
                  aria-label={visible ? "Hide passwords" : "Show passwords"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#605E5E]"
                >
                  {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </span>
            {errors[name] && <span className="block pt-1 text-xs text-red-600">{errors[name]?.message}</span>}
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          width="w-full sm:w-44"
          disabled={loading}
          content={loading ? "Saving…" : "Update password"}
        />
      </div>
    </form>
  );
}
