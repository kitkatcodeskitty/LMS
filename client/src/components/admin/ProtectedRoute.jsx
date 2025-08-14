import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const ProtectedRoute = ({ children, requireFullAdmin = false }) => {
  const { isEducator, isSubAdmin, userData } = useContext(AppContext);

  // Check if user has any admin access
  const hasAdminAccess = isEducator || isSubAdmin || userData?.role === 'subadmin';
  
  // Check if user has full admin access
  const hasFullAdminAccess = isEducator;

  if (!hasAdminAccess) {
    return <Navigate to="/" replace />;
  }

  if (requireFullAdmin && !hasFullAdminAccess) {
    return <Navigate to="/educator/student-enrolled" replace />;
  }

  return children;
};

export default ProtectedRoute;