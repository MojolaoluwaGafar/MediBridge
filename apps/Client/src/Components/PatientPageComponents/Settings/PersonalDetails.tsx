import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SettingsCard from "./SettingsCard";
import Input from "../../Input";
import { phoneSchema, type PhoneInput } from "../../../Validation/AccountSchema";
import type { IAccountProfile } from "../../../types/account";
import { showToast } from "../../../utils/toastHelper";
import { getApiErrorMessage } from "../../../utils/apiError";

type Props = {
  profile: IAccountProfile;
  saving: boolean;
  onSavePhone: (phone: string) => Promise<unknown>;
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-sm text-[#757575]">{label}</p>
      <p className="truncate pt-1 text-base">{value}</p>
    </div>
  );
}

export default function PersonalDetails({ profile, saving, onSavePhone }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: profile.phone },
  });

  useEffect(() => {
    reset({ phone: profile.phone });
  }, [profile.phone, reset]);

  const submit = async ({ phone }: PhoneInput) => {
    try {
      await onSavePhone(phone);
      showToast("Phone number updated");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't update your phone number."), "error");
    }
  };

  return (
    <SettingsCard
      title="Personal details"
      description="Your name, email and Patient ID come from your hospital record. Contact the hospital to change them."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReadOnlyField label="First name" value={profile.firstname} />
        <ReadOnlyField label="Last name" value={profile.lastname} />
        <ReadOnlyField label="Email" value={profile.email} />
        <ReadOnlyField label="Patient ID" value={profile.patientId} />
      </div>

      <form onSubmit={handleSubmit(submit)} className="mt-6 border-t border-[#E6E3E3] pt-5" noValidate>
        <label htmlFor="phone" className="text-sm text-[#757575]">
          Phone number
        </label>
        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-start">
          <div className="flex-1">
            <Input {...register("phone")} id="phone" type="tel" inputMode="tel" className="h-10" />
            {errors.phone && <p className="pt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="h-10 rounded-md bg-[#28574E] px-6 text-sm text-white transition-colors hover:bg-[#4f8379] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </SettingsCard>
  );
}
