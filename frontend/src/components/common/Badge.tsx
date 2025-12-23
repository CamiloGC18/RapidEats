import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

export type BadgeVariant = 'solid' | 'outline' | 'soft';
export type BadgeColor = 'default' | 'success' | 'warning' | 'error' | 'info' | 'green';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'solid',
  color = 'default',
  size = 'md',
  dot = false,
  icon,
  removable = false,
  onRemove,
  className,
  children,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const colorClasses = {
    solid: {
      default: 'bg-gray-600 text-white',
      success: 'bg-[var(--success)] text-white',
      warning: 'bg-[var(--warning)] text-white',
      error: 'bg-[var(--error)] text-white',
      info: 'bg-[var(--info)] text-white',
      green: 'bg-[var(--rapid-green)] text-white',
    },
    outline: {
      default: 'border-2 border-gray-600 text-gray-600',
      success: 'border-2 border-[var(--success)] text-[var(--success)]',
      warning: 'border-2 border-[var(--warning)] text-[var(--warning)]',
      error: 'border-2 border-[var(--error)] text-[var(--error)]',
      info: 'border-2 border-[var(--info)] text-[var(--info)]',
      green: 'border-2 border-[var(--rapid-green)] text-[var(--rapid-green)]',
    },
    soft: {
      default: 'bg-gray-100 text-gray-700 border border-gray-200',
      success: 'bg-[var(--success-light)] text-[var(--success-dark)] border border-[var(--success)]',
      warning: 'bg-[var(--warning-light)] text-[var(--warning-dark)] border border-[var(--warning)]',
      error: 'bg-[var(--error-light)] text-[var(--error-dark)] border border-[var(--error)]',
      info: 'bg-[var(--info-light)] text-[var(--info-dark)] border border-[var(--info)]',
      green: 'bg-green-50 text-green-700 border border-[var(--rapid-green)]',
    },
  };

  const dotColorClasses = {
    default: 'bg-gray-600',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    error: 'bg-[var(--error)]',
    info: 'bg-[var(--info)]',
    green: 'bg-[var(--rapid-green)]',
  };

  const badgeClasses = clsx(
    'inline-flex items-center gap-1.5 font-medium rounded-full transition-all',
    sizeClasses[size],
    colorClasses[variant][color],
    className
  );

  return (
    <motion.span
      className={badgeClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {dot && (
        <span
          className={clsx(
            'w-2 h-2 rounded-full animate-pulse',
            dotColorClasses[color]
          )}
        />
      )}
      {icon && <span className="inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {removable && onRemove && (
        <motion.button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center ml-1 rounded-full hover:bg-black/10 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="sr-only">Remover</span>
          <XMarkIcon className="w-3.5 h-3.5" />
        </motion.button>
      )}
    </motion.span>
  );
};

export default Badge;
