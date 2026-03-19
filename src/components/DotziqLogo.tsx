export default function DotziqLogo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const iconSize = size === 'lg' ? 28 : 20;
  const fontSize = size === 'lg' ? 32 : 20;

  return (
    <span className="inline-flex items-center gap-2 font-display font-bold tracking-tight">
      {/* Icon: rounded square with 4 connected dots */}
      <svg width={iconSize} height={iconSize} viewBox="0 0 28 28" fill="none">
        <rect x="0.5" y="0.5" width="27" height="27" rx="6" fill="#1A1A2E" />
        {/* Connecting lines */}
        <line x1="7" y1="7" x2="21" y2="7" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="7" x2="21" y2="21" stroke="#0FD688" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="21" x2="7" y2="21" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="7" y1="21" x2="7" y2="7" stroke="#E94560" strokeWidth="1.5" strokeLinecap="round" />
        {/* Diagonal lines */}
        <line x1="7" y1="7" x2="21" y2="21" stroke="#7C3AED" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        <line x1="21" y1="7" x2="7" y2="21" stroke="#7C3AED" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        {/* Corner dots */}
        <circle cx="7" cy="7" r="3" fill="#E94560" />
        <circle cx="21" cy="7" r="3" fill="#F5A623" />
        <circle cx="7" cy="21" r="3" fill="#3B82F6" />
        <circle cx="21" cy="21" r="3" fill="#0FD688" />
      </svg>
      {/* Text */}
      <span style={{ fontSize, lineHeight: 1 }}>
        <span style={{ color: '#1A1A2E' }}>Dotz</span>
        <span style={{ color: '#E94560' }}>IQ</span>
      </span>
    </span>
  );
}
