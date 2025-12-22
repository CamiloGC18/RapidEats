import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type AvatarBadgeStatus = 'online' | 'offline' | 'away' | 'busy';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  badge?: AvatarBadgeStatus;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  badge,
  className,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  const badgeSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const badgeColorClasses = {
    online: 'bg-[var(--success)]',
    offline: 'bg-gray-400',
    away: 'bg-[var(--warning)]',
    busy: 'bg-[var(--error)]',
  };

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate color based on name
  const getColorFromName = (name?: string) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    const charCode = name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0);
    return colors[charCode % colors.length];
  };

  const avatarClasses = clsx(
    'relative inline-flex items-center justify-center font-semibold text-white overflow-hidden',
    sizeClasses[size],
    shapeClasses[shape],
    !src && getColorFromName(name),
    className
  );

  return (
    <motion.div
      className={avatarClasses}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}

      {/* Status badge */}
      {badge && (
        <motion.span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            badgeSizeClasses[size],
            badgeColorClasses[badge]
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.div>
  );
};

export default Avatar;

// Avatar Group Component
export interface AvatarGroupProps {
  max?: number;
  size?: AvatarSize;
  className?: string;
  children: React.ReactNode;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max = 5,
  size = 'md',
  className,
  children,
}) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const sizeClasses = {
    xs: '-space-x-2',
    sm: '-space-x-2',
    md: '-space-x-3',
    lg: '-space-x-3',
    xl: '-space-x-4',
    '2xl': '-space-x-5',
  };

  return (
    <div className={clsx('flex items-center', sizeClasses[size], className)}>
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="ring-2 ring-white"
          style={{ zIndex: visibleChildren.length - index }}
        >
          {child}
        </div>
      ))}
      {remainingCount > 0 && (
        <Avatar
          size={size}
          name={`+${remainingCount}`}
          className="ring-2 ring-white bg-gray-600"
        />
      )}
    </div>
  );
};
