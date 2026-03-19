import { useNavigate } from 'react-router-dom';
import { Lock, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

const puzzles = [
  {
    id: 'classic', name: 'Classic Nine Dots', icon: '⭐', difficulty: 3,
    desc: "The puzzle that coined 'Think Outside the Box'",
    levels: 50, locked: false,
  },
  {
    id: 'grid16', name: 'Grid Sixteen', icon: '🔷', difficulty: 4,
    desc: 'More dots. More creativity. More wow.',
    levels: 30, locked: true,
  },
  {
    id: 'star', name: 'Star Path', icon: '⭐', difficulty: 5,
    desc: 'Navigate the stars without lifting your pen',
    levels: 20, locked: true,
  },
  {
    id: 'cross', name: 'Cross Out', icon: '✕', difficulty: 5,
    desc: "The minimalist's ultimate challenge",
    levels: 20, locked: true,
  },
];

export default function PuzzlesMenu() {
  const navigate = useNavigate();
  const { userState, setPuzzleType } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Puzzle Types</h1>
        <p className="text-sm text-muted-foreground mt-1">Four categories of lateral thinking challenges</p>
      </div>

      <div className="px-5 grid grid-cols-1 gap-4">
        {puzzles.map(p => (
          <button key={p.id}
            onClick={() => {
              if (!p.locked || userState.isPro) {
                setPuzzleType(p.id as any);
                navigate('/play');
              }
            }}
            className="relative rounded-2xl border border-border bg-card p-5 text-left transition-transform active:scale-[0.98] overflow-hidden"
            disabled={p.locked && !userState.isPro}>
            {p.locked && !userState.isPro && (
              <div className="absolute inset-0 bg-background/70 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-2xl">
                <Lock size={24} className="text-muted-foreground mb-2" />
                <span className="text-sm font-semibold text-accent">Go Pro</span>
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-2xl mr-2">{p.icon}</span>
                <h3 className="inline text-lg font-display font-bold">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < p.difficulty ? 'text-gold fill-gold' : 'text-border'} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{p.levels} levels</span>
            </div>
            {!p.locked && (
              <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-accent" style={{ width: '12%' }} />
              </div>
            )}
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
