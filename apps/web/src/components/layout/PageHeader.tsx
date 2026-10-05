import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-6 mb-8', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-mono text-brand-primary mb-2">{eyebrow}</div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">{title}</h1>
        {description && (
          <p className="text-text-secondary max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
