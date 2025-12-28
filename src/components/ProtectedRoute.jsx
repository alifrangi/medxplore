import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePipeline } from '../contexts/PipelineContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireStudent = false }) => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();
  const { currentUser: pipelineUser } = usePipeline();

  // Check if user is authenticated via either system
  const isPipelineAdmin = pipelineUser?.isAdmin === true;
  const isAnyAdmin = isAdmin || isPipelineAdmin;
  const isAnyAuthenticated = isAuthenticated || !!pipelineUser;

  // If authentication is required but user is not authenticated
  if (!isAnyAuthenticated) {
    if (requireAdmin) {
      return <Navigate to="/admin" replace />;
    }
    if (requireStudent) {
      return <Navigate to="/passport" replace />;
    }
  }

  // Check specific role requirements
  if (requireAdmin && !isAnyAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requireStudent && !isStudent) {
    return <Navigate to="/passport" replace />;
  }

  return children;
};

export default ProtectedRoute;