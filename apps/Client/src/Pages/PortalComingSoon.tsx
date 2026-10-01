import { useNavigate } from "react-router";
import { PiSignOut } from "react-icons/pi";
import Logo from "../assets/MediBridgeLogo.svg";
import { useAuth } from "../Hooks/Auth/useAuth";

type Props = {
  portal: "Doctor" | "Admin";
};

// Where doctors and admins land after signing in until their portals are
// built. It proves the sign-in, role check and redirect work end to end.
export default function PortalComingSoon({ portal }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-5 text-center">
      <img src={Logo} alt="MediBridge" className="mb-8 w-44" />
      <h1 className="fontOutfit text-2xl font-semibold">
        Welcome{user?.firstname ? `, ${user.firstname}` : ""}
      </h1>
      <p className="mt-2 max-w-md text-[#605E5E]">
        You're signed in to the {portal.toLowerCase()} portal. It's being built and will appear here soon.
      </p>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}
        className="mt-8 flex items-center gap-2 rounded-md border border-[#D7D7D7] bg-white px-4 py-2 text-red-700 hover:bg-red-50"
      >
        <PiSignOut size={18} />
        Log out
      </button>
    </div>
  );
}
