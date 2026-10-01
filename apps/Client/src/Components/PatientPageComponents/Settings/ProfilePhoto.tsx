import { useRef } from "react";
import Avatar from "../../PortalComponents/Avatar";
import SettingsCard from "./SettingsCard";
import { showToast } from "../../../utils/toastHelper";
import { getApiErrorMessage } from "../../../utils/apiError";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  name: string;
  image: string | null;
  busy: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: () => Promise<unknown>;
};

export default function ProfilePhoto({ name, image, busy, onUpload, onRemove }: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    // Checked here too, so a wrong file fails instantly instead of after uploading.
    if (!ACCEPTED.includes(file.type)) {
      showToast("Please choose a JPG, PNG or WebP image.", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      showToast("Please choose an image under 2 MB.", "error");
      return;
    }
    try {
      await onUpload(file);
      showToast("Profile photo updated");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't upload your photo."), "error");
    }
  };

  const handleRemove = async () => {
    try {
      await onRemove();
      showToast("Profile photo removed");
    } catch (err) {
      showToast(getApiErrorMessage(err, "Couldn't remove your photo."), "error");
    }
  };

  return (
    <SettingsCard title="Profile photo" description="Shown to your doctors and in the top bar.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar name={name} image={image} size={80} />

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => fileInput.current?.click()}
              className="h-10 rounded-md bg-[#28574E] px-4 text-sm text-white transition-colors hover:bg-[#4f8379] disabled:opacity-60"
            >
              {busy ? "Saving…" : image ? "Change photo" : "Upload photo"}
            </button>
            {image && (
              <button
                type="button"
                disabled={busy}
                onClick={() => void handleRemove()}
                className="h-10 rounded-md border border-[#D7D7D7] px-4 text-sm text-red-700 transition-colors hover:bg-red-50 disabled:opacity-60"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-[#757575]">JPG, PNG or WebP, up to 2 MB.</p>
        </div>

        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
    </SettingsCard>
  );
}
