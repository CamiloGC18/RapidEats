import React from 'react';
import { motion } from 'framer-motion';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export interface CartItemData {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  options?: Record<string, any>;
  restaurant?: {
    name: string;
    slug: string;
  };
}

export interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  className?: string;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  className,
}) => {
  const { _id, name, price, quantity, image, options } = item;
  const subtotal = price * quantity;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(_id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(_id, quantity + 1);
  };

  const handleRemove = () => {
    onRemove(_id);
  };

  return (
    <motion.div
      className={clsx(
        'flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow',
        className
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      layout
    >
      {/* Thumbnail */}
      {image && (
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <h4 className="font-semibold text-gray-900 mb-1 truncate">{name}</h4>

        {/* Options */}
        {options && Object.keys(options).length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {Object.entries(options).map(([key, value]) => (
              <div key={key} className="truncate">
                {key}: {Array.isArray(value) ? value.map((v: any) => v.name).join(', ') : value.name}
              </div>
            ))}
          </div>
        )}

        {/* Price and Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Picker */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleDecrease}
              className="w-7 h-7 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center font-bold hover:border-[var(--rapid-green)] hover:text-[var(--rapid-green)] transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <MinusIcon className="w-3 h-3" />
            </motion.button>
            
            <span className="w-8 text-center font-semibold text-gray-900">
              {quantity}
            </span>
            
            <motion.button
              onClick={handleIncrease}
              className="w-7 h-7 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center font-bold hover:border-[var(--rapid-green)] hover:text-[var(--rapid-green)] transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <PlusIcon className="w-3 h-3" />
            </motion.button>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-sm text-gray-500">
              ${price.toLocaleString()} c/u
            </div>
            <div className="text-lg font-bold text-[var(--rapid-green)]">
              ${subtotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Remove Button */}
      <motion.button
        onClick={handleRemove}
        className="flex-shrink-0 self-start p-2 text-gray-400 hover:text-[var(--rapid-red)] hover:bg-red-50 rounded-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <TrashIcon className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
};

export default CartItem;
