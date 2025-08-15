import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Optional prop for allowed roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />; // Redirect to login if not logged in
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If roles are specified and user's role is not allowed
    // You might want to redirect to a specific unauthorized page or home
    return <Navigate to="/" replace />; // Redirect to home or an unauthorized page
  }

  return <Outlet />;
};

export default ProtectedRoute;