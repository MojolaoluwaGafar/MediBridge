import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import Avatar from "../../PortalComponents/Avatar";
import { showToast } from "../../../utils/toastHelper";
import type { IAccountProfile } from "../../../types/account";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  profile: IAccountProfile;
  busy: boolean;
  error: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => Promise<void>;
};

export default function ProfilePhoto({ profile, busy, error, onUpload, onRemove }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const fullName = `${profile.firstname} ${profile.lastname}`;

  // Check type and size here too, so a wrong file fails instantly instead of
  // after uploading it. The server enforces the same limits.
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      showToast("Please choose a JPG, PNG or WebP image.", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast("Photos must be smaller than 2 MB.", "error");
      return;
    }
    try {
      await onUpload(file);
      showToast("Profile photo updated");
    } catch {
      // The hook keeps the server's message in `error`.
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove();
      showToast("Profile photo removed");
    } catch {
      // Shown through `error`.
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
      <Avatar name={fullName} image={profile.img} size="xl" />

      <div className="space-y-2">
        <div>
          <p className="fontOutfit text-xl font-medium">{fullName}</p>
          <p className="text-sm text-[#605E5E]">Patient ID {profile.userId}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED.join(",")}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(event) => {
              void handleFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
            className="flex h-9 items-center gap-2 rounded-md bg-[#28574E] px-3 text-sm text-white hover:bg-[#4f8379] disabled:opacity-50"
          >
            <Camera size={16} />
            {busy ? "Saving…" : profile.img ? "Change photo" : "Upload photo"}
          </button>
          {profile.img && (
            <button
              type="button"
              disabled={busy}
              onClick={handleRemove}
              className="flex h-9 items-center gap-2 rounded-md border border-[#D7D7D7] px-3 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Remove
            </button>
          )}
        </div>

        <p className="text-xs text-[#757575]">JPG, PNG or WebP, up to 2 MB.</p>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
