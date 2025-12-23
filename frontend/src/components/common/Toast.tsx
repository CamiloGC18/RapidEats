import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
  position?: ToastPosition;
  onClose: (id: string) => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  message,
  description,
  duration = 5000,
  onClose,
  action,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (type === 'loading' || duration === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          onClose(id);
          return 0;
        }
        return prev - (100 / duration) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [id, duration, type, onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-6 h-6 text-[var(--success)]" />,
    error: <XCircleIcon className="w-6 h-6 text-[var(--error)]" />,
    warning: <ExclamationTriangleIcon className="w-6 h-6 text-[var(--warning)]" />,
    info: <InformationCircleIcon className="w-6 h-6 text-[var(--info)]" />,
    loading: (
      <svg
        className="animate-spin h-6 w-6 text-[var(--rapid-green)]"
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
      </svg>
    ),
  };

  const borderColors = {
    success: 'border-l-[var(--success)]',
    error: 'border-l-[var(--error)]',
    warning: 'border-l-[var(--warning)]',
    info: 'border-l-[var(--info)]',
    loading: 'border-l-[var(--rapid-green)]',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={clsx(
        'relative w-full max-w-sm bg-white rounded-lg shadow-xl border-l-4 overflow-hidden',
        borderColors[type]
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{message}</p>
          {description && (
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          )}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                onClose(id);
              }}
              className="mt-2 text-sm font-medium text-[var(--rapid-green)] hover:text-[var(--rapid-green-hover)] transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close button */}
        <motion.button
          onClick={() => onClose(id)}
          className="flex-shrink-0 rounded-lg p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="sr-only">Cerrar</span>
          <XMarkIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Progress bar */}
      {type !== 'loading' && duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[var(--rapid-green)] to-[var(--rapid-green-hover)]"
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

// Toast Container Component
export interface ToastContainerProps {
  toasts: ToastProps[];
  position?: ToastPosition;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  position = 'top-right',
}) => {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={clsx(
        'fixed z-50 flex flex-col gap-3 pointer-events-none',
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toast;

// Hook para usar el sistema de toasts
let toastId = 0;

type ToastStore = {
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
  subscribe: (callback: () => void) => () => void;
  listeners: (() => void)[];
  notify: () => void;
};

const toastStore: ToastStore = {
  toasts: [],
  addToast: (toast) => {
    const id = String(toastId++);
    toastStore.toasts = [
      ...toastStore.toasts,
      { ...toast, id, onClose: toastStore.removeToast },
    ];
    toastStore.notify();
  },
  removeToast: (id) => {
    toastStore.toasts = toastStore.toasts.filter((t) => t.id !== id);
    toastStore.notify();
  },
  subscribe: (callback) => {
    toastStore.listeners.push(callback);
    return () => {
      toastStore.listeners = toastStore.listeners.filter((l) => l !== callback);
    };
  },
  listeners: [] as (() => void)[],
  notify: () => {
    toastStore.listeners.forEach((callback) => callback());
  },
};

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>(toastStore.toasts);

  useEffect(() => {
    return toastStore.subscribe(() => {
      setToasts([...toastStore.toasts]);
    });
  }, []);

  return {
    toasts,
    toast: {
      success: (message: string, description?: string, action?: ToastProps['action']) =>
        toastStore.addToast({ type: 'success', message, description, action, position: 'top-right' }),
      error: (message: string, description?: string, action?: ToastProps['action']) =>
        toastStore.addToast({ type: 'error', message, description, action, position: 'top-right' }),
      warning: (message: string, description?: string, action?: ToastProps['action']) =>
        toastStore.addToast({ type: 'warning', message, description, action, position: 'top-right' }),
      info: (message: string, description?: string, action?: ToastProps['action']) =>
        toastStore.addToast({ type: 'info', message, description, action, position: 'top-right' }),
      loading: (message: string, description?: string) =>
        toastStore.addToast({ type: 'loading', message, description, duration: 0, position: 'top-right' }),
    },
  };
};
