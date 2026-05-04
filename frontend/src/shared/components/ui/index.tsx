import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CircularProgress from '@mui/material/CircularProgress';
import { getStatusColor, getStatusIcon } from '../../utils/helpers';
import Button from './Button';

// ─── Card ────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = true,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={[
      'rounded-2xl border border-surface-200/70 bg-white/78 backdrop-blur-xl',
      'shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-200',
      'hover:border-primary-200/80 hover:bg-white/88 hover:shadow-[0_22px_56px_rgba(15,23,42,0.12)]',
      hover ? 'hover:-translate-y-0.5 cursor-pointer' : '',
      padding ? 'p-5' : '',
      onClick ? 'cursor-pointer' : '',
      className,
    ].join(' ')}
  >
    {children}
  </div>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const badgeStyles: Record<BadgeVariant, string> = {
  primary: 'bg-green-50 text-green-700 border-green-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm' }) => (
  <span
    className={[
      'inline-flex items-center font-medium border rounded-full',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
      badgeStyles[variant],
    ].join(' ')}
  >
    {children}
  </span>
);

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={[
      'inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2 py-0.5',
      getStatusColor(status),
    ].join(' ')}
  >
    <span className="material-icon text-[12px]">{getStatusIcon(status)}</span>
    {status}
  </span>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => (
  <div className={`flex items-center justify-center ${className}`}>
    <CircularProgress size={size} thickness={3} sx={{ color: '#16a34a' }} />
  </div>
);

// ─── PageLoader ───────────────────────────────────────────────────────────────
export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="flex flex-col items-center gap-3">
      <Spinner size={40} />
      <p className="text-sm text-surface-500">Loading...</p>
    </div>
  </div>
);

// ─── EmptyState ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <span className="material-icon text-surface-300 mb-4" style={{ fontSize: 48 }}>
      {icon}
    </span>
    <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-surface-500 max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  footer,
}) => (
  <AnimatePresence>
    {open && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-surface-900/50 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={[
            'relative bg-white rounded-2xl shadow-modal w-full',
            maxWidth,
            'flex flex-col max-h-[90vh]',
          ].join(' ')}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
              <h2 className="text-base font-semibold text-surface-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-surface-400 hover:text-surface-600 transition-colors rounded-lg p-1 hover:bg-surface-100"
              >
                <span className="material-icon text-[20px]">close</span>
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-surface-100 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── SectionHeader ────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
    <div>
      <h1 className="text-xl font-semibold text-surface-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-surface-500 mt-0.5">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconColor = 'text-primary-600 bg-primary-50',
  trend,
  trendUp,
}) => (
  <Card className="overflow-hidden bg-gradient-to-br from-white/88 via-white/74 to-primary-50/35">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-500">{label}</p>
        <p className="mt-1 text-xl font-semibold tracking-tight text-surface-900 sm:text-2xl">{value}</p>
        {trend && (
          <p className={`text-xs mt-1.5 flex items-center gap-0.5 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            <span className="material-icon text-[14px]">{trendUp ? 'trending_up' : 'trending_down'}</span>
            {trend}
          </p>
        )}
      </div>
      <div className={`hidden h-12 w-12 flex-shrink-0 items-center justify-center self-start rounded-2xl ring-1 ring-white/50 min-[480px]:flex ${iconColor}`}>
        <span className="material-icon text-[22px]">{icon}</span>
      </div>
    </div>
  </Card>
);

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading,
  confirmLabel = 'Confirm',
  variant = 'danger',
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    maxWidth="max-w-sm"
    footer={
      <>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <p className="text-sm text-surface-600">{description}</p>
  </Modal>
);

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, required, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-surface-700">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'w-full appearance-none rounded-lg border bg-white text-surface-900',
              'text-sm h-10 px-3.5 pr-9',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-surface-50 disabled:cursor-not-allowed',
              error
                ? 'border-red-400 focus:ring-red-400 bg-red-50'
                : 'border-surface-300 hover:border-surface-400',
              className,
            ].join(' ')}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="material-icon absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none text-[18px]">
            expand_more
          </span>
        </div>
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <span className="material-icon text-[14px]">error</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ─── Table ────────────────────────────────────────────────────────────────────
interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  keyExtractor: (row: T) => string | number;
}

export function Table<T>({ columns, data, loading, emptyMessage = 'No data found', keyExtractor }: TableProps<T>) {
  return (
    <div className="overflow-x-auto -mx-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={[
                  'text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap',
                  col.className || '',
                ].join(' ')}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center">
                <Spinner size={28} />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 text-center text-surface-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-surface-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={['px-4 py-3 text-surface-700', col.className || ''].join(' ')}
                  >
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
