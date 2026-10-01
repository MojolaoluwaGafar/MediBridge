import React from 'react'

type Props = {
  className?: string,
  content: string | React.ReactNode,
  type: "button" | "submit" | "reset",
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
  variant?: "primary" | "primaryWBorder" | "secondary" | "outline",
  width?: string,
  disabled? : boolean,
  // "md" is the original 52px button; "sm" is the compact one used in portal cards.
  size?: "md" | "sm",
  ariaLabel?: string,
}

export default function Button({
  className,
  content,
  type,
  onClick,
  variant = "primary",
  width = "w-full",
  disabled,
  size = "md",
  ariaLabel,
}: Props) {
  const sizes: Record<string, string> = {
    md: "h-[52px] text-[18px]",
    sm: "h-10 px-4 text-sm",
  };
  const baseStyles = `${sizes[size]} inline-flex items-center justify-center gap-2 rounded-md cursor-pointer fontOutfit transition-colors duration-300`;

  const variants: Record<string, string> = {
    primary: "bg-[#28574E] text-white hover:bg-[#4f8379]",
    primaryWBorder: "border border-white text-white hover:border-none hover:bg-[#4f8379]",
    secondary: "bg-white text-[#28574E] hover:bg-[#28574E] hover:text-white",
    outline: "bg-white border border-[#28574E] text-[#28574E] hover:bg-[#28574E] hover:border-none hover:text-white"
  };

  const disabledStyles = "opacity-50 cursor-not-allowed hover:none";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className || ""} ${width} ${disabled ? disabledStyles : ""}`}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
