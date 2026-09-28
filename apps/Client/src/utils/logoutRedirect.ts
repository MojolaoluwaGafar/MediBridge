import { clearAuth } from "./authToken";

export const logoutAndRedirect = (navigate?: (to: string, opts?: Record<string, unknown>) => void) => {
  clearAuth();
  if (navigate) {
    navigate("/login", { replace: true });
  } else {
    window.location.replace("/login");
  }
};

