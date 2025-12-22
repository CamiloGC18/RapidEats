import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import clsx from 'clsx';

export type CardVariant = 'elevated' | 'outlined' | 'filled';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'md',
  radius = 'lg',
  hoverable = false,
  clickable = false,
  className,
  children,
  ...props
}) => {
  const cardClasses = clsx(
    // Base styles
    'relative overflow-hidden transition-all duration-250',
    
    // Variant styles
    {
      'bg-white shadow-md': variant === 'elevated',
      'bg-white border border-gray-200': variant === 'outlined',
      'bg-gray-50': variant === 'filled',
    },
    
    // Padding
    {
      'p-0': padding === 'none',
      'p-3': padding === 'sm',
      'p-4': padding === 'md',
      'p-6': padding === 'lg',
    },
    
    // Radius
    {
      'rounded-sm': radius === 'sm',
      'rounded-md': radius === 'md',
      'rounded-lg': radius === 'lg',
      'rounded-xl': radius === 'xl',
    },
    
    // Interactions
    {
      'cursor-pointer': clickable,
    },
    
    className
  );

  const hoverAnimation = hoverable || clickable
    ? {
        whileHover: {
          y: -4,
          boxShadow: variant === 'elevated'
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          transition: { duration: 0.2 },
        },
        whileTap: clickable
          ? { scale: 0.98, transition: { duration: 0.1 } }
          : undefined,
      }
    : {};

  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...hoverAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;

// Card sub-components for better structure
export const CardHeader: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={clsx('border-b border-gray-200 pb-3 mb-3', className)}>
    {children}
  </div>
);

export const CardBody: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={clsx(className)}>{children}</div>
);

export const CardFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={clsx('border-t border-gray-200 pt-3 mt-3', className)}>
    {children}
  </div>
);
