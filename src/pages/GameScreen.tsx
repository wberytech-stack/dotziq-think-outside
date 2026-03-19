import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Flame, Share2, Trophy, Home } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PuzzleCanvas from '@/components/PuzzleCanvas';
import DotziqLogo from '@/components/DotziqLogo';
import BottomNav from '@/components/BottomNav';

const CLASSIC_DOTS = [
  { id: 1, x: 100, y: 100 }, { id: 2, x: 200, y: 100 }, { id: 3, x: 300, y: 100 },
  { id: 4, x: 100, y: 200 }, { id: 5, x: 200, y: 200 }, { id: 6, x: 300, y: 200 },
  { id: 7, x: 100, y: 300 }, { id: 8, x: 200, y: 300 }, { id: 9, x: 300, y: 300 },
];

const LINE_COLORS = ['#E94560', '#F5A623', '#0FD688', '#7C3AED', '#3B82F6'];

interface Point { x: number; y: number; }

export default function GameScreen() {
  const navigate = useNavigate();
  const { gameState, userState, useHint, completeLevel, resetPuzzle, getThemeColors,
    startTimer, incrementTimer, incrementAttempts, resetTimer } = useApp();
  const theme = getThemeColors();
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [solvedPath, setSolvedPath] = useState<Point[]>([]);
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
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background pb-24 safe-area-bottom">
        {/* Confetti */}
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
        <h1 className="text-3xl font-display font-bold mb-1">
          {theme.encouragement || 'You got it!'}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">Puzzle solved — you thought outside the box!</p>

        {/* Stats row */}
        <div className="flex gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">{formatTime(gameState.timer)}</span>
            <span className="text-xs">Time</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">{gameState.attempts + 1}</span>
            <span className="text-xs">Attempts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-foreground">{gameState.hintsUsed}</span>
            <span className="text-xs">Hints</span>
          </div>
        </div>

        {/* Shareable result card */}
        <div className="w-full max-w-[300px] rounded-2xl border border-border bg-card p-4 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <DotziqLogo size="sm" />
            <span className="text-xs text-muted-foreground">{todayStr}</span>
          </div>
          {/* Mini solution path preview */}
          <div className="aspect-square w-full rounded-xl bg-background border border-border overflow-hidden mb-3">
            <svg viewBox="-50 -50 500 500" className="w-full h-full">
              {/* Grid dots */}
              {CLASSIC_DOTS.map(dot => (
                <circle key={dot.id} cx={dot.x} cy={dot.y} r="7" fill="hsl(var(--accent))" opacity="0.4" />
              ))}
              {/* Solution path */}
              {solvedPath.length > 1 && solvedPath.slice(0, -1).map((v, i) => (
                <line key={i} x1={v.x} y1={v.y} x2={solvedPath[i + 1].x} y2={solvedPath[i + 1].y}
                  stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth="3" strokeLinecap="round" />
              ))}
            </svg>
          </div>
          <div className="text-center text-xs text-muted-foreground">
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
            // Share functionality — copy to clipboard
            const text = `🎯 Dotziq — ${todayStr}\n⏱ ${formatTime(gameState.timer)} · ${gameState.attempts + 1} attempt(s)\nThink Outside. Play at dotziq.com`;
            navigator.clipboard?.writeText(text);
          }}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold border-2 border-accent text-accent transition-transform active:scale-95 min-h-[48px]">
            <Share2 size={18} />
            Share Result
          </button>
          <button onClick={() => navigate('/modes')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold text-muted-foreground hover:text-foreground transition-colors min-h-[48px]">
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
    <div className="min-h-screen bg-background pb-24 safe-area-bottom">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={22} />
        </button>
        <span className="font-display font-semibold text-sm">Classic Puzzle</span>
        <div className="flex items-center gap-1 text-gold min-w-[44px] min-h-[44px] justify-center">
          <Flame size={18} className="flame-flicker" />
          <span className="text-sm font-bold">{userState.streak}</span>
        </div>
      </div>

      {/* Difficulty & Timer */}
      <div className="flex items-center justify-between px-5 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-secondary-foreground">
          {gameState.selectedMode === 'kids' ? 'Easy' : gameState.selectedMode === 'student' ? 'Medium' : 'Hard'}
        </span>
        {theme.showTimer && (
          <span className="text-sm font-mono text-muted-foreground">{formatTime(gameState.timer)}</span>
        )}
      </div>

      {/* Canvas — centered, ~70% width on mobile */}
      <div className="flex justify-center px-[15%]">
        <PuzzleCanvas
          key={canvasKeyRef.current}
          dots={CLASSIC_DOTS}
          maxLines={4}
          onSolve={handleSolve}
          showHintLevel={gameState.hintLevel}
        />
      </div>

      {/* Hint button */}
      <div className="flex justify-center mt-6">
        <button onClick={useHint}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 min-h-[44px] ${
            theme.hintStyle === 'prominent'
              ? 'bg-gold text-gold-foreground shadow-md'
              : theme.hintStyle === 'minimal'
              ? 'text-muted-foreground hover:text-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}>
          <Lightbulb size={16} />
          Hint {gameState.hintLevel > 0 ? `(${gameState.hintLevel}/3)` : ''}
        </button>
      </div>

      {/* Mock ad banner */}
      {!userState.isPro && (
        <div className="fixed bottom-16 left-0 right-0 h-[50px] bg-secondary/80 flex items-center justify-center text-xs text-muted-foreground border-t border-border">
          Ad — Upgrade to remove
        </div>
      )}

      <BottomNav />
    </div>
  );
}
