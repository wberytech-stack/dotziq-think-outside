import { useNavigate } from 'react-router-dom';
import { useApp, GameMode } from '@/context/AppContext';
import { Star, Lightbulb, Diamond } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import DotziqLogo from '@/components/DotziqLogo';

const modes: { mode: GameMode; label: string; sub: string; icon: typeof Star; gradient: string; textColor: string }[] = [
  {
    mode: 'kids', label: 'Explorer Mode', sub: 'Grade 1–6 · Colorful · Encouraging',
    icon: Star, gradient: 'from-amber-400 to-orange-500', textColor: 'text-amber-950',
  },
  {
    mode: 'student', label: 'Challenger Mode', sub: 'Grade 7–10 · Focused · Timed',
    icon: Lightbulb, gradient: 'from-sky-400 to-teal-500', textColor: 'text-sky-950',
  },
  {
    mode: 'pro', label: 'Pro Mode', sub: 'Adults · Minimal · Deep',
    icon: Diamond, gradient: 'from-slate-800 to-slate-950', textColor: 'text-slate-100',
  },
];

export default function ModeSelector() {
  const navigate = useNavigate();
  const { setMode } = useApp();

  const handleSelect = (mode: GameMode) => {
    setMode(mode);
    navigate('/puzzles');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-8 pb-4">
        <DotziqLogo size="sm" />
        <h1 className="text-2xl font-display font-bold mt-6">Choose Your Mode</h1>
        <p className="text-sm text-muted-foreground mt-1">Each mode adapts difficulty, visuals, and pacing.</p>
      </div>

      <div className="px-5 flex flex-col gap-4">
        {modes.map(({ mode, label, sub, icon: Icon, gradient, textColor }) => (
          <button key={mode} onClick={() => handleSelect(mode)}
            className={`relative rounded-2xl p-6 text-left bg-gradient-to-br ${gradient} ${textColor} shadow-lg transition-transform active:scale-[0.98] overflow-hidden`}>
            <div className="absolute top-4 right-4 opacity-20">
              <Icon size={56} />
            </div>
            <Icon size={28} className="mb-3" />
            <h2 className="text-xl font-display font-bold">{label}</h2>
            <p className="text-sm opacity-80 mt-1">{sub}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold opacity-90">
              Play →
            </div>
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
