import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const profileStr = localStorage.getItem('profile');
  const profile = profileStr ? JSON.parse(profileStr) : null;
  
  if (!profile || !profile.token || !profile.user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = profile.user.role;

  // If roles are specified, check if user's role is allowed
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If unauthorized, redirect to their default dashboard to avoid loops
    const hotelRoles = ['hotel_admin', 'hotel_manager', 'receptionist', 'restaurant_manager', 'kitchen_staff', 'cashier'];
    if (hotelRoles.includes(userRole)) {
      if (window.location.pathname === '/hotel-dashboard') return <Navigate to="/login" replace />;
      return <Navigate to="/hotel-dashboard" replace />;
    }
    
    // Default to system admin home for any other logged-in user (admin)
    if (window.location.pathname === '/') return <Navigate to="/login" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
