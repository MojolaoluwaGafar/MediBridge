import {
  useAuthContext,
} from "../../Context/AuthContext";
import type { AuthUser } from "../../types";

export const useAuth = useAuthContext;
export type { AuthUser };