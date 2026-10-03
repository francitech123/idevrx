interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className }: LogoMarkProps) {
  // Original SVG aspect ratio: 265 × 370
  const width = size;
  const height = Math.round((size * 370) / 265);

  return (
    <img
      src="/brand/idevrx-mark.svg"
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      className={className}
      style={{ display: 'block' }}
    />
  );
}
