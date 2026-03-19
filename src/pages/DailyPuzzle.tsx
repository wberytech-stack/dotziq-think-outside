import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';

export default function DailyPuzzle() {
  const navigate = useNavigate();
  const { userState } = useApp();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const completed = userState.dailyPuzzleCompleted && userState.dailyPuzzleDate === today.toISOString().split('T')[0];

  const [countdown, setCountdown] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const mockLeaderboard = [
    { rank: 1, name: 'Alice', time: '0:18', country: '🇺🇸' },
    { rank: 2, name: 'Kenji', time: '0:22', country: '🇯🇵' },
    { rank: 3, name: 'Sara', time: '0:25', country: '🇬🇧' },
    { rank: 4, name: 'Marco', time: '0:31', country: '🇮🇹' },
    { rank: 5, name: 'Priya', time: '0:34', country: '🇮🇳' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-8 pb-6">
        <h1 className="text-2xl font-display font-bold">Daily Puzzle</h1>
        <p className="text-lg font-display mt-1">{dateStr}</p>
      </div>

      {/* Streak */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-1 text-gold">
            <Flame size={28} className="flame-flicker" />
            <span className="text-2xl font-display font-bold">{userState.streak}</span>
          </div>
          <div>
            <p className="font-semibold text-sm">Day Streak</p>
            <p className="text-xs text-muted-foreground">Best: {userState.bestStreak} days</p>
          </div>
        </div>
      </div>

      {completed ? (
        <div className="px-5 text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-display font-bold mb-2">Completed!</h2>
          <p className="text-sm text-muted-foreground mb-2">Come back tomorrow for a new puzzle.</p>
          <p className="text-xs text-muted-foreground">Next puzzle in: {countdown}</p>
        </div>
      ) : (
        <div className="px-5">
          <button onClick={() => navigate('/play')}
            className="w-full py-4 rounded-2xl bg-accent text-accent-foreground font-display font-bold text-lg transition-transform active:scale-[0.98] shadow-lg">
            Play Today's Puzzle
          </button>
          <p className="text-xs text-muted-foreground text-center mt-3">Next puzzle in: {countdown}</p>
        </div>
      )}

      {/* Mini leaderboard */}
      <div className="px-5 mt-8">
        <h3 className="font-display font-bold text-sm mb-3">Today's Top Solvers</h3>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {mockLeaderboard.map(entry => (
            <div key={entry.rank} className="flex items-center px-4 py-3 border-b border-border last:border-0">
              <span className={`w-8 text-sm font-bold ${entry.rank <= 3 ? 'text-gold' : 'text-muted-foreground'}`}>
                #{entry.rank}
              </span>
              <span className="mr-2">{entry.country}</span>
              <span className="flex-1 font-medium text-sm">{entry.name}</span>
              <span className="text-sm font-mono text-muted-foreground">{entry.time}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
