import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Badge from '../common/Badge';
import Skeleton from '../common/Skeleton';

export interface Restaurant {
  _id: string;
  slug: string;
  name: string;
  logo?: string;
  coverImage?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  minOrder?: number;
  cuisineType?: string[];
  isOpen?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  hasFreeDelivery?: boolean;
  distance?: number;
}

export interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, className }) => {
  const navigate = useNavigate();

  const {
    slug,
    name,
    logo,
    coverImage,
    rating = 0,
    reviewCount = 0,
    deliveryTime = '30-45 min',
    deliveryFee = 0,
    cuisineType = [],
    isOpen = true,
    isFeatured = false,
    isNew = false,
    hasFreeDelivery = false,
    distance,
  } = restaurant;

  const handleClick = () => {
    navigate(`/restaurant/${slug}`);
  };

  return (
    <motion.div
      className={clsx(
        'relative bg-white rounded-xl overflow-hidden shadow-md cursor-pointer',
        'transition-all duration-250',
        'hover:shadow-xl',
        !isOpen && 'opacity-75',
        className
      )}
      onClick={handleClick}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">🍽️</span>
          </div>
        )}

        {/* Overlay when closed */}
        {!isOpen && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-lg font-semibold">Cerrado</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isFeatured && (
            <Badge variant="solid" color="green" size="sm">
              Destacado
            </Badge>
          )}
          {isNew && (
            <Badge variant="solid" color="info" size="sm">
              Nuevo
            </Badge>
          )}
          {hasFreeDelivery && (
            <Badge variant="solid" color="success" size="sm">
              Envío Gratis
            </Badge>
          )}
        </div>

        {/* Logo */}
        {logo && (
          <motion.div
            className="absolute -bottom-6 left-4 w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          >
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        {/* Restaurant Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{name}</h3>

        {/* Cuisine Type */}
        {cuisineType.length > 0 && (
          <p className="text-sm text-gray-500 mb-3 truncate">
            {cuisineType.join(' • ')}
          </p>
        )}

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <StarIcon className="w-5 h-5 text-[var(--warning)]" />
            <span className="font-semibold text-gray-900">
              {rating.toFixed(1)}
            </span>
            <span className="text-gray-500">({reviewCount})</span>
          </div>

          {/* Delivery Time */}
          <div className="flex items-center gap-1 text-gray-600">
            <ClockIcon className="w-4 h-4" />
            <span>{deliveryTime}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {/* Delivery Fee */}
          <div className="text-sm">
            <span className="text-gray-500">Envío: </span>
            <span className="font-semibold text-[var(--rapid-green)]">
              {deliveryFee === 0 ? 'Gratis' : `$${deliveryFee.toLocaleString()}`}
            </span>
          </div>

          {/* Distance */}
          {distance !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 hover:from-black/5 hover:to-transparent transition-all duration-250 pointer-events-none" />
    </motion.div>
  );
};

export default RestaurantCard;

// Loading Skeleton for RestaurantCard
export const RestaurantCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-xl overflow-hidden shadow-md', className)}>
    {/* Cover Image Skeleton */}
    <Skeleton variant="rectangle" height={192} />

    {/* Content */}
    <div className="p-4 pt-8">
      <Skeleton height={24} width="70%" className="mb-2" />
      <Skeleton height={16} width="50%" className="mb-3" />

      <div className="flex items-center justify-between mb-3">
        <Skeleton height={20} width={100} />
        <Skeleton height={20} width={80} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton height={16} width={80} />
        <Skeleton height={16} width={60} />
      </div>
    </div>
  </div>
);
