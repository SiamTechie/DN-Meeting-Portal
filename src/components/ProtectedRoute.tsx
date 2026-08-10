import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background select-none">
        <div className="relative flex items-center justify-center">
          {/* Pulsing background glow */}
          <div className="absolute w-16 h-16 bg-primary/15 rounded-full animate-ping"></div>
          {/* Inner spinner */}
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requireAdmin && userRole !== 'admin') {
    // If not admin, redirect to normal user profile or home
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};
