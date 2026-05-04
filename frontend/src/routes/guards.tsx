import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProfile } from '../store/slices/authSlice';
import { PageLoader } from '../shared/components/ui';

const getDashboardRoute = (role?: string | null) => (role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');

// ─── Protected Route (requires login) ────────────────────────────────────────
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user, accessToken } = useAppSelector((s) => s.auth);

  useEffect(() => {
    // If authenticated but no user profile loaded yet, fetch it
    if (isAuthenticated && accessToken && !user) {
      dispatch(fetchProfile());
    }
  }, [isAuthenticated, accessToken, user, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && !user && isLoading) {
    return <PageLoader />;
  }

  return <>{children}</>;
};

// ─── Admin Route (requires ADMIN role) ───────────────────────────────────────
interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/app/dashboard" replace />;
  }

  if (!user) {
    return <PageLoader />;
  }

  return <>{children}</>;
};

interface UserRouteProps {
  children: React.ReactNode;
}

export const UserRoute: React.FC<UserRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <PageLoader />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

// ─── Guest Route (redirect if already logged in) ─────────────────────────────
interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (isAuthenticated) {
    return <Navigate to={getDashboardRoute(user?.role)} replace />;
  }

  return <>{children}</>;
};
