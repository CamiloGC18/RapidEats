import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import Button from '../common/Button';

export type EmptyStateVariant = 'cart' | 'orders' | 'favorites' | 'search' | 'default';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'default',
  title,
  description,
  action,
  icon,
  className,
}) => {
  const variants: Record<EmptyStateVariant, { title: string; description: string; emoji: string }> = {
    cart: {
      title: 'Tu carrito está vacío',
      description: 'Agrega productos de tu restaurante favorito para comenzar tu pedido',
      emoji: '🛒',
    },
    orders: {
      title: 'No tienes pedidos aún',
      description: 'Cuando realices tu primer pedido, lo verás aquí',
      emoji: '📦',
    },
    favorites: {
      title: 'No tienes favoritos',
      description: 'Guarda tus restaurantes favoritos para encontrarlos fácilmente',
      emoji: '❤️',
    },
    search: {
      title: 'No encontramos resultados',
      description: 'Intenta con otros términos de búsqueda o explora nuestras categorías',
      emoji: '🔍',
    },
    default: {
      title: 'No hay nada aquí',
      description: 'Parece que no hay contenido disponible en este momento',
      emoji: '📭',
    },
  };

  const variantData = variants[variant];
  const finalTitle = title || variantData.title;
  const finalDescription = description || variantData.description;
  const finalIcon = icon || variantData.emoji;

  return (
    <motion.div
      className={clsx(
        'flex flex-col items-center justify-center text-center py-16 px-4',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon/Emoji */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
      >
        {typeof finalIcon === 'string' ? (
          <div className="text-8xl">{finalIcon}</div>
        ) : (
          <div className="w-24 h-24 text-gray-300">{finalIcon}</div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {finalTitle}
      </motion.h3>

      {/* Description */}
      <motion.p
        className="text-gray-600 mb-8 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {finalDescription}
      </motion.p>

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
