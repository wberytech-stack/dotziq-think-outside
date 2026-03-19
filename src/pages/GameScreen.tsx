import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Flame, Share2, Trophy, Home, HelpCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PuzzleCanvas from '@/components/PuzzleCanvas';
import DotziqLogo from '@/components/DotziqLogo';
import BottomNav from '@/components/BottomNav';
import { getPuzzleConfig } from '@/lib/puzzleConfigs';

const LINE_COLORS = ['#E94560', '#F5A623', '#0FD688', '#7C3AED', '#3B82F6'];

interface Point { x: number; y: number; }

// Mode-specific theme configs
const MODE_THEMES = {
  kids: {
    bg: 'bg-[#FFFBF0]',
    textColor: 'text-[#3D2B1F]',
    dotColor: '#FF6B35',
    showTimer: false,
    encouragement: 'Amazing job! You are a star! ⭐🎉',
    fontSize: 'text-lg',
    hintStyle: 'prominent' as const,
    difficultyLabel: 'Easy',
    cardBg: 'bg-[#FFFBF0]',
    borderColor: 'border-orange-200',
  },
  student: {
    bg: 'bg-white',
    textColor: 'text-foreground',
    dotColor: '#3B82F6',
    showTimer: true,
    encouragement: 'Solved!',
    fontSize: 'text-base',
    hintStyle: 'subtle' as const,
    difficultyLabel: 'Medium',
    cardBg: 'bg-white',
    borderColor: 'border-border',
  },
  pro: {
    bg: 'bg-[#0F0F1A]',
    textColor: 'text-slate-100',
    dotColor: '#E94560',
    showTimer: true,
    encouragement: '',
    fontSize: 'text-base',
    hintStyle: 'minimal' as const,
    difficultyLabel: 'Hard',
    cardBg: 'bg-[#1A1A2E]',
    borderColor: 'border-slate-700',
  },
};

