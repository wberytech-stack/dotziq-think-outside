import { useApp } from '@/context/AppContext';
import { Crown, Check } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const proFeatures = [
  'Unlimited puzzles',
  'All 4 puzzle types',
  'Ad-free experience',
  'Unlimited hints',
  'Detailed performance analytics',
  'Priority leaderboard',
];

export default function SettingsScreen() {
  const { userState, toggleSetting } = useApp();

  const toggles: { key: 'soundEnabled' | 'hapticEnabled' | 'darkMode' | 'timerVisible' | 'notificationsEnabled'; label: string }[] = [
    { key: 'soundEnabled', label: 'Sound Effects' },
    { key: 'hapticEnabled', label: 'Haptic Feedback' },
    { key: 'darkMode', label: 'Dark Mode' },
    { key: 'timerVisible', label: 'Timer Visible' },
    { key: 'notificationsEnabled', label: 'Notifications' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-display font-bold">Settings</h1>
      </div>

      {/* Pro upgrade card */}
      {!userState.isPro && (
        <div className="px-5 mb-6">
          <div className="rounded-2xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground">
            <div className="flex items-center gap-2 mb-3">
              <Crown size={24} />
              <h2 className="font-display font-bold text-xl">Dotziq Pro</h2>
            </div>
            <ul className="space-y-2 mb-5">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => { if (import.meta.env.DEV) console.log('[IAP] Start trial'); }}
              className="w-full py-3.5 rounded-xl font-display font-bold bg-card text-foreground transition-transform active:scale-95">
              Start 7-Day Free Trial
            </button>
            <p className="text-xs text-center mt-2 opacity-80">Then $1.99/month · Cancel anytime</p>
          </div>
        </div>
      )}

      {/* Puzzle packs */}
      <div className="px-5 mb-6">
        <h3 className="font-display font-bold text-sm mb-3">Puzzle Packs</h3>
        <button onClick={() => { if (import.meta.env.DEV) console.log('[IAP] Grid Master Pack'); }}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card transition-transform active:scale-[0.98]">
          <div>
            <p className="font-semibold text-sm">Grid Master Pack</p>
            <p className="text-xs text-muted-foreground">30 extra Grid Sixteen puzzles</p>
          </div>
          <span className="font-display font-bold text-accent">$0.99</span>
        </button>
      </div>

      {/* Remove Ads */}
      <div className="px-5 mb-6">
        <button onClick={() => { if (import.meta.env.DEV) console.log('[IAP] Remove Ads'); }}
          className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card transition-transform active:scale-[0.98]">
          <div>
            <p className="font-semibold text-sm">Remove Ads</p>
            <p className="text-xs text-muted-foreground">One-time purchase</p>
          </div>
          <span className="font-display font-bold text-accent">$1.99</span>
        </button>
      </div>

      {/* Settings toggles */}
      <div className="px-5 mb-6">
        <h3 className="font-display font-bold text-sm mb-3">Preferences</h3>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {toggles.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between px-4 py-3.5 border-b border-border last:border-0">
              <span className="text-sm font-medium">{label}</span>
              <button onClick={() => toggleSetting(key)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  userState[key] ? 'bg-accent' : 'bg-secondary'
                }`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${
                  userState[key] ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="px-5 mb-6">
        <h3 className="font-display font-bold text-sm mb-3">Account</h3>
        <div className="space-y-3">
          <button onClick={() => { if (import.meta.env.DEV) console.log('[Auth] Apple sign in'); }}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-foreground text-background transition-transform active:scale-95">
             Sign in with Apple
          </button>
          <button onClick={() => console.log('[Auth] Google sign in')}
            className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-border transition-transform active:scale-95">
            Sign in with Google
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-3">
          Playing as Guest — sign in to save progress
        </p>
      </div>

      {/* Free tier info */}
      <div className="px-5 mb-6">
        <h3 className="font-display font-bold text-sm mb-3">Free Tier</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• 3 Classic puzzles per day</li>
          <li>• Daily puzzle (always free)</li>
          <li>• Basic leaderboard</li>
          <li>• 1 hint per day</li>
        </ul>
      </div>

      <BottomNav />
    </div>
  );
}
