import { useApp, xpProgress } from '@/context/AppContext';
import { Flame, Target, Clock, Lightbulb, Zap, Trophy } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const allBadges = [
  { id: 'first_dot', name: 'First Dot', desc: 'Solve your first puzzle', icon: '🟢' },
  { id: 'outside_the_box', name: 'Outside the Box', desc: 'Solve without hints', icon: '📦' },
  { id: 'speed_thinker', name: 'Speed Thinker', desc: 'Solve in under 30 seconds', icon: '⚡' },
  { id: '7_day_streak', name: '7-Day Streak', desc: '7 days in a row', icon: '🔥' },
  { id: '30_day_streak', name: '30-Day Streak', desc: '30 days in a row', icon: '💎' },
  { id: 'grid_master', name: 'Grid Master', desc: 'Complete all Grid Sixteen puzzles', icon: '🔷' },
  { id: 'no_hints', name: 'No Hints', desc: 'Complete 10 puzzles with zero hints', icon: '🧠' },
  { id: 'dotziq_pro', name: 'Dotziq Pro', desc: 'Unlock all puzzle types', icon: '👑' },
];

export default function ProfileScreen() {
  const { userState } = useApp();
  const progress = xpProgress(userState.xp, userState.level);
  const accuracy = userState.totalAttempts > 0
    ? Math.round((userState.firstTrySolves / userState.totalAttempts) * 100)
    : 0;

  const stats = [
    { icon: Target, label: 'Solved', value: userState.totalSolved },
    { icon: Flame, label: 'Streak', value: userState.streak },
    { icon: Trophy, label: 'Best Streak', value: userState.bestStreak },
    { icon: Clock, label: 'Avg Time', value: '—' },
    { icon: Lightbulb, label: 'Hints Used', value: userState.hintsUsedTotal },
    { icon: Zap, label: 'Accuracy', value: `${accuracy}%` },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Profile</h1>
      </div>

      {/* Level indicator */}
      <div className="px-5 mb-6">
        <div className="p-5 rounded-2xl bg-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold">{userState.level}</span>
            <span className="text-sm text-muted-foreground">{userState.xp} XP</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(s => (
            <div key={s.label} className="p-3 rounded-xl bg-card border border-border text-center">
              <s.icon size={18} className="mx-auto mb-1 text-muted-foreground" />
              <p className="text-lg font-display font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="px-5">
        <h2 className="font-display font-bold mb-3">Achievements</h2>
        <div className="grid grid-cols-2 gap-3">
          {allBadges.map(b => {
            const unlocked = userState.achievements.includes(b.id);
            return (
              <div key={b.id}
                className={`p-4 rounded-xl border border-border text-center transition-all ${
                  unlocked ? 'bg-card badge-pop' : 'bg-secondary/30 opacity-50'
                }`}>
                <div className="text-2xl mb-1">{b.icon}</div>
                <p className="text-xs font-semibold">{b.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
