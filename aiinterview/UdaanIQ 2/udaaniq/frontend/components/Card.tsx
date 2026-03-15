import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated';
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-[var(--rounded)] p-5 transition-all duration-200';
    
    const variantClasses = {
      default: 'shadow-[var(--elevation-1)]',
      elevated: 'shadow-[var(--elevation-2)]',
    };
    
    const hoverClasses = hoverable 
      ? 'hover:shadow-[var(--elevation-2)] hover:-translate-y-0.5' 
      : '';
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`;
    
    return (
      <div 
        ref={ref} 
        className={classes} 
        style={{ background: 'var(--surface)' }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';