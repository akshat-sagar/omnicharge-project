import React, { forwardRef, useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onIconClick?: () => void;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconPosition = 'left',
      onIconClick,
      required,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const hasLeftIcon = icon && iconPosition === 'left';
    const hasRightIcon = (icon && iconPosition === 'right') || isPassword;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-surface-700"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div className="relative">
          {hasLeftIcon && (
            <span
              className={[
                'material-icon absolute left-3 top-1/2 -translate-y-1/2 text-[18px]',
                error ? 'text-red-400' : 'text-surface-400',
              ].join(' ')}
            >
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            className={[
              'w-full rounded-lg border bg-white text-surface-900',
              'text-sm placeholder:text-surface-400',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              'disabled:bg-surface-50 disabled:text-surface-400 disabled:cursor-not-allowed',
              hasLeftIcon ? 'pl-10' : 'pl-3.5',
              hasRightIcon ? 'pr-10' : 'pr-3.5',
              'py-2.5 h-10',
              error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400 bg-red-50'
                : 'border-surface-300 hover:border-surface-400',
              className,
            ].join(' ')}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <span className="material-icon text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          )}

          {!isPassword && icon && iconPosition === 'right' && (
            <button
              type="button"
              tabIndex={-1}
              onClick={onIconClick}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors"
            >
              <span className="material-icon text-[18px]">{icon}</span>
            </button>
          )}
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <span className="material-icon text-[14px]">error</span>
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-surface-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
