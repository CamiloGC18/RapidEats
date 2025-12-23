/**
 * Componente de Empty State Premium
 */

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  illustration
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {/* Ilustración o Icono */}
      {illustration ? (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            delay: 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="mb-6"
        >
          {illustration}
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.2,
            type: 'spring',
            stiffness: 200,
            damping: 15
          }}
          className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6"
        >
          <Icon className="w-12 h-12 text-gray-400" />
        </motion.div>
      )}

      {/* Título */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-gray-900 mb-2"
      >
        {title}
      </motion.h3>

      {/* Mensaje */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 max-w-md mb-6"
      >
        {message}
      </motion.p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="px-6 py-3 bg-rapid-green text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};
