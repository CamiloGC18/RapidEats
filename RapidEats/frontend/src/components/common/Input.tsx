import React, { InputHTMLAttributes, forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      inputSize = 'md',
      type = 'text',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;

    const containerClasses = clsx(
      'relative',
      fullWidth ? 'w-full' : 'w-auto'
    );

    const inputClasses = clsx(
      // Base styles
      'block w-full rounded-lg border transition-all duration-250',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
      
      // Size variants
      {
        'px-3 py-1.5 text-sm': inputSize === 'sm',
        'px-4 py-2.5 text-base': inputSize === 'md',
        'px-5 py-3.5 text-lg': inputSize === 'lg',
      },
      
      // Icon padding adjustments
      {
        'pl-10': leftIcon && inputSize === 'sm',
        'pl-11': leftIcon && inputSize === 'md',
        'pl-12': leftIcon && inputSize === 'lg',
        'pr-10': (rightIcon || isPassword) && inputSize === 'sm',
        'pr-11': (rightIcon || isPassword) && inputSize === 'md',
        'pr-12': (rightIcon || isPassword) && inputSize === 'lg',
      },
      
      // States
      {
        'border-gray-300 focus:border-[var(--rapid-green)] focus:ring-[var(--rapid-green)]':
          !error && !disabled,
        'border-[var(--rapid-red)] focus:border-[var(--rapid-red)] focus:ring-[var(--rapid-red)]':
          error && !disabled,
        'border-gray-200': disabled,
      },
      
      className
    );

    const iconClasses = clsx(
      'absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none',
      {
        'w-4 h-4': inputSize === 'sm',
        'w-5 h-5': inputSize === 'md',
        'w-6 h-6': inputSize === 'lg',
      }
    );

    const leftIconClasses = clsx(iconClasses, {
      'left-3': inputSize === 'sm',
      'left-3.5': inputSize === 'md',
      'left-4': inputSize === 'lg',
    });

    const rightIconClasses = clsx(iconClasses, {
      'right-3': inputSize === 'sm',
      'right-3.5': inputSize === 'md',
      'right-4': inputSize === 'lg',
    });

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <motion.label
            className={clsx(
              'block mb-2 font-medium transition-colors',
              error ? 'text-[var(--rapid-red)]' : 'text-gray-700'
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <span className={leftIconClasses}>
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {/* Right icon or password toggle */}
          {(rightIcon || isPassword) && (
            <span className={rightIconClasses}>
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="pointer-events-auto focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-full h-full"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </span>
          )}

          {/* Focus ring animation */}
          <AnimatePresence>
            {isFocused && !error && (
              <motion.div
                className="absolute inset-0 rounded-lg pointer-events-none"
                style={{
                  boxShadow: '0 0 0 3px rgba(6, 193, 103, 0.1)',
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Error or helper text */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="mt-1.5 text-sm text-[var(--rapid-red)] flex items-center gap-1"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </motion.p>
          )}
          {helperText && !error && (
            <motion.p
              key="helper"
              className="mt-1.5 text-sm text-gray-500"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
