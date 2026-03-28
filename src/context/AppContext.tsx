import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type GameMode = 'kids' | 'student' | 'pro';
export type PuzzleType = 'classic' | 'grid16' | 'star' | 'cross';

interface Point {
  x: number;
  y: number;
}

interface GameState {
  selectedMode: GameMode;
  currentPuzzleType: PuzzleType;
  currentLevel: number;
  currentPuzzleIndex: number;
  currentPath: Point[];
  linesUsed: number;
  hintsUsed: number;
  hintLevel: number;
  isComplete: boolean;
  timer: number;
  isTimerRunning: boolean;
  attempts: number;
  sessionStreak: number;
  lastXpAwarded: number;
}

interface UserState {
  streak: number;
  bestStreak: number;
  totalSolved: number;
  achievements: string[];
  xp: number;
  level: string;
  isPro: boolean;
  dailyPuzzleCompleted: boolean;
  dailyPuzzleDate: string | null;
  hintsUsedTotal: number;
  firstTrySolves: number;
  totalAttempts: number;
  puzzlesPerDay: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  darkMode: boolean;
  timerVisible: boolean;
  notificationsEnabled: boolean;
}

interface AppContextType {
  gameState: GameState;
  userState: UserState;
  setMode: (mode: GameMode) => void;
  setPuzzleType: (type: PuzzleType) => void;
  setPuzzleIndex: (index: number) => void;
  setCurrentPath: (path: Point[]) => void;
  setLinesUsed: (n: number) => void;
  useHint: () => void;
  completeLevel: (time: number, xpReward: number) => void;
  resetPuzzle: () => void;
  nextPuzzle: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  incrementTimer: () => void;
  incrementAttempts: () => void;
  completeDailyPuzzle: () => void;
  toggleSetting: (key: keyof Pick<UserState, 'soundEnabled' | 'hapticEnabled' | 'darkMode' | 'timerVisible' | 'notificationsEnabled'>) => void;
  getThemeColors: () => { bg: string; dotColor: string; fontSize: string; showTimer: boolean; encouragement: string; hintStyle: string };
}

const defaultGameState: GameState = {
  selectedMode: 'student',
  currentPuzzleType: 'classic',
  currentLevel: 1,
  currentPuzzleIndex: 0,
  currentPath: [],
  linesUsed: 0,
  hintsUsed: 0,
  hintLevel: 0,
  isComplete: false,
  timer: 0,
  isTimerRunning: false,
  attempts: 0,
  sessionStreak: 0,
  lastXpAwarded: 0,
};

const defaultUserState: UserState = {
  streak: 0,
  bestStreak: 0,
  totalSolved: 0,
  achievements: [],
  xp: 0,
  level: 'Novice',
  isPro: false,
  dailyPuzzleCompleted: false,
  dailyPuzzleDate: null,
  hintsUsedTotal: 0,
  firstTrySolves: 0,
  totalAttempts: 0,
  puzzlesPerDay: 0,
  soundEnabled: true,
  hapticEnabled: true,
  darkMode: false,
  timerVisible: true,
  notificationsEnabled: true,
};

const AppContext = createContext<AppContextType | null>(null);

function getLevel(xp: number): string {
  if (xp >= 5000) return 'Dotziq Master';
  if (xp >= 2000) return 'Lateral Mind';
  if (xp >= 800) return 'Solver';
  if (xp >= 200) return 'Thinker';
  return 'Novice';
}

