interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoMarkProps) {
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
      <defs>
        <linearGradient id="idevrx-mark-gradient" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="55%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>

      {/* Outer isometric diamond */}
      <path
        d="M24 3 L45 15 L45 33 L24 45 L3 33 L3 15 Z"
        fill="url(#idevrx-mark-gradient)"
        fillOpacity="0.14"
        stroke="url(#idevrx-mark-gradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner X — the "X" of IDEVRX */}
      <path
        d="M14 14 L34 34 M34 14 L14 34"
        stroke="url(#idevrx-mark-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Center dot */}
      <circle cx="24" cy="24" r="2.5" fill="url(#idevrx-mark-gradient)" />
    </svg>
  );
}
