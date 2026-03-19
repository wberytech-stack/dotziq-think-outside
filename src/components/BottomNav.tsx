import { Home, Grid3X3, CalendarDays, Trophy, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const tabs = [
  { path: '/modes', icon: Home, label: 'Home' },
  { path: '/puzzles', icon: Grid3X3, label: 'Puzzles' },
  { path: '/daily', icon: CalendarDays, label: 'Daily' },
  { path: '/leaderboard', icon: Trophy, label: 'Board' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tapped, setTapped] = useState<string | null>(null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(tab => {
          const isActive = location.pathname === tab.path || (tab.path === '/modes' && location.pathname === '/');
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => {
                setTapped(tab.path);
                navigate(tab.path);
                setTimeout(() => setTapped(null), 300);
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-muted'
              } ${tapped === tab.path ? 'tab-bounce' : ''}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
