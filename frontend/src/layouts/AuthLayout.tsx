import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => (
  <div className="auth-shell min-h-screen flex items-center justify-center p-4">
    {/* Subtle background pattern */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(34,197,94,0.34) 1px, transparent 0)`,
          backgroundSize: '34px 34px',
        }}
      />
    </div>

    <div className="w-full max-w-[420px] relative">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center mb-8"
      >
        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mb-3 shadow-[0_16px_32px_rgba(22,163,74,0.32)]">
          <span className="material-icon text-white text-[26px]">bolt</span>
        </div>
        <span className="font-semibold text-surface-900 text-lg">OmniCharge</span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-8"
      >
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-surface-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-surface-500 mt-1">{subtitle}</p>}
        </div>
        {children}
      </motion.div>

      <p className="text-center text-xs text-surface-400 mt-6">
        © {new Date().getFullYear()} OmniCharge. All rights reserved.
      </p>
    </div>
  </div>
);

export default AuthLayout;
