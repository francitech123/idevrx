import { clsx } from 'clsx';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...rest }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={clsx(
        'w-full rounded-input border bg-surface px-3 py-2 text-sm text-text-primary',
        'placeholder:text-text-muted',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-y min-h-[80px]',
        invalid
          ? 'border-error focus:border-error'
          : 'border-border focus:border-brand-primary',
        className
      )}
      {...rest}
    />
  )
);
Textarea.displayName = 'Textarea';
