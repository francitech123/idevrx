import { clsx } from 'clsx';
import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'avatar' | 'line';
  width?: string;
  height?: string;
}

export function Skeleton({
  variant = 'line',
  className,
  width,
  height,
  ...rest
}: SkeletonProps) {
  const base = 'animate-pulse bg-muted rounded';
  const variants = {
    text: 'h-4 w-full rounded',
    line: 'h-3 w-full rounded',
    card: 'h-40 w-full rounded-card',
    avatar: 'h-10 w-10 rounded-pill',
  };
  return (
    <div
      className={clsx(base, variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
      {...rest}
    />
  );
}
