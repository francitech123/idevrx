interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  return (
    <img
      src="/brand/idevrx-mark.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}
