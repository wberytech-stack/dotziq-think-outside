import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PuzzleCanvas from '@/components/PuzzleCanvas';
import BottomNav from '@/components/BottomNav';

const CLASSIC_DOTS = [
  { id: 1, x: 100, y: 100 }, { id: 2, x: 200, y: 100 }, { id: 3, x: 300, y: 100 },
  { id: 4, x: 100, y: 200 }, { id: 5, x: 200, y: 200 }, { id: 6, x: 300, y: 200 },
  { id: 7, x: 100, y: 300 }, { id: 8, x: 200, y: 300 }, { id: 9, x: 300, y: 300 },
];

export default function GameScreen() {
  const navigate = useNavigate();
  const { gameState, userState, useHint, completeLevel, resetPuzzle, getThemeColors,
    startTimer, incrementTimer, incrementAttempts, resetTimer } = useApp();
  const theme = getThemeColors();
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    resetPuzzle();
    resetTimer();
    startTimer();
    return () => {};
  }, []);

  useEffect(() => {
    if (!gameState.isTimerRunning) return;
    const iv = setInterval(() => incrementTimer(), 1000);
    return () => clearInterval(iv);
  }, [gameState.isTimerRunning, incrementTimer]);

  const handleSolve = useCallback(() => {
    setWon(true);
    setShowConfetti(true);
    completeLevel(gameState.timer);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [completeLevel, gameState.timer]);

  const handleReset = useCallback(() => {
    setWon(false);
    resetPuzzle();
    resetTimer();
    incrementAttempts();
    startTimer();
  }, [resetPuzzle, resetTimer, incrementAttempts, startTimer]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (won) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-background pb-24">
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="absolute rounded-full confetti-burst"
                style={{
                  width: 8, height: 8,
                  background: ['#E94560', '#F5A623', '#0FD688', '#7C3AED', '#3B82F6'][i % 5],
                  left: `${30 + Math.random() * 40}%`,
                  top: `${30 + Math.random() * 40}%`,
                  animationDelay: `${Math.random() * 0.4}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-3xl font-display font-bold mb-2">
          {theme.encouragement || 'You got it!'}
        </h1>
        <div className="flex gap-6 text-sm text-muted-foreground mb-8">
          <span>⏱ {formatTime(gameState.timer)}</span>
          <span>🔄 {gameState.attempts + 1} attempt{gameState.attempts > 0 ? 's' : ''}</span>
          <span>💡 {gameState.hintsUsed} hints</span>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-[260px]">
          <button onClick={() => { handleReset(); }} className="py-3 rounded-xl font-display font-semibold bg-accent text-accent-foreground transition-transform active:scale-95">
            Next Puzzle
          </button>
          <button onClick={() => navigate('/modes')} className="py-3 rounded-xl font-display font-semibold border-2 border-accent text-accent transition-transform active:scale-95">
            Back to Menu
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft size={22} />
        </button>
        <span className="font-display font-semibold text-sm">Classic Puzzle</span>
        <div className="flex items-center gap-1 text-gold">
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

      {/* Canvas */}
      <div className="px-5">
        <PuzzleCanvas
          dots={CLASSIC_DOTS}
          maxLines={4}
          onSolve={handleSolve}
          showHintLevel={gameState.hintLevel}
        />
      </div>

      {/* Hint button */}
      <div className="flex justify-center mt-6">
        <button onClick={useHint}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all active:scale-95 ${
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
