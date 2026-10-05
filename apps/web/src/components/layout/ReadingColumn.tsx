import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function ReadingColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('mx-auto w-full max-w-reading px-6 py-12', className)}>
      {children}
    </div>
  );
}
