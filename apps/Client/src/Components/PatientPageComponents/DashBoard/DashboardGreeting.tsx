import type { AuthUser } from "../../../types/auth";

import type { ReactNode } from "react";

type Props = {
  user: AuthUser | null;
  // The doctor portal passes its own wording; the patient side uses the defaults.
  title?: string;
  subtitle?: ReactNode;
  // Shown on the right from md up, e.g. today's date.
  aside?: ReactNode;
};

export default function DashboardGreeting({ user, title, subtitle, aside }: Props) {
  return (
    <div className="w-full bg-[#28574E] min-h-[7rem] flex items-center justify-between gap-4 px-4 py-4 md:px-6 rounded-xl">
      <div className="flex flex-col justify-center gap-1 min-w-0">
        <h1 className="text-white font-medium fontOutfit text-lg sm:text-xl md:text-[24px]">
          {title ?? `Hello, ${user?.firstname} ${user?.lastname}`} 👋
        </h1>

        <p className="text-[#F0E9E9] text-sm sm:text-base md:text-[18px] font-light">
          {subtitle ?? "Welcome to Medibridge."}
        </p>
      </div>

      {aside && <div className="hidden md:block shrink-0 text-right text-white/90 text-base">{aside}</div>}
    </div>
  );
}
