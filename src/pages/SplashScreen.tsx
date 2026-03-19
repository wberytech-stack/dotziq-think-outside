import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DotziqLogo from '@/components/DotziqLogo';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const dots = [
    { x: 120, y: 120 }, { x: 200, y: 120 }, { x: 280, y: 120 },
    { x: 120, y: 200 }, { x: 200, y: 200 }, { x: 280, y: 200 },
    { x: 120, y: 280 }, { x: 200, y: 280 }, { x: 280, y: 280 },
  ];

  const solutionPath = "M280,120 L120,280 L120,120 L280,280 L280,40";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: '#0F0F1A' }}>

      {/* Skip */}
      <button onClick={() => navigate('/modes')}
        className="absolute top-6 right-6 text-sm font-medium opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: '#F8F7F4' }}>
        Skip
      </button>

      {/* Animated dot grid */}
      <div className="mb-10" style={{ opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <svg width="200" height="200" viewBox="60 60 280 280">
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r="6" fill="#E94560"
              className="dot-pulse"
              style={{
                animationDelay: `${i * 0.12}s`,
                opacity: phase >= 1 ? 1 : 0,
                transition: `opacity 0.4s ease ${i * 0.08}s`,
              }}
            />
          ))}
          {phase >= 2 && (
            <path d={solutionPath} fill="none" stroke="#E94560" strokeWidth="2.5"
              strokeLinecap="round" strokeDasharray="600" className="draw-line" opacity="0.6" />
          )}
        </svg>
      </div>

      {/* Logo */}
      <div style={{ opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.6s ease', color: '#F8F7F4' }}>
        <DotziqLogo size="lg" />
      </div>

      {/* Tagline */}
      <p className="mt-3 text-base font-body tracking-wide"
        style={{ color: '#6B7280', opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}>
        Think Outside. For every mind, every age.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col gap-3 w-full max-w-[280px]"
        style={{ opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.5s ease', transform: phase >= 3 ? 'translateY(0)' : 'translateY(10px)' }}>
        <button onClick={() => navigate('/modes')}
          className="w-full py-3.5 rounded-xl font-display font-semibold text-base transition-transform active:scale-95"
          style={{ background: '#E94560', color: '#fff' }}>
          Start Playing
        </button>
        <button onClick={() => navigate('/puzzles')}
          className="w-full py-3.5 rounded-xl font-display font-semibold text-base border-2 transition-transform active:scale-95"
          style={{ borderColor: '#E94560', color: '#E94560', background: 'transparent' }}>
          How It Works
        </button>
      </div>

      <p className="mt-6 text-xs" style={{ color: '#6B7280' }}>
        Free to play · No account required
      </p>
    </div>
  );
}
