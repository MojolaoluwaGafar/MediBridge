import type { AuthUser } from "../../../types/auth";

type Props = {
  user: AuthUser | null;
};

export default function DashboardGreeting({ user }: Props) {
  return (
    <div className="w-full bg-[#28574E] min-h-[7rem] flex flex-col justify-center px-4 md:px-6 gap-1 rounded-xl">
      <h1 className="text-white font-medium fontOutfit text-lg sm:text-xl md:text-[24px]">
        Hello, {user?.firstname} {user?.lastname} 👋
      </h1>

      <p className="text-[#F0E9E9] text-sm sm:text-base md:text-[18px] font-light">
        Welcome to Medibridge.
      </p>
    </div>
  );
}
