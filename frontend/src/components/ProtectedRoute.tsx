import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // While loading the current user, don't flash redirects
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F5F0]">
        <p className="text-sm text-gray-600">Loading…</p>
      </div>
    );
  }

  // Not logged in → kick to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → render the protected content
  return <>{children}</>;
}
