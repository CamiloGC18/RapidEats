import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = clsx(
      // Base styles
      'relative inline-flex items-center justify-center',
      'font-medium rounded-lg',
      'transition-all duration-250',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'overflow-hidden',
      
      // Full width
      fullWidth && 'w-full',
      
      // Size variants
      {
        'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
        'px-4 py-2 text-base gap-2': size === 'md',
        'px-6 py-3 text-lg gap-2.5': size === 'lg',
        'px-8 py-4 text-xl gap-3': size === 'xl',
      },
      
      // Variant styles
      {
        // Primary
        'bg-[var(--rapid-green)] text-white hover:bg-[var(--rapid-green-hover)] active:bg-[var(--rapid-green-active)] focus:ring-[var(--rapid-green)] shadow-sm hover:shadow-md':
          variant === 'primary',
        
        // Secondary
        'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700 focus:ring-gray-900 shadow-sm hover:shadow-md':
          variant === 'secondary',
        
        // Outline
        'bg-transparent border-2 border-[var(--rapid-green)] text-[var(--rapid-green)] hover:bg-[var(--rapid-green)] hover:text-white active:bg-[var(--rapid-green-active)] focus:ring-[var(--rapid-green)]':
          variant === 'outline',
        
        // Ghost
        'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-300':
          variant === 'ghost',
        
        // Danger
        'bg-[var(--rapid-red)] text-white hover:bg-[var(--rapid-red-hover)] active:bg-[var(--rapid-red-active)] focus:ring-[var(--rapid-red)] shadow-sm hover:shadow-md':
          variant === 'danger',
      },
      
      className
    );

    return (
      <button
        ref={ref}
        className={baseStyles}
        disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effect container */}
        <span className="ripple-container" />
        
        {/* Loading spinner */}
        {loading && (
          <motion.svg
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="animate-spin h-5 w-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}
        
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="inline-flex items-center">{leftIcon}</span>
        )}
        
        {/* Button text */}
        <span>{children}</span>
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="inline-flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
