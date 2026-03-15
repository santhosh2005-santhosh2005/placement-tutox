import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-[var(--rounded)] px-3 py-2 focus:outline-none focus:ring-2';
    
    const errorClasses = error 
      ? 'border-[#EA4335] focus:ring-[#EA4335]' 
      : 'border-[var(--border)] focus:ring-[#1A73E8]';
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const classes = `${baseClasses} ${errorClasses} ${widthClass} ${className}`;
    
    return (
      <div className={`flex flex-col ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            className="block text-sm font-medium mb-1"
            style={{ color: 'var(--text)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-alt)' }}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`${classes} ${icon ? 'pl-10' : ''}`}
            style={{ 
              background: 'var(--surface)',
              color: 'var(--text)',
              borderColor: error ? '#EA4335' : 'var(--border)'
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm" style={{ color: '#EA4335' }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';