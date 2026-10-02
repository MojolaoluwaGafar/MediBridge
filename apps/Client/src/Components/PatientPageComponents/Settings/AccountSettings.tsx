import type { ReactNode } from "react";
import { Info, UserRound } from "lucide-react";
import PageHeader from "../../PortalComponents/PageHeader";
import EmptyState from "../../PortalComponents/EmptyState";
import ProfilePhoto from "./ProfilePhoto";
import ChangePasswordForm from "./ChangePasswordForm";
import { useAccount } from "../../../Hooks/Account/useAccount";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-[#E6E3E3] bg-white p-4 sm:p-6">
      <h2 className="fontOutfit text-lg font-medium">{title}</h2>
      <p className="pb-5 text-sm text-[#707070]">{description}</p>
      {children}
    </section>
  );
}

type Props = {
  // The doctor portal shows a staff ID and its own wording.
  idLabel?: string;
  photoHint?: string;
};

export default function AccountSettings({
  idLabel = "Patient ID",
  photoHint = "Your photo helps your care team recognise you.",
}: Props) {
  const { profile, loading, error, uploadPhoto, removePhoto, photoBusy, photoError } = useAccount();

  if (loading) {
    return <p className="py-10 text-center text-[#707070]">Loading your account…</p>;
  }

  if (error || !profile) {
    return (
      <EmptyState
        icon={<UserRound size={28} />}
        title="We couldn't load your account"
        description={error ?? "Please refresh the page to try again."}
      />
    );
  }

  const details: [string, string][] = [
    ["First name", profile.firstname],
    ["Last name", profile.lastname],
    [idLabel, profile.userId],
    ["Email address", profile.email],
    ["Phone number", profile.phone],
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader title="Account Settings" description="Manage your profile and keep your account secure." />

      <Section title="Profile" description={photoHint}>
        <ProfilePhoto
          profile={profile}
          busy={photoBusy}
          error={photoError}
          onUpload={uploadPhoto}
          onRemove={removePhoto}
          idLabel={idLabel}
        />
      </Section>

      <Section title="Personal details" description="These details come from your hospital registration.">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-[#757575]">{label}</dt>
              <dd className="truncate fontOutfit" title={value}>{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 flex items-start gap-2 rounded-lg bg-[#F5F7FA] p-3 text-sm text-[#605E5E]">
          <Info size={16} className="mt-0.5 shrink-0" />
          Your email and phone number are used to verify your identity and recover your account, so they can only be
          changed by the hospital. Contact the front desk if any of these details are wrong.
        </p>
      </Section>

      <Section title="Password" description="Use at least 8 characters. You'll stay signed in on this device.">
        <ChangePasswordForm />
      </Section>
    </div>
  );
}
