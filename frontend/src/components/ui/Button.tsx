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
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300 shadow-sm',
  secondary:
    'bg-white text-surface-700 border border-surface-300 hover:bg-surface-50 active:bg-surface-100 disabled:opacity-50 shadow-sm',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 active:bg-surface-200 disabled:opacity-50',
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
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-150 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
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
