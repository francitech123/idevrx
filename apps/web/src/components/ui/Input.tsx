import { clsx } from 'clsx';
import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, ...rest }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'h-10 w-full rounded-input border bg-surface px-3 text-sm text-text-primary',
        'placeholder:text-text-muted',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid ? 'border-error focus:border-error' : 'border-border focus:border-brand-primary',
        className
      )}
      {...rest}
    />
  )
);
Input.displayName = 'Input';
