import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface ContentGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ContentGrid({ children, columns = 3, className }: ContentGridProps) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return (
    <div className={clsx('grid gap-4', cols[columns], className)}>
      {children}
    </div>
  );
}
