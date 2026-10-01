import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../Hooks/Auth/useAuth";
import { homePathFor, type UserRole } from "../utils/roleHome";

type Props = {
  children: React.ReactNode;
  // Roles allowed on this route. Anyone signed in with another role is sent
  // to their own portal instead.
  roles?: UserRole[];
};

export default function ProtectRoute({ children, roles }: Props) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!user || !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role as UserRole)) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  return children;
}
