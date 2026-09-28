import React from 'react'

type Props = {
  className?: string,
  content: string | React.ReactNode,
  type: "button" | "submit" | "reset",
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
  variant?: "primary" | "primaryWBorder" | "secondary" | "outline",
  width?: string,
  disabled? : boolean,
}

export default function Button({
  className,
  content,
  type,
  onClick,
  variant = "primary",
  width = "w-full",
  disabled
}: Props) {
  const baseStyles = "h-[52px] rounded-md text-[18px] cursor-pointer fontOutfit transition-colors duration-300";

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
    >
      {content}
    </button>
  );
}
