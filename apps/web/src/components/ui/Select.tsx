import { clsx } from 'clsx';
import { forwardRef, type SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, invalid, children, ...rest }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={clsx(
          'h-10 w-full rounded-input border bg-surface pl-3 pr-9 text-sm text-text-primary',
          'appearance-none',
          'transition-colors duration-150',
          'disabled:cursor-not-allowed disabled:opacity-50',
          invalid
            ? 'border-error focus:border-error'
            : 'border-border focus:border-brand-primary',
          className
        )}
        {...rest}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  )
);
Select.displayName = 'Select';
