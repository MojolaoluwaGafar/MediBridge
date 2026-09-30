type Props = {
  firstname: string;
  lastname: string;
  size?: "md" | "lg";
};

// Patients have no photo, so the portals show initials in the patient-card size.
export default function InitialsAvatar({ firstname, lastname, size = "md" }: Props) {
  const sizes = {
    md: "h-21.5 w-21.75 text-[24px]",
    lg: "h-28 w-28 text-[34px]",
  };

  return (
    <span
      className={`flex flex-shrink-0 items-center justify-center rounded-[4.01px] bg-[#DCF2EE] font-medium text-[#28574E] fontOutfit ${sizes[size]}`}
    >
      {firstname.charAt(0)}
      {lastname.charAt(0)}
    </span>
  );
}
