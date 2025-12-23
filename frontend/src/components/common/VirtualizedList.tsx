/**
 * Lista virtualizada para performance con muchos items
 */

import { List } from 'react-window';
import { useRef } from 'react';
import type { RowComponentProps, ListImperativeAPI } from 'react-window';

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
  const listRef = useRef<ListImperativeAPI>(null);

  const Row = ({ index, style }: RowComponentProps) => (
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
    <List
      listRef={listRef}
      className={className}
      defaultHeight={containerHeight}
      rowCount={items.length}
      rowHeight={itemHeight}
      rowComponent={Row}
      rowProps={{}}
      style={{ width: '100%' }}
      onScroll={handleScroll}
    />
  );
}
