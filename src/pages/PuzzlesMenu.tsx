import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Star, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import { getModeChallenges, PUZZLES_PER_MODE } from '@/lib/puzzleConfigs';

const MODE_LABELS: Record<string, string> = {
  kids: 'Explorer Mode',
  student: 'Challenger Mode',
  pro: 'Pro Mode',
};

const MODE_DESCRIPTIONS: Record<string, string> = {
  kids: 'Varied dot patterns — stars, shapes, and more!',
  student: 'Classic 9-dot grid with increasing constraints',
  pro: 'Expanding grids from 3×3 to 5×5',
};

const MODE_THEME: Record<string, { bg: string; text: string; accent: string; card: string; border: string; selectedBg: string; completedBg: string; lockedBg: string }> = {
  kids: {
    bg: 'bg-[#FFFBF0]', text: 'text-[#3D2B1F]', accent: 'text-orange-600',
    card: 'bg-white', border: 'border-orange-100',
    selectedBg: 'bg-orange-500 text-white', completedBg: 'bg-orange-100 text-orange-700',
    lockedBg: 'bg-orange-50 text-orange-300',
  },
  student: {
    bg: 'bg-white', text: 'text-foreground', accent: 'text-sky-600',
    card: 'bg-white', border: 'border-sky-100',
    selectedBg: 'bg-sky-500 text-white', completedBg: 'bg-sky-100 text-sky-700',
    lockedBg: 'bg-sky-50 text-sky-300',
  },
  pro: {
    bg: 'bg-[#0F0F1A]', text: 'text-slate-100', accent: 'text-red-400',
    card: 'bg-[#1A1A2E]', border: 'border-slate-700',
    selectedBg: 'bg-red-500 text-white', completedBg: 'bg-red-900/40 text-red-400',
    lockedBg: 'bg-slate-800 text-slate-600',
  },
};

const DIFF_DOT: Record<string, string> = {
  easy: 'bg-emerald-400',
  medium: 'bg-amber-400',
  hard: 'bg-red-400',
};

export default function PuzzlesMenu() {
  const navigate = useNavigate();
  const { gameState, userState, setPuzzleIndex } = useApp();
  const mode = gameState.selectedMode;
  const theme = MODE_THEME[mode] || MODE_THEME.student;
  const challenges = getModeChallenges(mode);

  // For now, all levels are unlocked (could gate by completion later)
  const currentLevel = gameState.currentPuzzleIndex;

  const handleSelectLevel = (index: number) => {
    setPuzzleIndex(index);
    navigate('/play');
  };

  return (
    <div className={`min-h-screen pb-24 ${theme.bg} ${theme.text}`}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/modes')}
            className="p-2 -ml-2 rounded-xl hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-display font-bold">{MODE_LABELS[mode]}</h1>
            <p className={`text-sm mt-0.5 ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
              {MODE_DESCRIPTIONS[mode]}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`rounded-full h-2 ${mode === 'pro' ? 'bg-slate-800' : 'bg-secondary'} overflow-hidden`}>
          <div className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(userState.totalSolved / PUZZLES_PER_MODE) * 100}%` }} />
        </div>
        <p className={`text-xs mt-1.5 ${mode === 'pro' ? 'text-slate-500' : 'text-muted-foreground'}`}>
          {PUZZLES_PER_MODE} levels · {userState.xp} XP earned
        </p>
      </div>

      {/* Level grid */}
      <div className="px-5 grid grid-cols-5 gap-2.5">
        {challenges.map((ch, i) => {
          const isCurrent = i === currentLevel;
          const isCompleted = i < currentLevel; // simple sequential assumption

          return (
            <button
              key={ch.id}
              onClick={() => {
                // Set the puzzle index in context and go
                navigate('/play');
              }}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-display font-bold transition-all active:scale-95 border ${
                isCurrent
                  ? `${theme.selectedBg} border-transparent shadow-lg scale-105`
                  : isCompleted
                  ? `${theme.completedBg} ${theme.border}`
                  : `${theme.card} ${theme.border}`
              }`}
            >
              {isCompleted && (
                <Check size={10} className="absolute top-1 right-1 opacity-50" />
              )}
              <span className={isCurrent ? 'text-lg' : ''}>{i + 1}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${DIFF_DOT[ch.difficulty]}`} />
            </button>
          );
        })}
      </div>

      {/* Current level preview */}
      <div className="px-5 mt-6">
        <div className={`rounded-2xl border ${theme.border} ${theme.card} p-4`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className={`text-xs font-semibold ${theme.accent}`}>Level {currentLevel + 1}</span>
              <h3 className="font-display font-bold text-lg">{challenges[currentLevel]?.title}</h3>
            </div>
            <div className="flex gap-3 text-center">
              <div>
                <p className="text-lg font-bold">{challenges[currentLevel]?.dotCount}</p>
                <p className={`text-[10px] ${mode === 'pro' ? 'text-slate-500' : 'text-muted-foreground'}`}>Dots</p>
              </div>
              <div>
                <p className="text-lg font-bold">{challenges[currentLevel]?.config.maxLines}</p>
                <p className={`text-[10px] ${mode === 'pro' ? 'text-slate-500' : 'text-muted-foreground'}`}>Lines</p>
              </div>
            </div>
          </div>
          <p className={`text-sm mb-3 ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            {challenges[currentLevel]?.description}
          </p>
          {challenges[currentLevel]?.rules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {challenges[currentLevel]?.rules.map((rule, i) => (
                <span key={i} className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                  mode === 'pro' ? 'bg-slate-800 text-slate-300' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {rule}
                </span>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/play')}
            className="w-full py-3 rounded-xl font-display font-bold bg-accent text-accent-foreground transition-transform active:scale-95">
            Play Level {currentLevel + 1}
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
