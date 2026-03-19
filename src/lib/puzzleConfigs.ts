export interface Dot {
  id: number;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

export interface PuzzleConfig {
  type: string;
  name: string;
  dots: Dot[];
  maxLines: number;
  gridMin: number;
  gridMax: number;
  hintText: string;
  hintLine: [Point, Point] | null;
  solutionPath: Point[];
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleChallenge {
  id: number;
  config: PuzzleConfig;
  difficulty: Difficulty;
  title: string;
  description: string;
  xpReward: number;
  timed?: number; // time limit in seconds, if any
  hintsAllowed: boolean;
}

// Classic 3×3 — 9 dots, 4 lines
const CLASSIC_DOTS: Dot[] = [
  { id: 1, x: 100, y: 100 }, { id: 2, x: 200, y: 100 }, { id: 3, x: 300, y: 100 },
  { id: 4, x: 100, y: 200 }, { id: 5, x: 200, y: 200 }, { id: 6, x: 300, y: 200 },
  { id: 7, x: 100, y: 300 }, { id: 8, x: 200, y: 300 }, { id: 9, x: 300, y: 300 },
];

const CLASSIC: PuzzleConfig = {
  type: 'classic',
  name: 'Classic Puzzle',
  dots: CLASSIC_DOTS,
  maxLines: 4,
  gridMin: 100,
  gridMax: 300,
  hintText: 'Your lines can go outside the dot grid boundary — the dashed box is not a limit.',
  hintLine: [{ x: 300, y: 100 }, { x: 0, y: 400 }],
  solutionPath: [
    { x: 100, y: 300 },
    { x: 400, y: 300 },
    { x: 100, y: 0 },
    { x: 100, y: 300 },
    { x: 300, y: 100 },
  ],
};

// Grid Sixteen — 4×4, 16 dots, 6 lines
const GRID16: PuzzleConfig = {
  type: 'grid16',
  name: 'Grid Sixteen',
  dots: Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    x: 80 + (i % 4) * 80,
    y: 80 + Math.floor(i / 4) * 80,
  })),
  maxLines: 6,
  gridMin: 80,
  gridMax: 320,
  hintText: 'Your lines can go outside the dot grid boundary — the dashed box is not a limit.',
  hintLine: [{ x: 320, y: 80 }, { x: 0, y: 400 }],
  solutionPath: [
    { x: 80, y: 320 },
    { x: 400, y: 320 },
    { x: 80, y: 0 },
    { x: 80, y: 320 },
    { x: 320, y: 80 },
    { x: 320, y: 400 },
    { x: 80, y: 80 },
  ],
};

// Star Path — 5 outer + 1 center, 5 lines
const STAR: PuzzleConfig = {
  type: 'star',
  name: 'Star Path',
  dots: [
    { id: 1, x: 200, y: 60 },
    { id: 2, x: 330, y: 160 },
    { id: 3, x: 290, y: 310 },
    { id: 4, x: 110, y: 310 },
    { id: 5, x: 70, y: 160 },
    { id: 6, x: 200, y: 200 },
  ],
  maxLines: 5,
  gridMin: 70,
  gridMax: 330,
  hintText: 'Your lines can go outside the dot grid boundary — the dashed box is not a limit.',
  hintLine: [{ x: 200, y: 60 }, { x: 290, y: 310 }],
  solutionPath: [
    { x: 200, y: 60 },
    { x: 290, y: 310 },
    { x: 70, y: 160 },
    { x: 330, y: 160 },
    { x: 110, y: 310 },
    { x: 200, y: 60 },
  ],
};

// Cross Out — cross shape, 9 dots, 5 lines
const CROSS: PuzzleConfig = {
  type: 'cross',
  name: 'Cross Out',
  dots: [
    { id: 1, x: 200, y: 60 },
    { id: 2, x: 200, y: 140 },
    { id: 3, x: 200, y: 220 },
    { id: 4, x: 200, y: 300 },
    { id: 5, x: 200, y: 380 },
    { id: 6, x: 60, y: 220 },
    { id: 7, x: 120, y: 220 },
    { id: 8, x: 280, y: 220 },
    { id: 9, x: 340, y: 220 },
  ],
  maxLines: 5,
  gridMin: 60,
  gridMax: 380,
  hintText: 'Your lines can go outside the dot grid boundary — the dashed box is not a limit.',
  hintLine: [{ x: 340, y: 220 }, { x: 60, y: 220 }],
  solutionPath: [
    { x: 60, y: 220 },
    { x: 340, y: 220 },
    { x: 200, y: 60 },
    { x: 200, y: 380 },
    { x: 340, y: 220 },
    { x: 60, y: 220 },
  ],
};

export const PUZZLE_CONFIGS: Record<string, PuzzleConfig> = {
  classic: CLASSIC,
  grid16: GRID16,
  star: STAR,
  cross: CROSS,
};

export function getPuzzleConfig(type: string): PuzzleConfig {
  return PUZZLE_CONFIGS[type] || CLASSIC;
}

