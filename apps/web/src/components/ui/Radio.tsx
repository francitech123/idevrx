import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, ...rest }, ref) => {
    const inputId = id ?? `radio-${Math.random().toString(36).slice(2, 9)}`;
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
          type="radio"
          className={clsx(
            'mt-0.5 h-4 w-4 shrink-0 rounded-pill border border-border-strong bg-surface',
            'appearance-none cursor-pointer',
            'checked:border-brand-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30',
            'disabled:cursor-not-allowed',
            "checked:bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><circle cx='8' cy='8' r='3' fill='%232563EB'/></svg>\")] checked:bg-center checked:bg-no-repeat"
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
Radio.displayName = 'Radio';
