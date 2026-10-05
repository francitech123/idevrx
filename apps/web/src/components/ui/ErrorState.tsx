import { clsx } from 'clsx';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  retrying?: boolean;
  action?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not complete this action.',
  details,
  onRetry,
  retrying,
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={clsx(
        'rounded-card border border-error/40 bg-error/5 p-6 text-center',
        className
      )}
      role="alert"
    >
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-pill bg-error/10 text-error mb-3">
        <AlertCircle size={20} />
      </div>
      <p className="text-text-primary font-medium mb-1">{title}</p>
      <p className="text-sm text-text-secondary mb-4">{message}</p>
      {details && (
        <p className="text-xs text-text-muted font-mono mb-4 break-all">{details}</p>
      )}
      <div className="flex justify-center gap-2">
        {onRetry && (
          <Button variant="secondary" size="md" onClick={onRetry} loading={retrying}>
            <RefreshCw size={14} />
            Try again
          </Button>
        )}
        {action}
      </div>
    </div>
  );
}
