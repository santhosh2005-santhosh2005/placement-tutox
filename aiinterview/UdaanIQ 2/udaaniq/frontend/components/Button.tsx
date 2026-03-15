import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-[var(--rounded)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-[#1A73E8] text-white hover:bg-[#1967D2] focus:ring-[#1A73E8] shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)]',
      secondary: 'text-[#1A73E8] border border-[var(--border)] hover:bg-[var(--hover)] focus:ring-[#1A73E8] shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)]',
      success: 'bg-[#34A853] text-white hover:bg-[#2D9548] focus:ring-[#34A853] shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)]',
      warning: 'bg-[#FBBC05] text-[#202124] hover:bg-[#EAA900] focus:ring-[#FBBC05] shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)]',
      error: 'bg-[#EA4335] text-white hover:bg-[#D93025] focus:ring-[#EA4335] shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)]',
      gradient: 'bg-gradient-to-r from-[#1A73E8] to-[#34A853] text-white hover:opacity-90 focus:ring-[#1A73E8] shadow-[var(--elevation-1)] hover:shadow-[var(--elevation-2)]',
    };
    
    // Set background color based on variant and theme
    const getBackgroundColor = () => {
      if (variant === 'secondary') {
        return 'var(--surface)';
      }
      return '';
    };
    
    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    };
    
    const widthClass = fullWidth ? 'w-full' : '';
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;
    
    return (
      <button 
        ref={ref} 
        className={classes} 
        style={{ background: getBackgroundColor() }}
        {...props}
      >
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';