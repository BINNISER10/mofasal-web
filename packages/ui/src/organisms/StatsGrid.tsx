import React from 'react';
import { cn } from '../lib/utils';
import { DataCard, DataCardProps } from '../molecules/DataCard';

export interface StatsGridItem extends DataCardProps {}

export interface StatsGridProps {
  items: StatsGridItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const gridCols: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export const StatsGrid: React.FC<StatsGridProps> = ({
  items,
  columns = 3,
  className,
}) => {
  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {items.map((item, index) => (
        <DataCard key={index} {...item} />
      ))}
    </div>
  );
};
