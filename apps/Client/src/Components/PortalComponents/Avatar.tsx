type Props = {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
};

const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// A person's photo, or their initials on the brand tint when there is none.
export default function Avatar({ name, image, size = 40, className = "" }: Props) {
  const style = { width: size, height: size };

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{ ...style, fontSize: size * 0.38 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-[#E3FDF7] font-medium text-[#28574E] ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
