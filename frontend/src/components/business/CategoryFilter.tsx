import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export interface Category {
  id: string;
  name: string;
  count?: number;
  icon?: string;
}

export interface CategoryFilterProps {
  categories: Category[];
  activeCategory?: string;
  onCategoryChange: (categoryId: string) => void;
  showCount?: boolean;
  className?: string;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  showCount = false,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // Add "Todos" as first category
  const allCategories: Category[] = [
    { id: 'all', name: 'Todos', count: categories.reduce((sum, cat) => sum + (cat.count || 0), 0) },
    ...categories,
  ];

  return (
    <div className={clsx('relative', className)}>
      {/* Scroll Buttons (Desktop) */}
      <div className="hidden md:block">
        <motion.button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-lg transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </motion.button>

        <motion.button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 hover:shadow-lg transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronRightIcon className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allCategories.map((category) => {
          const isActive = activeCategory === category.id || (category.id === 'all' && !activeCategory);

          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={clsx(
                'flex-shrink-0 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-250',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--rapid-green)]',
                isActive
                  ? 'bg-[var(--rapid-green)] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
                {showCount && category.count !== undefined && (
                  <span
                    className={clsx(
                      'ml-1 px-1.5 py-0.5 rounded-full text-xs font-semibold',
                      isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {category.count}
                  </span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Fade Gradients */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
};

export default CategoryFilter;
