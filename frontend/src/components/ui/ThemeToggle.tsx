import React from 'react';
import { useAppTheme } from '../../theme/AppThemeProvider';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useAppTheme();

  const buttonClasses = [
    'inline-flex items-center gap-3 rounded-full border px-3 py-2 text-sm font-medium transition-colors',
    isDark
      ? 'border-white/90 bg-white text-surface-900 hover:bg-surface-100'
      : 'border-surface-700 bg-surface-900 text-white hover:bg-surface-800',
  ].join(' ');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={buttonClasses}
      aria-pressed={isDark}
      aria-label="Toggle theme"
    >
      <span
        className={['relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
          isDark ? 'bg-surface-300' : 'bg-white/25',
        ].join(' ')}
      >
        <span
          className={['absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            isDark ? 'translate-x-5' : 'translate-x-0',
          ].join(' ')}
        />
      </span>
      <span className="whitespace-nowrap">{isDark ? 'Dark' : 'Light'}</span>
    </button>
  );
};

export default ThemeToggle;
