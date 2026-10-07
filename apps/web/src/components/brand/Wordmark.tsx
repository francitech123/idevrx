import { LogoMark } from './LogoMark';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { icon: 28, text: 'text-lg', gap: 'gap-2' },
  md: { icon: 40, text: 'text-2xl', gap: 'gap-2.5' },
  lg: { icon: 52, text: 'text-3xl', gap: 'gap-3' },
};

export function Wordmark({ size = 'md', className }: WordmarkProps) {
  const s = sizeMap[size];
  return (
    <span className={`inline-flex items-center ${s.gap} ${className ?? ''}`}>
      <LogoMark size={s.icon} />
      <span
        className={`font-bold ${s.text} text-text-primary`}
        style={{ letterSpacing: '-0.03em' }}
      >
        IDEVRX
      </span>
    </span>
  );
}
