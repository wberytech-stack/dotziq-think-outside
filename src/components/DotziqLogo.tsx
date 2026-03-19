export default function DotziqLogo({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 48 : 28;
  const dotR = size === 'lg' ? 2.5 : 1.5;
  const gap = size === 'lg' ? 8 : 5;
  const offset = size === 'lg' ? 14 : 8;

  return (
    <span className="inline-flex items-center gap-1 font-display font-bold tracking-tight">
      <span className="relative inline-block" style={{ width: s * 0.6, height: s }}>
        <svg viewBox="0 0 30 48" width={s * 0.6} height={s} className="text-accent">
          {/* D shape */}
          <path d="M6 6 L6 42 L18 42 Q28 42 28 30 L28 18 Q28 6 18 6 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          {/* 3x3 dot grid inside D */}
          {[0, 1, 2].map(row =>
            [0, 1, 2].map(col => (
              <circle
                key={`${row}-${col}`}
                cx={offset + col * gap}
                cy={16 + row * gap}
                r={dotR}
                fill="currentColor"
                className="dot-pulse"
                style={{ animationDelay: `${(row * 3 + col) * 0.15}s` }}
              />
            ))
          )}
        </svg>
      </span>
      <span className={size === 'lg' ? 'text-4xl' : 'text-xl'}>
        <span className="text-accent">D</span>otziq
      </span>
    </span>
  );
}
