import { useState } from "react";

type Props = {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
};

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-24 w-24 text-2xl",
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// A photo when there is one, otherwise the person's initials. Falls back to
// initials too if the photo fails to load.
export default function Avatar({ name, image, size = "md" }: Props) {
  // Remembers which URL failed, so a new photo gets a fresh chance to load.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const className = `${SIZES[size]} shrink-0 rounded-full`;

  if (image && image !== failedSrc) {
    return (
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className={`${className} object-cover`}
        onError={() => setFailedSrc(image)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${className} flex items-center justify-center bg-[#E0F8F3] font-medium text-[#28574E] fontOutfit`}
    >
      {initialsOf(name)}
    </span>
  );
}
