import PageHeader from "../../PortalComponents/PageHeader";
import ProfilePhoto from "./ProfilePhoto";
import PersonalDetails from "./PersonalDetails";
import ChangePassword from "./ChangePassword";
import { useAccount } from "../../../Hooks/Account/useAccount";

export default function AccountSettings() {
  const {
    profile,
    loading,
    error,
    pending,
    updatePhone,
    uploadPhoto,
    removePhoto,
    changePassword,
  } = useAccount();

  return (
    <div className="w-full">
      <PageHeader
        title="Account Settings"
        description="Update your photo, contact number and password."
      />

      {loading && !profile && <p className="py-10 text-center text-[#707070]">Loading your account…</p>}
      {error && !profile && <p className="py-10 text-center text-red-600">{error}</p>}

      {profile && (
        <div className="mt-6 flex flex-col gap-6">
          <ProfilePhoto
            name={`${profile.firstname} ${profile.lastname}`}
            image={profile.img}
            busy={pending === "photo"}
            onUpload={uploadPhoto}
            onRemove={removePhoto}
          />
          <PersonalDetails profile={profile} saving={pending === "phone"} onSavePhone={updatePhone} />
          <ChangePassword saving={pending === "password"} onChangePassword={changePassword} />
        </div>
      )}
    </div>
  );
}