export default function GameScreen() {
  const navigate = useNavigate();
  const { gameState, userState, useHint, completeLevel, resetPuzzle,
    startTimer, incrementTimer, incrementAttempts, resetTimer } = useApp();

  const mode = gameState.selectedMode;
  const theme = MODE_THEMES[mode];
  const puzzleConfig = getPuzzleConfig(gameState.currentPuzzleType);

  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [solvedPath, setSolvedPath] = useState<Point[]>([]);
  const [showHowTo, setShowHowTo] = useState(false);
  const canvasKeyRef = useRef(0);

  useEffect(() => {
    resetPuzzle();
    resetTimer();
    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gameState.isTimerRunning) return;
    const iv = setInterval(() => incrementTimer(), 1000);
    return () => clearInterval(iv);
  }, [gameState.isTimerRunning, incrementTimer]);

  const handleSolve = useCallback((vertices: Point[]) => {
    setWon(true);
    setShowConfetti(true);
    setSolvedPath(vertices);
    completeLevel(gameState.timer);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [completeLevel, gameState.timer]);

  const handleReset = useCallback(() => {
    setWon(false);
    setSolvedPath([]);
    resetPuzzle();
    resetTimer();
    incrementAttempts();
    startTimer();
    canvasKeyRef.current += 1;
  }, [resetPuzzle, resetTimer, incrementAttempts, startTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // ─── WIN STATE ───
  if (won) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 pb-24 safe-area-bottom ${theme.bg} ${theme.textColor}`}>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div key={i} className="absolute rounded-full"
                style={{
                  width: 6 + Math.random() * 6,
                  height: 6 + Math.random() * 6,
                  background: ['#E94560', '#F5A623', '#0FD688', '#7C3AED', '#3B82F6'][i % 5],
                  left: `${10 + Math.random() * 80}%`,
                  top: `-10%`,
                  animation: `confettiFall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* Bouncing dots */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className="w-3 h-3 rounded-full"
              style={{
                background: LINE_COLORS[i],
                animation: `dotBounce 0.6s ease-out ${i * 0.1}s infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="text-5xl mb-3">🎯</div>
        {theme.encouragement ? (
          <h1 className={`${mode === 'kids' ? 'text-4xl' : 'text-3xl'} font-display font-bold mb-1`}>
            {theme.encouragement}
          </h1>
        ) : (
          <h1 className="text-3xl font-display font-bold mb-1">Complete.</h1>
        )}
        <p className={`text-sm mt-1 mb-6 ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
          Puzzle solved — you thought outside the box!
        </p>

        {/* Stats row */}
        <div className={`flex gap-6 text-sm mb-6 ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${theme.textColor}`}>{formatTime(gameState.timer)}</span>
            <span className="text-xs">Time</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${theme.textColor}`}>{gameState.attempts + 1}</span>
            <span className="text-xs">Attempts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold ${theme.textColor}`}>{gameState.hintsUsed}</span>
            <span className="text-xs">Hints</span>
          </div>
        </div>

        {/* Shareable result card */}
        <div className={`w-full max-w-[300px] rounded-2xl border ${theme.borderColor} ${theme.cardBg} p-4 mb-6 shadow-md`}>
          <div className="flex items-center justify-between mb-3">
            <DotziqLogo size="sm" />
            <span className={`text-xs ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>{todayStr}</span>
          </div>
          <div className={`aspect-square w-full rounded-xl border ${theme.borderColor} overflow-hidden mb-3 ${mode === 'pro' ? 'bg-[#0F0F1A]' : 'bg-background'}`}>
            <svg viewBox="-50 -50 500 500" className="w-full h-full">
              {puzzleConfig.dots.map(dot => (
                <circle key={dot.id} cx={dot.x} cy={dot.y} r="7" fill={theme.dotColor} opacity="0.4" />
              ))}
              {solvedPath.length > 1 && solvedPath.slice(0, -1).map((v, i) => (
                <line key={i} x1={v.x} y1={v.y} x2={solvedPath[i + 1].x} y2={solvedPath[i + 1].y}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth="3" strokeLinecap="round" />
              ))}
            </svg>
          </div>
          <div className={`text-center text-xs ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            Solved in {formatTime(gameState.timer)} · {gameState.attempts + 1} attempt{gameState.attempts > 0 ? 's' : ''}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          <button onClick={handleReset}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold bg-accent text-accent-foreground transition-transform active:scale-95 min-h-[48px]">
            <Trophy size={18} />
            Next Puzzle
          </button>
          <button onClick={() => {
            const text = `🎯 Dotziq — ${todayStr}\n⏱ ${formatTime(gameState.timer)} · ${gameState.attempts + 1} attempt(s)\nThink Outside. Play at dotziq.com`;
            navigator.clipboard?.writeText(text);
          }}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold border-2 border-accent text-accent transition-transform active:scale-95 min-h-[48px]`}>
            <Share2 size={18} />
            Share Result
          </button>
          <button onClick={() => navigate('/modes')}
            className={`flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold transition-colors min-h-[48px] ${mode === 'pro' ? 'text-slate-400 hover:text-slate-200' : 'text-muted-foreground hover:text-foreground'}`}>
            <Home size={18} />
            Back to Menu
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ─── GAME SCREEN ───
  return (
    <div className={`min-h-screen pb-24 safe-area-bottom ${theme.bg} ${theme.textColor}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={22} />
        </button>
        <span className="font-display font-semibold text-sm">{puzzleConfig.name}</span>
        <div className="flex items-center gap-1 min-w-[44px] min-h-[44px] justify-center" style={{ color: '#E8A317' }}>
          <Flame size={18} className="flame-flicker" />
          <span className="text-sm font-bold">{userState.streak}</span>
        </div>
      </div>

      {/* Difficulty & Timer */}
      <div className="flex items-center justify-between px-5 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${mode === 'pro' ? 'bg-slate-800 text-slate-300' : 'bg-secondary text-secondary-foreground'}`}>
          {theme.difficultyLabel}
        </span>
        {theme.showTimer && (
          <span className={`text-sm font-mono ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            {formatTime(gameState.timer)}
          </span>
        )}
      </div>

      {/* Canvas — centered, ~70% width on mobile */}
      <div className="flex justify-center px-[15%]">
        <PuzzleCanvas
          key={canvasKeyRef.current}
          dots={CLASSIC_DOTS}
          maxLines={4}
          dotColor={theme.dotColor}
          canvasBg={mode === 'pro' ? '#1A1A2E' : mode === 'kids' ? '#FFFBF0' : '#FFFFFF'}
          borderStyle={mode === 'pro' ? 'border-slate-700' : 'border-border'}
          onSolve={handleSolve}
          showHintLevel={gameState.hintLevel}
        />
      </div>

      {/* Action buttons row */}
      <div className="flex justify-center gap-3 mt-6 px-5">
        {/* How to solve */}
        <button onClick={() => setShowHowTo(!showHowTo)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 min-h-[44px] ${
            mode === 'pro' ? 'text-slate-400 hover:text-slate-200' : 'text-muted-foreground hover:text-foreground'
          }`}>
          <HelpCircle size={16} />
          How to solve
        </button>

        {/* Hint button */}
        <button onClick={useHint}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 min-h-[44px] ${
            theme.hintStyle === 'prominent'
              ? 'bg-orange-400 text-orange-950 shadow-md'
              : theme.hintStyle === 'minimal'
              ? 'text-slate-400 hover:text-slate-200'
              : 'bg-secondary text-secondary-foreground'
          }`}>
          <Lightbulb size={16} />
          Hint {gameState.hintLevel > 0 ? `(${gameState.hintLevel}/3)` : ''}
        </button>
      </div>

      {/* How to solve tooltip */}
      {showHowTo && (
        <div className={`mx-5 mt-3 p-4 rounded-xl text-sm animate-fade-slide-up ${mode === 'pro' ? 'bg-slate-800 text-slate-300' : 'bg-secondary text-secondary-foreground'}`}>
          💡 <strong>Your lines can go outside the dot grid.</strong> Start from a corner and think beyond the square. You have 4 line segments — use them wisely!
        </div>
      )}

      {/* Hint text for level 1 */}
      {gameState.hintLevel === 1 && (
        <div className={`text-sm font-medium text-center animate-fade-slide-up px-6 mt-3 ${mode === 'pro' ? 'text-red-400' : 'text-amber-600'}`}>
          💡 Your lines can go beyond the dots! Think outside the box.
        </div>
      )}

      {/* Mock ad banner */}
      {!userState.isPro && (
        <div className={`fixed bottom-16 left-0 right-0 h-[50px] flex items-center justify-center text-xs border-t ${
          mode === 'pro' ? 'bg-slate-900/80 text-slate-500 border-slate-700' : 'bg-secondary/80 text-muted-foreground border-border'
        }`}>
          Ad — Upgrade to remove
        </div>
      )}

      <BottomNav />
    </div>
  );
}
