'use client';

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export default function Icon({ name, className = '', filled = false, size }: IconProps) {
  const style: React.CSSProperties = filled
    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
    : {};
  if (size) {
    style.fontSize = `${size}px`;
  }
  return (
    <span className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  );
}
