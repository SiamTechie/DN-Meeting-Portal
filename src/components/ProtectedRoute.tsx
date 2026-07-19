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
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
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
