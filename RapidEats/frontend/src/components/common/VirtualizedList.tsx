/**
 * Lista virtualizada para performance con muchos items
 */

import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useRef } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScrollEnd?: () => void;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = '',
  onScrollEnd
}: VirtualizedListProps<T>) {
  const listRef = useRef<FixedSizeList>(null);

  const Row = ({ index, style }: ListChildComponentProps) => (
    <div style={style}>
      {renderItem(items[index], index)}
    </div>
  );

  const handleScroll = ({ scrollOffset, scrollUpdateWasRequested }: any) => {
    if (!scrollUpdateWasRequested) {
      const maxScroll = items.length * itemHeight - containerHeight;
      
      if (scrollOffset >= maxScroll - 100 && onScrollEnd) {
        onScrollEnd();
      }
    }
  };

  return (
    <FixedSizeList
      ref={listRef}
      className={className}
      height={containerHeight}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      onScroll={handleScroll}
    >
      {Row}
    </FixedSizeList>
  );
}
