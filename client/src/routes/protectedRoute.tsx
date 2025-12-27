import { type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "../features/auth/store/authStore";

interface ProtectedRouteProps {
    allowedRole: "admin" | "collaborator";
    user?: any;
    children: ReactNode;
} 

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRole, children }) => {
  const { user, loading } = useAuthStore();

  // Case 1: Still loading user → show nothing or spinner (prevent flash)
  if (loading) {
    return null; // Or a small spinner if you want
    // return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Case 2: No user → redirect to login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Case 3: User exists but wrong role → redirect to login
  if (user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // Case 4: All good → render protected content
  return <>{children}</>;
};

export default ProtectedRoute;