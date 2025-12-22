import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
export type DropdownTrigger = 'click' | 'hover';

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger?: DropdownTrigger;
  placement?: DropdownPlacement;
  items: DropdownItem[];
  children: React.ReactNode;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger = 'click',
  placement = 'bottom-start',
  items,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (trigger === 'click' && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, trigger]);

  const handleTriggerClick = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 200);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.();
      setIsOpen(false);
    }
  };

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    'top-start': 'bottom-full left-0 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
  };

  const slideDirection = placement.startsWith('bottom') ? { y: -10 } : { y: 10 };

  return (
    <div
      ref={dropdownRef}
      className={clsx('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {children}
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={clsx(
              'absolute z-50 min-w-[200px] bg-white rounded-lg shadow-xl border border-gray-200 py-1',
              placementClasses[placement]
            )}
            initial={{ opacity: 0, scale: 0.95, ...slideDirection }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, ...slideDirection }}
            transition={{ duration: 0.15 }}
          >
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {item.divider ? (
                  <div className="my-1 border-t border-gray-200" />
                ) : (
                  <motion.button
                    className={clsx(
                      'w-full text-left px-4 py-2.5 text-sm flex items-center gap-3',
                      'transition-colors duration-150',
                      item.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-[var(--rapid-green)]'
                    )}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    whileHover={!item.disabled ? { x: 4 } : undefined}
                    transition={{ duration: 0.15 }}
                  >
                    {item.icon && (
                      <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                    )}
                    <span className="flex-1">{item.label}</span>
                  </motion.button>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dropdown;

// Dropdown with button trigger preset
export const DropdownButton: React.FC<
  Omit<DropdownProps, 'children'> & { label: string; variant?: 'primary' | 'secondary' | 'ghost' }
> = ({ label, variant = 'ghost', ...props }) => {
  const variantClasses = {
    primary: 'bg-[var(--rapid-green)] text-white hover:bg-[var(--rapid-green-hover)]',
    secondary: 'bg-gray-900 text-white hover:bg-gray-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  };

  return (
    <Dropdown {...props}>
      <button
        className={clsx(
          'inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
          variantClasses[variant]
        )}
      >
        <span>{label}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
    </Dropdown>
  );
};
