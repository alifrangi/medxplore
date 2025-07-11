import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireStudent = false }) => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();

  // If authentication is required but user is not authenticated
  if (!isAuthenticated) {
    if (requireAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (requireStudent) {
      return <Navigate to="/passport" replace />;
    }
  }

  // Check specific role requirements
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requireStudent && !isStudent) {
    return <Navigate to="/passport" replace />;
  }

  return children;
};

export default ProtectedRoute;