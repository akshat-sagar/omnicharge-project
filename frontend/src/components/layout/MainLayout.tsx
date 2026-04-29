import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../ui';

interface NavItem {
  label: string;
  icon: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/app/dashboard' },
  { label: 'Recharge', icon: 'phone_iphone', to: '/app/recharge' },
  { label: 'My Recharges', icon: 'history', to: '/app/my-recharges' },
  { label: 'Transactions', icon: 'receipt_long', to: '/app/transactions' },
  { label: 'Profile', icon: 'person', to: '/app/profile' },
];

const MainLayout: React.FC = () => {
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
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div
          className={['flex items-center gap-2.5 px-5 py-5 border-b border-surface-100/80', effectiveCollapsed ? 'justify-center cursor-pointer' : 'justify-between'].join(' ')}
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
            <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_10px_25px_rgba(59,130,246,0.35)]">
              <span className="material-icon text-white text-[18px]">bolt</span>
            </div>
            {!effectiveCollapsed && (
              <div className="min-w-0">
                <span className="font-semibold text-surface-900 text-sm leading-tight block">OmniCharge</span>
                <span className="text-xs text-surface-400">Platform</span>
              </div>
            )}
          </div>
          {!effectiveCollapsed && !isOverlay && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200/80 bg-surface-50 text-surface-700 hover:bg-surface-100 transition"
              aria-label="Collapse navigation"
            >
              <span className="material-icon text-[20px]">chevron_left</span>
            </button>
          )}
          {!effectiveCollapsed && isOverlay && (
            <button
              type="button"
              onClick={() => {
                closeMobileSidebar();
              }}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-surface-200/80 bg-surface-50 text-surface-700 hover:bg-surface-100 transition"
              aria-label="Close navigation"
            >
              <span className="material-icon text-[20px]">chevron_left</span>
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-surface-400 uppercase tracking-widest px-2 mb-2">
            General
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              [
                'app-nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 mb-0.5',
                collapsed ? 'justify-center' : 'justify-start',
                isActive
                  ? 'app-nav-link-active'
                  : 'app-nav-link-inactive',
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

      {/* User profile at bottom */}
      <div className={['px-3 pb-4 border-t border-surface-100/80 pt-3', collapsed ? 'flex justify-center' : ''].join(' ')}>
        <div
          className={['w-full app-nav-link app-nav-link-inactive flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150', collapsed ? 'justify-center' : 'justify-start'].join(' ')}
        >
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-surface-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-surface-500 truncate">{user?.role}</p>
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
      {/* Desktop sidebar */}
      <aside className={`app-sidebar hidden lg:flex ${sidebarCollapsed ? 'w-20' : 'w-64'} flex-col flex-shrink-0 transition-[width] duration-200`}> 
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-surface-900/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobileSidebar}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="app-sidebar fixed top-0 left-0 z-50 w-64 h-screen flex flex-col lg:hidden"
            >
              <SidebarContent isOverlay />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="app-topbar h-16 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lg:hidden text-surface-500 hover:text-surface-700 p-2 rounded-xl hover:bg-white/70 transition-colors"
              onClick={toggleMobileSidebar}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              <span className="material-icon text-[22px]">{sidebarOpen ? 'close' : 'menu'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto app-main">
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
        description="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        variant="danger"
      />
    </div>
  );
};

export default MainLayout;
