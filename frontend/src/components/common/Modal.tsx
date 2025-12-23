import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  closeButton?: boolean;
  dismissible?: boolean;
  centered?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeButton = true,
  dismissible = true,
  centered = true,
  className,
  children,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, dismissible, onClose]);

  const modalSizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          as={motion.div}
          static
          open={isOpen}
          onClose={dismissible ? onClose : () => {}}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />

          {/* Full-screen scrollable container */}
          <div className="fixed inset-0 overflow-y-auto">
            <div
              className={clsx(
                'flex min-h-full',
                centered ? 'items-center' : 'items-start pt-20',
                'justify-center p-4'
              )}
            >
              {/* Modal panel */}
              <Dialog.Panel
                as={motion.div}
                className={clsx(
                  'relative w-full rounded-2xl bg-white shadow-2xl',
                  modalSizeClasses[size],
                  size === 'full' && 'overflow-hidden',
                  className
                )}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: window.innerWidth < 768 ? '100%' : 0,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: window.innerWidth < 768 ? '100%' : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                } as any}
              >
                {/* Header */}
                {(title || closeButton) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    {title && (
                      <Dialog.Title className="text-xl font-semibold text-gray-900">
                        {title}
                      </Dialog.Title>
                    )}
                    {closeButton && (
                      <motion.button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--rapid-green)]"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <span className="sr-only">Cerrar</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div
                  className={clsx(
                    'px-6 py-4',
                    size === 'full' && 'h-full overflow-y-auto'
                  )}
                >
                  {children}
                </div>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Modal;

// Modal sub-components for better structure
export const ModalBody: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div className={clsx('text-gray-600', className)}>{children}</div>
);

export const ModalFooter: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => (
  <div
    className={clsx(
      'flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200',
      className
    )}
  >
    {children}
  </div>
);
