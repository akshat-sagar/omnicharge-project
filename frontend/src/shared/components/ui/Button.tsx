import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

type NativeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onDrag' | 'onDragStart' | 'onDragEnd'
>;

interface ButtonProps extends NativeButtonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-500 active:bg-primary-700 disabled:bg-primary-300 shadow-[0_12px_28px_rgba(22,163,74,0.28)]',
  secondary:
    'bg-white/8 text-surface-100 border border-white/15 hover:bg-white/12 active:bg-white/18 disabled:opacity-50 backdrop-blur-xl',
  ghost:
    'bg-transparent text-surface-300 hover:bg-white/8 active:bg-white/12 disabled:opacity-50',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:opacity-50 shadow-sm',
  success:
    'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 disabled:opacity-50 shadow-sm',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={[
        'inline-flex items-center justify-center font-medium rounded-full',
        'transition-all duration-150 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        isDisabled ? '' : 'active:scale-[0.97]',
        'disabled:cursor-not-allowed select-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          color="inherit"
          thickness={4}
        />
      ) : icon && iconPosition === 'left' ? (
        <span className="material-icon" style={{ fontSize: size === 'sm' ? 16 : size === 'lg' ? 22 : 18 }}>
          {icon}
        </span>
      ) : null}

      {children && <span>{children}</span>}

      {!loading && icon && iconPosition === 'right' ? (
        <span className="material-icon" style={{ fontSize: size === 'sm' ? 16 : size === 'lg' ? 22 : 18 }}>
          {icon}
        </span>
      ) : null}
    </button>
  );
};

export default Button;
