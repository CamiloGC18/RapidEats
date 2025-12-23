import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import Badge from '../common/Badge';
import Modal, { ModalBody, ModalFooter } from '../common/Modal';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';

export interface MenuItem {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isGlutenFree?: boolean;
  isPopular?: boolean;
  discount?: number;
  options?: MenuItemOption[];
}

export interface MenuItemOption {
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  choices: {
    name: string;
    price: number;
  }[];
}

export interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, options?: any, quantity?: number) => void;
  className?: string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart, className }) => {
  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});

  const {
    name,
    description,
    price,
    image,
    isAvailable = true,
    isVegetarian = false,
    isSpicy = false,
    isGlutenFree = false,
    isPopular = false,
    discount = 0,
    options = [],
  } = item;

  const finalPrice = discount > 0 ? price - (price * discount) / 100 : price;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (options.length > 0) {
      setShowModal(true);
    } else {
      onAddToCart(item, {}, 1);
    }
  };

  const handleConfirmAdd = () => {
    onAddToCart(item, selectedOptions, quantity);
    setShowModal(false);
    setQuantity(1);
    setSelectedOptions({});
  };

  return (
    <>
      <motion.div
        className={clsx(
          'relative bg-white rounded-lg overflow-hidden transition-all duration-250',
          'hover:shadow-lg',
          !isAvailable && 'opacity-50',
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={isAvailable ? { scale: 1.01 } : undefined}
      >
        <div className="flex gap-4 p-4">
          {/* Content - 70% */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-1 mb-2">
              {isPopular && (
                <Badge variant="soft" color="warning" size="sm">
                  🔥 Popular
                </Badge>
              )}
              {isVegetarian && (
                <Badge variant="soft" color="success" size="sm">
                  🌱 Vegetariano
                </Badge>
              )}
              {isSpicy && (
                <Badge variant="soft" color="error" size="sm">
                  🌶️ Picante
                </Badge>
              )}
              {isGlutenFree && (
                <Badge variant="soft" color="info" size="sm">
                  Sin Gluten
                </Badge>
              )}
            </div>

            {/* Name */}
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">
              {name}
            </h3>

            {/* Description */}
            {description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
            )}

            {/* Price and Add Button */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                {discount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ${price.toLocaleString()}
                  </span>
                )}
                <span className="text-lg font-bold text-[var(--rapid-green)]">
                  ${finalPrice.toLocaleString()}
                </span>
                {discount > 0 && (
                  <Badge variant="solid" color="error" size="sm">
                    -{discount}%
                  </Badge>
                )}
              </div>

              {isAvailable && (
                <motion.button
                  onClick={handleAddClick}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--rapid-green)] text-white shadow-md hover:bg-[var(--rapid-green-hover)] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <PlusIcon className="w-5 h-5" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Image - 30% */}
          {image && (
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">No disponible</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Customization Modal */}
      <AnimatePresence>
        {showModal && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title={`Personaliza tu ${name}`}
            size="md"
          >
            <ModalBody>
              {/* Item Image and Info */}
              <div className="flex gap-4 mb-6">
                {image && (
                  <img
                    src={image}
                    alt={name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h4 className="font-semibold text-lg">{name}</h4>
                  {description && (
                    <p className="text-sm text-gray-600 mt-1">{description}</p>
                  )}
                  <p className="text-lg font-bold text-[var(--rapid-green)] mt-2">
                    ${finalPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Options */}
              {options.map((option, index) => (
                <div key={index} className="mb-6">
                  <h5 className="font-semibold mb-2">
                    {option.name}
                    {option.required && (
                      <span className="text-[var(--rapid-red)] ml-1">*</span>
                    )}
                  </h5>
                  <div className="space-y-2">
                    {option.choices.map((choice, choiceIndex) => (
                      <label
                        key={choiceIndex}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type={option.type === 'single' ? 'radio' : 'checkbox'}
                            name={option.name}
                            className="w-4 h-4 text-[var(--rapid-green)] focus:ring-[var(--rapid-green)]"
                            onChange={(e) => {
                              if (option.type === 'single') {
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [option.name]: choice,
                                });
                              } else {
                                const current = selectedOptions[option.name] || [];
                                setSelectedOptions({
                                  ...selectedOptions,
                                  [option.name]: e.target.checked
                                    ? [...current, choice]
                                    : current.filter((c: any) => c.name !== choice.name),
                                });
                              }
                            }}
                          />
                          <span className="text-sm">{choice.name}</span>
                        </div>
                        {choice.price > 0 && (
                          <span className="text-sm text-gray-600">
                            +${choice.price.toLocaleString()}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-semibold">Cantidad</span>
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border-2 border-[var(--rapid-green)] text-[var(--rapid-green)] flex items-center justify-center font-bold hover:bg-[var(--rapid-green)] hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    −
                  </motion.button>
                  <span className="w-8 text-center font-semibold">{quantity}</span>
                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border-2 border-[var(--rapid-green)] text-[var(--rapid-green)] flex items-center justify-center font-bold hover:bg-[var(--rapid-green)] hover:text-white transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleConfirmAdd}>
                Agregar al carrito - ${(finalPrice * quantity).toLocaleString()}
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
};

export default MenuItemCard;

// Loading Skeleton for MenuItemCard
export const MenuItemCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-lg overflow-hidden', className)}>
    <div className="flex gap-4 p-4">
      <div className="flex-1">
        <Skeleton height={20} width="60%" className="mb-2" />
        <Skeleton height={16} width="90%" className="mb-1" />
        <Skeleton height={16} width="80%" className="mb-3" />
        <Skeleton height={24} width={100} />
      </div>
      <Skeleton variant="rectangle" width={96} height={96} />
    </div>
  </div>
);
