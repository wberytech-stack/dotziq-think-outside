import { useState } from 'react';
import BottomNav from '@/components/BottomNav';

const tabs = ['Global', 'Today', 'Friends'] as const;

const mockData = Array.from({ length: 20 }).map((_, i) => ({
  rank: i + 1,
  name: ['Alice', 'Kenji', 'Sara', 'Marco', 'Priya', 'Chen', 'Liam', 'Yuki', 'Fatima', 'Oscar',
    'Emma', 'Raj', 'Sofia', 'Jin', 'Ava', 'Lucas', 'Mia', 'Amir', 'Zoe', 'Noah'][i],
  score: 5000 - i * 180 + Math.floor(Math.random() * 50),
  time: `${Math.floor(Math.random() * 2)}:${(15 + i * 3).toString().padStart(2, '0')}`,
  country: ['🇺🇸', '🇯🇵', '🇬🇧', '🇮🇹', '🇮🇳', '🇨🇳', '🇨🇦', '🇯🇵', '🇸🇦', '🇲🇽',
    '🇩🇪', '🇮🇳', '🇪🇸', '🇰🇷', '🇦🇺', '🇧🇷', '🇫🇷', '🇮🇷', '🇳🇱', '🇸🇪'][i],
}));

export default function LeaderboardScreen() {
  const [tab, setTab] = useState<typeof tabs[number]>('Global');

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Leaderboard</h1>
      </div>

      <div className="px-5 flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Friends' ? (
        <div className="px-5 py-16 text-center">
          <div className="text-4xl mb-3">👥</div>
          <p className="font-display font-semibold">Invite friends to compare</p>
          <p className="text-sm text-muted-foreground mt-1">Share your profile to get started</p>
        </div>
      ) : (
        <div className="px-5">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {mockData.map(entry => (
              <div key={entry.rank} className="flex items-center px-4 py-3 border-b border-border last:border-0">
                <span className={`w-8 text-sm font-bold ${
                  entry.rank === 1 ? 'text-gold' :
                  entry.rank === 2 ? 'text-muted-foreground' :
                  entry.rank === 3 ? 'text-amber-700' : 'text-muted-foreground'
                }`}>
                  #{entry.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent mr-3">
                  {entry.name[0]}
                </div>
                <span className="mr-2">{entry.country}</span>
                <span className="flex-1 font-medium text-sm">{entry.name}</span>
                <span className="text-sm font-mono text-muted-foreground">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