export function xpProgress(xp: number, level: string): number {
  const thresholds: Record<string, [number, number]> = {
    'Novice': [0, 200],
    'Thinker': [200, 800],
    'Solver': [800, 2000],
    'Lateral Mind': [2000, 5000],
    'Dotziq Master': [5000, 10000],
  };
  const [min, max] = thresholds[level] || [0, 200];
  return Math.min(((xp - min) / (max - min)) * 100, 100);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('dotziq_game');
    return saved ? { ...defaultGameState, ...JSON.parse(saved) } : defaultGameState;
  });

  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('dotziq_user');
    return saved ? { ...defaultUserState, ...JSON.parse(saved) } : defaultUserState;
  });

  useEffect(() => {
    localStorage.setItem('dotziq_game', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('dotziq_user', JSON.stringify(userState));
  }, [userState]);

  useEffect(() => {
    if (userState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userState.darkMode]);

  const setMode = useCallback((mode: GameMode) => {
    setGameState(s => ({ ...s, selectedMode: mode, currentPuzzleIndex: 0, currentPath: [], linesUsed: 0, isComplete: false, hintLevel: 0, hintsUsed: 0, timer: 0, isTimerRunning: false, attempts: 0, lastXpAwarded: 0 }));
  }, []);

  const setPuzzleType = useCallback((type: PuzzleType) => {
    setGameState(s => ({ ...s, currentPuzzleType: type }));
  }, []);

  const setPuzzleIndex = useCallback((index: number) => {
    setGameState(s => ({ ...s, currentPuzzleIndex: index, currentPath: [], linesUsed: 0, isComplete: false, hintLevel: 0, hintsUsed: 0, timer: 0, isTimerRunning: false, attempts: 0, lastXpAwarded: 0 }));
  }, []);

  const setCurrentPath = useCallback((path: Point[]) => {
    setGameState(s => ({ ...s, currentPath: path }));
  }, []);

  const setLinesUsed = useCallback((n: number) => {
    setGameState(s => ({ ...s, linesUsed: n }));
  }, []);

  const useHint = useCallback(() => {
    setGameState(s => ({ ...s, hintLevel: Math.min(s.hintLevel + 1, 3), hintsUsed: s.hintsUsed + 1 }));
    setUserState(s => ({ ...s, hintsUsedTotal: s.hintsUsedTotal + 1 }));
  }, []);

  const resetPuzzle = useCallback(() => {
    setGameState(s => ({ ...s, currentPath: [], linesUsed: 0, isComplete: false, hintLevel: 0, hintsUsed: 0, lastXpAwarded: 0 }));
  }, []);

  const nextPuzzle = useCallback(() => {
    setGameState(s => ({
      ...s,
      currentPuzzleIndex: s.currentPuzzleIndex + 1,
      currentPath: [],
      linesUsed: 0,
      isComplete: false,
      hintLevel: 0,
      hintsUsed: 0,
      timer: 0,
      isTimerRunning: false,
      attempts: 0,
      lastXpAwarded: 0,
    }));
  }, []);

  const startTimer = useCallback(() => {
    setGameState(s => ({ ...s, isTimerRunning: true }));
  }, []);

  const stopTimer = useCallback(() => {
    setGameState(s => ({ ...s, isTimerRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setGameState(s => ({ ...s, timer: 0, isTimerRunning: false }));
  }, []);

  const incrementTimer = useCallback(() => {
    setGameState(s => s.isTimerRunning ? { ...s, timer: s.timer + 1 } : s);
  }, []);

  const incrementAttempts = useCallback(() => {
    setGameState(s => ({ ...s, attempts: s.attempts + 1 }));
    setUserState(s => ({ ...s, totalAttempts: s.totalAttempts + 1 }));
  }, []);

  const completeLevel = useCallback((time: number, xpReward: number) => {
    setGameState(s => ({
      ...s,
      isComplete: true,
      isTimerRunning: false,
      sessionStreak: s.sessionStreak + 1,
      lastXpAwarded: xpReward,
    }));
    setUserState(s => {
      const newXp = s.xp + xpReward;
      const newLevel = getLevel(newXp);
      const newSolved = s.totalSolved + 1;
      const newAchievements = [...s.achievements];
      if (!newAchievements.includes('first_dot')) newAchievements.push('first_dot');
      if (gameState.hintsUsed === 0 && !newAchievements.includes('outside_the_box')) newAchievements.push('outside_the_box');
      if (time < 30 && !newAchievements.includes('speed_thinker')) newAchievements.push('speed_thinker');
      const newStreak = s.streak + 1;
      if (newStreak >= 7 && !newAchievements.includes('7_day_streak')) newAchievements.push('7_day_streak');
      if (newStreak >= 30 && !newAchievements.includes('30_day_streak')) newAchievements.push('30_day_streak');
      return {
        ...s,
        totalSolved: newSolved,
        xp: newXp,
        level: newLevel,
        achievements: newAchievements,
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
        firstTrySolves: gameState.attempts <= 1 ? s.firstTrySolves + 1 : s.firstTrySolves,
      };
    });
  }, [gameState.hintsUsed, gameState.attempts]);

  const completeDailyPuzzle = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setUserState(s => ({ ...s, dailyPuzzleCompleted: true, dailyPuzzleDate: today }));
  }, []);

  const toggleSetting = useCallback((key: keyof Pick<UserState, 'soundEnabled' | 'hapticEnabled' | 'darkMode' | 'timerVisible' | 'notificationsEnabled'>) => {
    setUserState(s => ({ ...s, [key]: !s[key] }));
  }, []);

  const getThemeColors = useCallback(() => {
    switch (gameState.selectedMode) {
      case 'kids':
        return { bg: 'bg-[hsl(40,100%,97%)]', dotColor: '#FF6B35', fontSize: 'text-lg', showTimer: false, encouragement: 'Great job! ⭐', hintStyle: 'prominent' };
      case 'pro':
        return { bg: 'dark bg-[hsl(240,33%,6%)]', dotColor: '#E94560', fontSize: 'text-base', showTimer: true, encouragement: '', hintStyle: 'minimal' };
      default:
        return { bg: 'bg-card', dotColor: '#3B82F6', fontSize: 'text-base', showTimer: true, encouragement: 'Solved!', hintStyle: 'subtle' };
    }
  }, [gameState.selectedMode]);

  return (
    <AppContext.Provider value={{
      gameState, userState, setMode, setPuzzleType, setPuzzleIndex, setCurrentPath, setLinesUsed,
      useHint, completeLevel, resetPuzzle, nextPuzzle, startTimer, stopTimer, resetTimer,
      incrementTimer, incrementAttempts, completeDailyPuzzle, toggleSetting, getThemeColors,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
