import { clsx } from 'clsx';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
  xl: 'h-16 w-16 text-lg',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function Avatar({ src, alt = '', name = '', size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?';
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center shrink-0 rounded-pill overflow-hidden',
        'bg-brand-primary/10 text-brand-primary font-semibold',
        'border border-border',
        sizes[size],
        className
      )}
      aria-label={alt || name}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}
