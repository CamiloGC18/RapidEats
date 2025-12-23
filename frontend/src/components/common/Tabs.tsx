import React, { useState } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export type TabsVariant = 'line' | 'pill' | 'enclosed';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
  variant?: TabsVariant;
  fullWidth?: boolean;
  onChange?: (index: number) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultIndex = 0,
  variant = 'line',
  fullWidth = false,
  onChange,
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleTabClick = (index: number) => {
    if (tabs[index].disabled) return;
    setActiveIndex(index);
    onChange?.(index);
  };

  const tabClasses = (index: number, isActive: boolean, isDisabled?: boolean) => {
    const baseClasses = clsx(
      'relative px-4 py-2.5 text-sm font-medium transition-all duration-250 cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--rapid-green)]',
      fullWidth && 'flex-1 text-center'
    );

    if (isDisabled) {
      return clsx(baseClasses, 'opacity-40 cursor-not-allowed');
    }

    const variantClasses = {
      line: clsx(
        'border-b-2',
        isActive
          ? 'text-[var(--rapid-green)] border-[var(--rapid-green)]'
          : 'text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-300'
      ),
      pill: clsx(
        'rounded-full',
        isActive
          ? 'bg-[var(--rapid-green)] text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      ),
      enclosed: clsx(
        'border border-gray-200 -mb-px',
        isActive
          ? 'bg-white border-b-white z-10'
          : 'bg-gray-50 hover:bg-gray-100',
        index === 0 ? 'rounded-tl-lg' : '',
        index === tabs.length - 1 ? 'rounded-tr-lg' : '-ml-px'
      ),
    };

    return clsx(baseClasses, variantClasses[variant]);
  };

  return (
    <div className={clsx('w-full', className)}>
      {/* Tab List */}
      <div
        className={clsx(
          'flex',
          variant === 'line' && 'border-b border-gray-200 overflow-x-auto scrollbar-hide',
          variant === 'pill' && 'gap-2 p-1 bg-gray-100 rounded-full',
          variant === 'enclosed' && 'border-b border-gray-200'
        )}
        role="tablist"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeIndex === index ? 0 : -1}
            className={tabClasses(index, activeIndex === index, tab.disabled)}
            onClick={() => handleTabClick(index)}
            disabled={tab.disabled}
          >
            {tab.label}
            
            {/* Sliding indicator for line variant */}
            {variant === 'line' && activeIndex === index && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--rapid-green)]"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">
        {tabs.map((tab, index) => (
          <motion.div
            key={tab.id}
            role="tabpanel"
            id={`panel-${tab.id}`}
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeIndex !== index}
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: activeIndex === index ? 1 : 0,
              y: activeIndex === index ? 0 : 10,
            }}
            transition={{ duration: 0.2 }}
          >
            {activeIndex === index && tab.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Tabs;
