import { clsx } from 'clsx';
import { X } from 'lucide-react';
import type { HTMLAttributes } from 'react';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
  variant?: 'default' | 'brand';
}

export function Tag({ className, children, onRemove, variant = 'default', ...rest }: TagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-button border px-2 py-0.5 text-xs font-medium',
        variant === 'brand'
          ? 'border-brand-primary/30 text-brand-primary bg-brand-primary/5'
          : 'border-border text-text-secondary bg-surface',
        className
      )}
      {...rest}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 opacity-60 hover:opacity-100"
          aria-label="Remove tag"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