// ─── PUZZLE CHALLENGES ───
// 50 challenges with varying difficulty, rules, and puzzle types

export const PUZZLE_CHALLENGES: PuzzleChallenge[] = [
  // 1-5: Classic warm-ups
  { id: 1, config: CLASSIC, difficulty: 'easy', title: 'The Classic', description: 'Connect all 9 dots with 4 lines', xpReward: 10, hintsAllowed: true },
  { id: 2, config: CLASSIC, difficulty: 'easy', title: 'Try Again', description: 'Solve the classic — different starting corner', xpReward: 10, hintsAllowed: true },
  { id: 3, config: CLASSIC, difficulty: 'medium', title: 'Speed Run', description: 'Solve the 9 dots in under 60 seconds', xpReward: 25, timed: 60, hintsAllowed: true },
  { id: 4, config: CLASSIC, difficulty: 'medium', title: 'No Help', description: 'Solve the classic without hints', xpReward: 25, hintsAllowed: false },
  { id: 5, config: CLASSIC, difficulty: 'hard', title: 'Lightning Round', description: 'Solve in under 30 seconds — no hints!', xpReward: 50, timed: 30, hintsAllowed: false },

  // 6-10: Star puzzles
  { id: 6, config: STAR, difficulty: 'easy', title: 'Star Gazer', description: 'Trace the star path with 5 lines', xpReward: 10, hintsAllowed: true },
  { id: 7, config: STAR, difficulty: 'medium', title: 'Star Sprint', description: 'Solve the star in under 45 seconds', xpReward: 25, timed: 45, hintsAllowed: true },
  { id: 8, config: STAR, difficulty: 'medium', title: 'Blind Star', description: 'Star path without hints', xpReward: 25, hintsAllowed: false },
  { id: 9, config: STAR, difficulty: 'hard', title: 'Star Blitz', description: 'Star in under 20 seconds — no hints', xpReward: 50, timed: 20, hintsAllowed: false },
  { id: 10, config: STAR, difficulty: 'easy', title: 'Star Revisit', description: 'Practice the star path again', xpReward: 10, hintsAllowed: true },

  // 11-15: Cross puzzles
  { id: 11, config: CROSS, difficulty: 'easy', title: 'Cross Start', description: 'Connect all 9 cross dots with 5 lines', xpReward: 10, hintsAllowed: true },
  { id: 12, config: CROSS, difficulty: 'medium', title: 'Cross Timed', description: 'Solve the cross in under 60 seconds', xpReward: 25, timed: 60, hintsAllowed: true },
  { id: 13, config: CROSS, difficulty: 'medium', title: 'Cross Solo', description: 'Cross without hints', xpReward: 25, hintsAllowed: false },
  { id: 14, config: CROSS, difficulty: 'hard', title: 'Cross Dash', description: 'Cross in under 25 seconds, no hints', xpReward: 50, timed: 25, hintsAllowed: false },
  { id: 15, config: CROSS, difficulty: 'easy', title: 'Cross Warm-up', description: 'Practice the cross once more', xpReward: 10, hintsAllowed: true },

  // 16-20: Grid 16 puzzles
  { id: 16, config: GRID16, difficulty: 'medium', title: 'Grid Sixteen', description: '16 dots, 6 lines — think big', xpReward: 25, hintsAllowed: true },
  { id: 17, config: GRID16, difficulty: 'medium', title: 'Grid Timed', description: 'Grid 16 in under 90 seconds', xpReward: 25, timed: 90, hintsAllowed: true },
  { id: 18, config: GRID16, difficulty: 'hard', title: 'Grid No Hints', description: 'Grid 16 without any hints', xpReward: 50, hintsAllowed: false },
  { id: 19, config: GRID16, difficulty: 'hard', title: 'Grid Rush', description: 'Grid 16 in under 45 seconds', xpReward: 50, timed: 45, hintsAllowed: false },
  { id: 20, config: GRID16, difficulty: 'easy', title: 'Grid Practice', description: 'Practice Grid 16 at your pace', xpReward: 10, hintsAllowed: true },

  // 21-30: Mixed difficulty ramp
  { id: 21, config: CLASSIC, difficulty: 'easy', title: 'Back to Basics', description: 'Classic 9 dots revisited', xpReward: 10, hintsAllowed: true },
  { id: 22, config: STAR, difficulty: 'medium', title: 'Star Challenge', description: 'Star path — show your skills', xpReward: 25, hintsAllowed: true },
  { id: 23, config: CROSS, difficulty: 'medium', title: 'Cross Challenge', description: 'Cross — can you still do it?', xpReward: 25, hintsAllowed: true },
  { id: 24, config: GRID16, difficulty: 'hard', title: 'Grid Master', description: 'Grid 16 — prove your mastery', xpReward: 50, hintsAllowed: false },
  { id: 25, config: CLASSIC, difficulty: 'hard', title: 'Classic Blitz', description: '9 dots, 15 seconds, no hints', xpReward: 50, timed: 15, hintsAllowed: false },
  { id: 26, config: STAR, difficulty: 'easy', title: 'Star Easy', description: 'Relax with the star path', xpReward: 10, hintsAllowed: true },
  { id: 27, config: CROSS, difficulty: 'hard', title: 'Cross Expert', description: 'Cross in under 20 seconds', xpReward: 50, timed: 20, hintsAllowed: false },
  { id: 28, config: CLASSIC, difficulty: 'medium', title: 'Classic Recall', description: 'No hints — can you remember?', xpReward: 25, hintsAllowed: false },
  { id: 29, config: GRID16, difficulty: 'medium', title: 'Grid Recall', description: 'Grid 16 — no hints this time', xpReward: 25, hintsAllowed: false },
  { id: 30, config: STAR, difficulty: 'hard', title: 'Star Master', description: 'Star in 15 seconds — ultimate test', xpReward: 50, timed: 15, hintsAllowed: false },

  // 31-40
  { id: 31, config: CLASSIC, difficulty: 'easy', title: 'Warm-up Round', description: 'Easy classic to start fresh', xpReward: 10, hintsAllowed: true },
  { id: 32, config: CROSS, difficulty: 'easy', title: 'Cross Easy', description: 'Cross with full hints', xpReward: 10, hintsAllowed: true },
  { id: 33, config: GRID16, difficulty: 'easy', title: 'Grid Intro', description: 'Grid 16 with hints', xpReward: 10, hintsAllowed: true },
  { id: 34, config: CLASSIC, difficulty: 'medium', title: 'Classic 45s', description: 'Solve classic in 45 seconds', xpReward: 25, timed: 45, hintsAllowed: true },
  { id: 35, config: STAR, difficulty: 'medium', title: 'Star 30s', description: 'Star path in 30 seconds', xpReward: 25, timed: 30, hintsAllowed: true },
  { id: 36, config: CROSS, difficulty: 'medium', title: 'Cross 40s', description: 'Cross in 40 seconds', xpReward: 25, timed: 40, hintsAllowed: true },
  { id: 37, config: GRID16, difficulty: 'hard', title: 'Grid Sprint', description: 'Grid 16 in 30 seconds', xpReward: 50, timed: 30, hintsAllowed: false },
  { id: 38, config: CLASSIC, difficulty: 'hard', title: 'Classic 10s', description: '9 dots in 10 seconds!', xpReward: 50, timed: 10, hintsAllowed: false },
  { id: 39, config: STAR, difficulty: 'hard', title: 'Star Ultra', description: 'Star in 10 seconds', xpReward: 50, timed: 10, hintsAllowed: false },
  { id: 40, config: CROSS, difficulty: 'hard', title: 'Cross Ultra', description: 'Cross in 15 seconds', xpReward: 50, timed: 15, hintsAllowed: false },

  // 41-50
  { id: 41, config: CLASSIC, difficulty: 'easy', title: 'Classic Chill', description: 'No pressure classic', xpReward: 10, hintsAllowed: true },
  { id: 42, config: STAR, difficulty: 'easy', title: 'Star Chill', description: 'No pressure star', xpReward: 10, hintsAllowed: true },
  { id: 43, config: CROSS, difficulty: 'easy', title: 'Cross Chill', description: 'No pressure cross', xpReward: 10, hintsAllowed: true },
  { id: 44, config: GRID16, difficulty: 'easy', title: 'Grid Chill', description: 'No pressure grid', xpReward: 10, hintsAllowed: true },
  { id: 45, config: CLASSIC, difficulty: 'medium', title: 'Classic Mix', description: 'Classic with 50s timer', xpReward: 25, timed: 50, hintsAllowed: false },
  { id: 46, config: STAR, difficulty: 'medium', title: 'Star Mix', description: 'Star with 35s timer', xpReward: 25, timed: 35, hintsAllowed: false },
  { id: 47, config: CROSS, difficulty: 'medium', title: 'Cross Mix', description: 'Cross with 35s timer', xpReward: 25, timed: 35, hintsAllowed: false },
  { id: 48, config: GRID16, difficulty: 'hard', title: 'Grid Endgame', description: 'Grid 16 — final boss, 25s', xpReward: 50, timed: 25, hintsAllowed: false },
  { id: 49, config: CLASSIC, difficulty: 'hard', title: 'Grand Finale', description: 'Classic 9 dots — 8 seconds!', xpReward: 50, timed: 8, hintsAllowed: false },
  { id: 50, config: GRID16, difficulty: 'hard', title: 'Ultimate Grid', description: 'Grid 16, 20s, no hints — legend', xpReward: 50, timed: 20, hintsAllowed: false },
];

export const TOTAL_PUZZLES = PUZZLE_CHALLENGES.length;

export function getPuzzleChallenge(index: number): PuzzleChallenge {
  return PUZZLE_CHALLENGES[Math.min(index, PUZZLE_CHALLENGES.length - 1)];
}
