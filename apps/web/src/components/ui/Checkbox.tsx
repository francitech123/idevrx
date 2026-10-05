import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...rest }, ref) => {
    const inputId = id ?? `checkbox-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <label
        htmlFor={inputId}
        className={clsx(
          'inline-flex items-start gap-2 cursor-pointer select-none',
          rest.disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={clsx(
            'mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-border-strong bg-surface',
            'appearance-none cursor-pointer',
            'checked:bg-brand-primary checked:border-brand-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30',
            'disabled:cursor-not-allowed',
            "checked:bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'><path d='M3.5 8.5L6.5 11.5L12.5 4.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")] checked:bg-center checked:bg-no-repeat"
          )}
          {...rest}
        />
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
Checkbox.displayName = 'Checkbox';
