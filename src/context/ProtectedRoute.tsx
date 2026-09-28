import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const currentRole = user?.role?.toLowerCase();

    const isAllowed = roles.some((role) => role.toLowerCase() === currentRole);

    if (!isAllowed) {
      return <Navigate to="/laporan/dosen" replace />;
    }
  }

  return <>{children}</>;
}
