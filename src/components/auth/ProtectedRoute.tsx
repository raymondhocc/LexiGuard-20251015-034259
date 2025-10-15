import { Navigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";
type ProtectedRouteProps = {
  children: React.ReactNode;
};
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}