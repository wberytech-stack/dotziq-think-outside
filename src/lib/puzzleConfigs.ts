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

// Classic 3×3 — 9 dots, 4 lines
// Verified solution: (100,300)→(400,300)→(100,0)→(100,300)→(300,100)
// Line 1 hits 7,8,9 | Line 2 hits 6,2 | Line 3 hits 1,4 | Line 4 hits 5,3
const CLASSIC: PuzzleConfig = {
  type: 'classic',
  name: 'Classic Puzzle',
  dots: [
    { id: 1, x: 100, y: 100 }, { id: 2, x: 200, y: 100 }, { id: 3, x: 300, y: 100 },
    { id: 4, x: 100, y: 200 }, { id: 5, x: 200, y: 200 }, { id: 6, x: 300, y: 200 },
    { id: 7, x: 100, y: 300 }, { id: 8, x: 200, y: 300 }, { id: 9, x: 300, y: 300 },
  ],
  maxLines: 4,
  gridMin: 100,
  gridMax: 300,
  hintText: 'Your lines can go outside the dot grid boundary — the dashed box is not a limit.',
  // Hint 2: top-right dot diagonally down-left, extending below grid
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
