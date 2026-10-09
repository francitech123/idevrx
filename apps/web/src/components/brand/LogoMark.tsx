interface LogoMarkProps {
  size?: number;
  className?: string;
  color?: string;
}

export function LogoMark({ size = 32, className, color }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 3 L45 15 L45 33 L24 45 L3 33 L3 15 Z"
        fill={color ?? 'currentColor'}
      />
      <path
        d="M14 14 L34 34 M34 14 L14 34"
        stroke="var(--color-paper)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="24" r="2.5" fill="var(--color-paper)" />
    </svg>
  );
}
