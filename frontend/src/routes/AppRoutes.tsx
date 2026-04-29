import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PageLoader } from '../components/ui/index';
import { AdminRoute, GuestRoute, UserRoute } from './guards';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/layout/AdminLayout';
import ThemeToggle from '../components/ui/ThemeToggle';
import LandingPage from '../components/LandingPage';

const LoginPage = lazy(() => import('../components/auth/LoginPage'));
const RegisterPage = lazy(() => import('../components/auth/RegisterPage'));

const ForgotPasswordPage = lazy(() =>
  import('../components/auth/ForgotResetPassword').then((m) => ({
    default: m.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('../components/auth/ForgotResetPassword').then((m) => ({
    default: m.ResetPasswordPage,
  }))
);

const DashboardPage = lazy(() => import('../components/dashboard/DashboardPage'));
const AdminDashboardPage = lazy(() => import('../components/admin/AdminDashboardPage'));
const RechargePage = lazy(() => import('../components/recharge/RechargePage'));
const MyRechargesPage = lazy(() => import('../components/recharge/MyRechargesPage'));
const TransactionsPage = lazy(() => import('../components/recharge/TransactionsPage'));
const ProfilePage = lazy(() => import('../components/dashboard/ProfilePage'));

const AdminUsersPage = lazy(() => import('../components/admin/AdminUsersPage'));
const AdminOperatorsPage = lazy(() => import('../components/admin/AdminOperatorsPage'));
const AdminPlansPage = lazy(() => import('../components/admin/AdminPlansPage'));
const AdminRechargesPage = lazy(() => import('../components/admin/AdminRechargesPage'));

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 p-8">
    <div className="absolute top-4 right-4">
      <ThemeToggle />
    </div>
    <span className="material-icon text-surface-300 mb-4" style={{ fontSize: 64 }}>error_outline</span>
    <h1 className="text-2xl font-semibold text-surface-900 mb-2">Page not found</h1>
    <p className="text-surface-500 mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
    <a
      href="/app/dashboard"
      className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
    >
      <span className="material-icon text-[18px]">arrow_back</span>
      Back to Dashboard
    </a>
  </div>
);

const AppRoutes: React.FC = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      <Route
        path="/app"
        element={
          <UserRoute>
            <MainLayout />
          </UserRoute>
        }
      >
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<UserRoute><DashboardPage /></UserRoute>} />
        <Route path="recharge" element={<UserRoute><RechargePage /></UserRoute>} />
        <Route path="my-recharges" element={<UserRoute><MyRechargesPage /></UserRoute>} />
        <Route path="transactions" element={<UserRoute><TransactionsPage /></UserRoute>} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="operators" element={<AdminOperatorsPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="recharges" element={<AdminRechargesPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
