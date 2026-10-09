import { LogoMark } from './LogoMark';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showName?: boolean;
}

const sizeMap = {
  sm: { icon: 26, text: 'text-lg', gap: 'gap-2' },
  md: { icon: 34, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 48, text: 'text-3xl', gap: 'gap-3' },
};

export function Wordmark({ size = 'md', className, showName = true }: WordmarkProps) {
  const s = sizeMap[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className ?? ''}`}>
      <LogoMark size={s.icon} />
      {showName && (
        <span
          className={`font-display ${s.text}`}
          style={{ letterSpacing: '-0.02em', fontWeight: 500 }}
        >
          IDEVRX
        </span>
      )}
    </span>
  );
}
