import React from 'react';
import clsx from 'clsx';

export type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'custom';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'circle':
        return 'rounded-full aspect-square';
      case 'rectangle':
        return 'rounded-lg';
      case 'custom':
        return '';
      default:
        return '';
    }
  };

  const baseClasses = clsx(
    'skeleton animate-shimmer bg-gray-200',
    getVariantStyles(),
    className
  );

  const style: React.CSSProperties = {
    width: width || undefined,
    height: height || undefined,
  };

  if (count === 1) {
    return <div className={baseClasses} style={style} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={baseClasses} style={style} />
      ))}
    </div>
  );
};

export default Skeleton;

// Skeleton presets for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('bg-white rounded-lg p-4 shadow-md', className)}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circle" width={48} height={48} />
      <div className="flex-1">
        <Skeleton width="60%" height={20} className="mb-2" />
        <Skeleton width="40%" height={16} />
      </div>
    </div>
    <Skeleton count={3} />
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className,
}) => (
  <div className={clsx('flex flex-col gap-4', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonImage: React.FC<{
  width?: string | number;
  height?: string | number;
  className?: string;
}> = ({ width = '100%', height = 200, className }) => (
  <Skeleton
    variant="rectangle"
    width={width}
    height={height}
    className={className}
  />
);

export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="overflow-hidden rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-6 py-3">
              <Skeleton height={16} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-6 py-4">
                <Skeleton height={16} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
