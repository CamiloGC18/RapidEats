import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Badge from '../common/Badge';

export interface OrderData {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  createdAt: string;
  restaurant: {
    _id: string;
    name: string;
    logo?: string;
    slug: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryFee: number;
  canReorder?: boolean;
  canReview?: boolean;
}

export interface OrderCardProps {
  order: OrderData;
  onReorder?: (orderId: string) => void;
  onReview?: (orderId: string) => void;
  className?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onReorder,
  onReview,
  className,
}) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'warning' as const },
    confirmed: { label: 'Confirmado', color: 'info' as const },
    preparing: { label: 'Preparando', color: 'info' as const },
    on_the_way: { label: 'En camino', color: 'info' as const },
    delivered: { label: 'Entregado', color: 'success' as const },
    cancelled: { label: 'Cancelado', color: 'error' as const },
  };

  const statusInfo = statusConfig[order.status];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderDate = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleViewDetails = () => {
    navigate(`/order/${order._id}`);
  };

  return (
    <motion.div
      className={clsx(
        'bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-3">
          {/* Order Info */}
          <div>
            <div className="text-sm text-gray-500 mb-1">{orderDate}</div>
            <div className="font-semibold text-gray-900">
              Pedido #{order.orderNumber}
            </div>
          </div>

          {/* Status Badge */}
          <Badge variant="soft" color={statusInfo.color} size="md">
            {statusInfo.label}
          </Badge>
        </div>

        {/* Restaurant Info */}
        <div className="flex items-center gap-3">
          {order.restaurant.logo && (
            <img
              src={order.restaurant.logo}
              alt={order.restaurant.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {order.restaurant.name}
            </h3>
            <p className="text-sm text-gray-500">
              {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
            </p>
          </div>
        </div>
      </div>

      {/* Total and Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Total</span>
          <span className="text-xl font-bold text-[var(--rapid-green)]">
            ${order.total.toLocaleString()}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <motion.button
            onClick={handleViewDetails}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Ver detalle
          </motion.button>

          {order.canReorder && onReorder && (
            <motion.button
              onClick={() => onReorder(order._id)}
              className="px-4 py-2 bg-[var(--rapid-green)] text-white rounded-lg font-medium hover:bg-[var(--rapid-green-hover)] transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reordenar
            </motion.button>
          )}

          {order.canReview && onReview && (
            <motion.button
              onClick={() => onReview(order._id)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <StarIcon className="w-4 h-4" />
              Calificar
            </motion.button>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? (
            <>
              Ocultar items
              <ChevronUpIcon className="w-4 h-4" />
            </>
          ) : (
            <>
              Ver items
              <ChevronDownIcon className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>

      {/* Expanded Items List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Artículos del pedido
              </h4>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{item.quantity}x</span>
                      <span className="text-gray-900">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotals */}
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${(order.total - order.deliveryFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>${order.deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-[var(--rapid-green)]">
                    ${order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCard;
