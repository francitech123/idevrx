import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...rest }, ref) => {
    const inputId = id ?? `switch-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label
        htmlFor={inputId}
        className={clsx(
          'inline-flex items-start gap-3 cursor-pointer select-none',
          rest.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <span className="relative mt-0.5 inline-block h-5 w-9 shrink-0">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-pill bg-muted border border-border-strong transition-colors checked:bg-brand-primary checked:border-brand-primary disabled:cursor-not-allowed"
            {...rest}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-pill bg-surface shadow-sm transition-transform peer-checked:translate-x-4"
          />
        </span>
        {(label || description) && (
          <span className="text-sm">
            {label && <span className="text-text-primary">{label}</span>}
            {description && (
              <span className="block text-xs text-text-muted mt-0.5">{description}</span>
            )}
          </span>
        )}
      </label>
    );
  }
);
Switch.displayName = 'Switch';
