import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 🚨 NEW: block dashboard access if password not changed
  const isOnAuthPage =
    location.pathname === '/change-password' ||
    location.pathname === '/login';

  if (user?.mustChangePassword && !isOnAuthPage) {
    return <Navigate to="/change-password" replace />;
  }

  return <Outlet />;
};

// import React from 'react';
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { LoadingSpinner } from '@/components/LoadingSpinner';

// export const ProtectedRoute = () => {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };
