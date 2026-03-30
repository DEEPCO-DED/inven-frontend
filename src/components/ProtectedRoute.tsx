import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ---------------------------
// Protected Route
// Wraps any page that requires login
// If user is not authenticated — redirects to login page
// If role is specified — checks user has correct role
// Usage:
// <ProtectedRoute> <Dashboard /> </ProtectedRoute>
// <ProtectedRoute allowedRoles={['cafe_manager']}> <CafeDashboard /> </ProtectedRoute>
// ---------------------------
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  // Not logged in — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check — if allowedRoles specified, verify user has that role
  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;