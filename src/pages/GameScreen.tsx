import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Flame, Share2, Trophy, Home, HelpCircle, Play } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import PuzzleCanvas from '@/components/PuzzleCanvas';
import DotziqLogo from '@/components/DotziqLogo';
import BottomNav from '@/components/BottomNav';
import { getPuzzleChallenge, TOTAL_PUZZLES } from '@/lib/puzzleConfigs';
import TutorialOverlay from '@/components/TutorialOverlay';

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

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

const DIFFICULTY_COLORS_PRO: Record<string, string> = {
  easy: 'bg-emerald-900/40 text-emerald-400',
  medium: 'bg-amber-900/40 text-amber-400',
  hard: 'bg-red-900/40 text-red-400',
};

export default function GameScreen() {
  const navigate = useNavigate();
  const { gameState, userState, useHint, completeLevel, resetPuzzle, nextPuzzle,
    startTimer, incrementTimer, incrementAttempts, resetTimer } = useApp();

  const mode = gameState.selectedMode;
  const theme = MODE_THEMES[mode];

  const challenge = getPuzzleChallenge(gameState.currentPuzzleIndex);
  const puzzleConfig = challenge.config;
  const puzzleNumber = gameState.currentPuzzleIndex + 1;

  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [solvedPath, setSolvedPath] = useState<Point[]>([]);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [showStreakMsg, setShowStreakMsg] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const canvasKeyRef = useRef(0);

  useEffect(() => {
    resetPuzzle();
    resetTimer();
    startTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer countdown for timed challenges
  useEffect(() => {
    if (!gameState.isTimerRunning) return;
    const iv = setInterval(() => incrementTimer(), 1000);
    return () => clearInterval(iv);
  }, [gameState.isTimerRunning, incrementTimer]);

  // Check time limit
  useEffect(() => {
    if (challenge.timed && gameState.timer >= challenge.timed && !won) {
      setTimeExpired(true);
    }
  }, [gameState.timer, challenge.timed, won]);

  const handleSolve = useCallback((vertices: Point[]) => {
    if (timeExpired) return;
    setWon(true);
    setShowConfetti(true);
    setSolvedPath(vertices);
    completeLevel(gameState.timer, challenge.xpReward);

    // Show XP animation
    setShowXpAnim(true);
    setTimeout(() => setShowXpAnim(false), 2000);

    // Check session streak for motivational message (streak incremented in completeLevel)
    const newSessionStreak = gameState.sessionStreak + 1;
    if (newSessionStreak > 0 && newSessionStreak % 3 === 0) {
      setTimeout(() => {
        setShowStreakMsg(true);
        setTimeout(() => setShowStreakMsg(false), 3000);
      }, 1500);
    }

    setTimeout(() => setShowConfetti(false), 3000);
  }, [completeLevel, gameState.timer, gameState.sessionStreak, challenge.xpReward, timeExpired]);

  const handleReset = useCallback(() => {
    setWon(false);
    setSolvedPath([]);
    setTimeExpired(false);
    resetPuzzle();
    resetTimer();
    incrementAttempts();
    startTimer();
    canvasKeyRef.current += 1;
  }, [resetPuzzle, resetTimer, incrementAttempts, startTimer]);

  const handleNextPuzzle = useCallback(() => {
    setWon(false);
    setSolvedPath([]);
    setTimeExpired(false);
    setShowXpAnim(false);
    setShowStreakMsg(false);
    nextPuzzle();
    canvasKeyRef.current += 1;
  }, [nextPuzzle]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const diffColors = mode === 'pro' ? DIFFICULTY_COLORS_PRO : DIFFICULTY_COLORS;

  // Time expired screen
  if (timeExpired && !won) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 pb-24 safe-area-bottom ${theme.bg} ${theme.textColor}`}>
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-3xl font-display font-bold mb-2">Time's Up!</h1>
        <p className={`text-sm mb-6 ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
          You needed to solve it in {challenge.timed} seconds
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[300px]">
          <button onClick={handleReset}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold bg-accent text-accent-foreground transition-transform active:scale-95 min-h-[48px]">
            Try Again
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

        {/* XP floating animation */}
        {showXpAnim && (
          <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-xp-float">
            <span className="text-2xl font-display font-bold text-emerald-500 drop-shadow-lg">
              +{gameState.lastXpAwarded} XP
            </span>
          </div>
        )}

        {/* Streak motivational message */}
        {showStreakMsg && (
          <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-xp-float">
            <span className="text-xl font-display font-bold text-orange-500 drop-shadow-lg whitespace-nowrap">
              You're on fire! 🔥 {gameState.sessionStreak} in a row!
            </span>
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
        <p className={`text-sm mt-1 mb-2 ${mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
          Puzzle {puzzleNumber} of {TOTAL_PUZZLES} solved — you thought outside the box!
        </p>
        <p className={`text-xs mb-6 font-semibold text-emerald-500`}>
          +{gameState.lastXpAwarded} XP earned
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
          <div className="flex flex-col items-center">
            <span className={`text-lg font-bold text-orange-500`}>{gameState.sessionStreak}</span>
            <span className="text-xs">Streak</span>
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
          {puzzleNumber < TOTAL_PUZZLES && (
            <button onClick={handleNextPuzzle}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold bg-accent text-accent-foreground transition-transform active:scale-95 min-h-[48px]">
              <Trophy size={18} />
              Next Puzzle ({puzzleNumber + 1} of {TOTAL_PUZZLES})
            </button>
          )}
          <button onClick={() => {
            const text = `🎯 Dotziq — Puzzle ${puzzleNumber}\n⏱ ${formatTime(gameState.timer)} · ${gameState.attempts + 1} attempt(s)\n+${gameState.lastXpAwarded} XP\nThink Outside. Play at dotziq.com`;
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
    <div className={`h-[100dvh] flex flex-col ${theme.bg} ${theme.textColor}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-black/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ArrowLeft size={22} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-display font-semibold text-sm">{challenge.title}</span>
          <span className={`text-[10px] ${mode === 'pro' ? 'text-slate-500' : 'text-muted-foreground'}`}>
            Puzzle {puzzleNumber} of {TOTAL_PUZZLES}
          </span>
        </div>
        <div className="flex items-center gap-1 min-w-[44px] min-h-[44px] justify-center" style={{ color: '#E8A317' }}>
          <Flame size={18} className="flame-flicker" />
          <span className="text-sm font-bold">{gameState.sessionStreak}</span>
        </div>
      </div>

      {/* Difficulty, description & Timer */}
      <div className="flex items-center justify-between px-5 mb-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${diffColors[challenge.difficulty]}`}>
            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
          </span>
          {challenge.timed && (
            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${mode === 'pro' ? 'bg-slate-800 text-slate-300' : 'bg-secondary text-secondary-foreground'}`}>
              ⏱ {challenge.timed}s limit
            </span>
          )}
          {!challenge.hintsAllowed && (
            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${mode === 'pro' ? 'bg-slate-800 text-slate-300' : 'bg-secondary text-secondary-foreground'}`}>
              🚫 No hints
            </span>
          )}
        </div>
        {theme.showTimer && (
          <span className={`text-sm font-mono ${challenge.timed && gameState.timer > (challenge.timed * 0.75) ? 'text-red-500' : mode === 'pro' ? 'text-slate-400' : 'text-muted-foreground'}`}>
            {formatTime(gameState.timer)}
            {challenge.timed && <span className="text-[10px] ml-1">/ {formatTime(challenge.timed)}</span>}
          </span>
        )}
      </div>

      {/* Challenge description */}
      <div className={`text-center text-xs px-6 mb-1 flex-shrink-0 ${mode === 'pro' ? 'text-slate-500' : 'text-muted-foreground'}`}>
        {challenge.description}
      </div>

      {/* Main game area */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 min-h-0">
        <div className="w-[85vw] max-w-[420px]">
          <PuzzleCanvas
            key={canvasKeyRef.current}
            dots={puzzleConfig.dots}
            maxLines={puzzleConfig.maxLines}
            dotColor={theme.dotColor}
            canvasBg={mode === 'pro' ? '#1A1A2E' : mode === 'kids' ? '#FFFBF0' : '#FFFFFF'}
            borderStyle={mode === 'pro' ? 'border-slate-700' : 'border-border'}
            onSolve={handleSolve}
            showHintLevel={gameState.hintLevel}
            hintLine={puzzleConfig.hintLine}
            solutionPath={puzzleConfig.solutionPath}
          />
        </div>

        {/* Action buttons row */}
        <div className="flex justify-center gap-2 mt-3 px-2 flex-shrink-0 flex-wrap">
          <button onClick={() => setShowHowTo(!showHowTo)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all active:scale-95 min-h-[44px] ${
              mode === 'pro' ? 'text-slate-400 hover:text-slate-200' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <HelpCircle size={15} />
            How to solve
          </button>

          <button onClick={() => setShowTutorial(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all active:scale-95 min-h-[44px] ${
              mode === 'pro' ? 'text-slate-400 hover:text-slate-200' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Play size={15} />
            Watch Solution
          </button>

          {challenge.hintsAllowed && (
            <button onClick={useHint}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-xs transition-all active:scale-95 min-h-[44px] ${
                theme.hintStyle === 'prominent'
                  ? 'bg-orange-400 text-orange-950 shadow-md'
                  : theme.hintStyle === 'minimal'
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
              <Lightbulb size={15} />
              Hint {gameState.hintLevel > 0 ? `(${gameState.hintLevel}/3)` : ''}
            </button>
          )}
        </div>

        {/* How to solve tooltip */}
        {showHowTo && (
          <div className={`mx-4 mt-2 p-3 rounded-xl text-xs animate-fade-slide-up ${mode === 'pro' ? 'bg-slate-800 text-slate-300' : 'bg-secondary text-secondary-foreground'}`}>
            💡 <strong>{puzzleConfig.hintText}</strong> You have {puzzleConfig.maxLines} line segments — use them wisely!
          </div>
        )}

        {/* Hint level 1: text popup */}
        {gameState.hintLevel >= 1 && (
          <div className={`text-xs font-medium text-center animate-fade-slide-up px-6 mt-2 ${mode === 'pro' ? 'text-red-400' : 'text-amber-600'}`}>
            💡 Your lines can go outside the dot grid boundary — the dashed box is not a limit.
          </div>
        )}

        {gameState.hintLevel >= 2 && (
          <div className={`text-xs text-center px-6 mt-1 ${mode === 'pro' ? 'text-slate-500' : 'text-muted-foreground'}`}>
            {gameState.hintLevel >= 3 ? '👻 Full solution shown on canvas' : '👻 First line shown on canvas'}
          </div>
        )}
      </div>

      {/* Mock ad banner */}
      {!userState.isPro && (
        <div className={`flex-shrink-0 h-[50px] flex items-center justify-center text-xs border-t ${
          mode === 'pro' ? 'bg-slate-900/80 text-slate-500 border-slate-700' : 'bg-secondary/80 text-muted-foreground border-border'
        }`}>
          Ad — Upgrade to remove
        </div>
      )}

      {/* Bottom nav spacer */}
      <div className="flex-shrink-0 h-16" />

      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}

      <BottomNav />
    </div>
  );
}
