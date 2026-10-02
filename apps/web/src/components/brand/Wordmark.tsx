import { LogoMark } from './LogoMark';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 20, text: 'text-base' },
  md: { icon: 26, text: 'text-lg' },
  lg: { icon: 34, text: 'text-2xl' },
};

export function Wordmark({ size = 'md', className }: WordmarkProps) {
  const s = sizeMap[size];
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <LogoMark size={s.icon} />
      <span
        className={`font-bold ${s.text} text-text-primary`}
        style={{ letterSpacing: '-0.02em' }}
      >
        IDEVRX
      </span>
    </span>
  );
}
