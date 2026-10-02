import { useState } from "react";

type Props = {
  name: string;
  image?: string | null;
  // Size and shape, e.g. "h-24 w-20 rounded".
  className: string;
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// A doctor's photo in the booking screens, or their initials when there's no
// photo (or it fails to load), so a missing image never shows as broken.
export default function DoctorPhoto({ name, image, className }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (image && failedSrc !== image) {
    return <img className={`${className} object-cover`} src={image} alt={name} loading="lazy" decoding="async" onError={() => setFailedSrc(image)} />;
  }

  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center bg-[#E0F8F3] fontOutfit text-xl font-medium text-[#28574E]`}
      role="img"
      aria-label={name}
    >
      {initialsOf(name)}
    </span>
  );
}
