import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../shared/components/ui';

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'admin_panel_settings', to: '/admin/dashboard' },
  { label: 'Users', icon: 'group', to: '/admin/users' },
  { label: 'Operators', icon: 'business', to: '/admin/operators' },
  { label: 'Plans', icon: 'list_alt', to: '/admin/plans' },
  { label: 'All Recharges', icon: 'manage_history', to: '/admin/recharges' },
  { label: 'Profile', icon: 'person', to: '/admin/profile' },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const closeMobileSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (next) {
        setSidebarCollapsed(false);
      }
      return next;
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const SidebarContent = ({ collapsed = false, isOverlay = false }: { collapsed?: boolean; isOverlay?: boolean }) => {
    const effectiveCollapsed = isOverlay ? false : collapsed;

    return (
      <div className="flex h-full flex-col">
        <div
          className={['flex items-center gap-2.5 border-b border-surface-100/80 px-5 py-5', effectiveCollapsed ? 'justify-center cursor-pointer' : 'justify-between'].join(' ')}
          {...(collapsed
            ? {
                onClick: () => setSidebarCollapsed(false),
                role: 'button',
                'aria-label': 'Expand navigation',
              }
            : {}
          )}
        >
          <div className={['flex items-center gap-2', effectiveCollapsed ? 'justify-center w-full' : 'justify-start'].join(' ')}>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600 shadow-[0_10px_25px_rgba(22,163,74,0.35)]">
              <span className="material-icon text-[18px] text-white">shield</span>
            </div>
            {!effectiveCollapsed && (
              <div className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-surface-900">OmniCharge</span>
                <span className="text-xs text-surface-400">Admin Console</span>
              </div>
            )}
          </div>
          {!effectiveCollapsed && !isOverlay && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200/80 bg-surface-50 text-surface-700 transition hover:bg-surface-100"
              aria-label="Collapse navigation"
            >
              <span className="material-icon text-[20px]">chevron_left</span>
            </button>
          )}
          {!effectiveCollapsed && isOverlay && (
            <button
              type="button"
              onClick={closeMobileSidebar}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200/80 bg-surface-50 text-surface-700 transition hover:bg-surface-100"
              aria-label="Close navigation"
            >
              <span className="material-icon text-[20px]">chevron_left</span>
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {!collapsed && (
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-surface-400">
              Administration
            </p>
          )}
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMobileSidebar}
              className={({ isActive }) =>
                [
                  'app-nav-link mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                  collapsed ? 'justify-center' : 'justify-start',
                  isActive ? 'app-nav-link-active' : 'app-nav-link-inactive',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`material-icon text-[20px] ${isActive ? 'app-nav-icon-active' : 'app-nav-icon-inactive'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={['border-t border-surface-100/80 px-3 pb-4 pt-3', collapsed ? 'flex justify-center' : ''].join(' ')}>
          <div
            className={['app-nav-link app-nav-link-inactive flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150', collapsed ? 'justify-center' : 'justify-start'].join(' ')}
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100">
              <span className="text-xs font-bold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-medium text-surface-900">{user?.name || 'Admin'}</p>
                  <p className="truncate text-xs text-surface-500">{user?.role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  aria-label="Log out"
                >
                  <span className="material-icon text-[18px]">logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      <div className="app-shell-glow app-shell-glow-one" />
      <div className="app-shell-glow app-shell-glow-two" />

      <aside className={`app-sidebar hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-col flex-shrink-0 transition-[width] duration-200`}>
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-emerald-950/55 backdrop-blur-sm lg:hidden"
              onClick={closeMobileSidebar}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="app-sidebar fixed top-0 left-0 z-50 flex h-screen w-64 flex-col lg:hidden"
            >
              <SidebarContent isOverlay />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="app-topbar flex h-16 flex-shrink-0 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-surface-500 transition-colors hover:bg-white/10 hover:text-surface-700 lg:hidden"
              onClick={toggleMobileSidebar}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              <span className="material-icon text-[22px]">{sidebarOpen ? 'close' : 'menu'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300 backdrop-blur">
              Admin
            </span>
          </div>
        </header>

        <main className="app-main flex-1 overflow-y-auto">
          <div className="page-container relative py-8">
            <div className="app-page-orb app-page-orb-one" />
            <div className="app-page-orb app-page-orb-two" />
            <Outlet />
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        title="Log out?"
        description="Are you sure you want to log out of your admin account?"
        confirmLabel="Log out"
        variant="danger"
      />
    </div>
  );
};

export default AdminLayout;
