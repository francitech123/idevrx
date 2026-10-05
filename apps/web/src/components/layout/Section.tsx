import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Section({ title, description, actions, children, className }: SectionProps) {
  return (
    <section className={clsx('py-8 border-t border-border first:border-t-0 first:pt-0', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            {title && <h2 className="text-lg font-semibold text-text-primary">{title}</h2>}
            {description && (
              <p className="text-sm text-text-secondary mt-1 max-w-2xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
