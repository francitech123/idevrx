import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'rounded-card border border-dashed border-border bg-surface p-10 text-center',
        className
      )}
    >
      {icon && (
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-pill bg-muted text-text-muted mb-4">
          {icon}
        </div>
      )}
      <p className="text-text-primary font-medium mb-1">{title}</p>
      {description && (
        <p className="text-sm text-text-secondary max-w-md mx-auto mb-6">{description}</p>
      )}
      {action && <div className="flex justify-center gap-2">{action}</div>}
    </div>
  );
}
