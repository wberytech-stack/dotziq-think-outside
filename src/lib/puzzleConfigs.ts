export interface Dot {
  id: number;
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
  hintLine: [{ x: number; y: number }, { x: number; y: number }] | null;
}

// Classic 3×3 — 9 dots, 4 lines
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
  hintText: 'Your lines can go outside the dot grid. Start from a corner and think beyond the square.',
  hintLine: [{ x: 100, y: 300 }, { x: 400, y: 300 }],
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
  hintText: 'With 16 dots you need 6 lines. Extend well beyond the grid corners!',
  hintLine: [{ x: 80, y: 320 }, { x: 420, y: 320 }],
};

// Star Path — 5 outer + 1 center, 2 lines (connect in one continuous stroke)
const STAR: PuzzleConfig = {
  type: 'star',
  name: 'Star Path',
  dots: [
    { id: 1, x: 200, y: 60 },   // top
    { id: 2, x: 330, y: 160 },  // top-right
    { id: 3, x: 290, y: 310 },  // bottom-right
    { id: 4, x: 110, y: 310 },  // bottom-left
    { id: 5, x: 70, y: 160 },   // top-left
    { id: 6, x: 200, y: 200 },  // center
  ],
  maxLines: 5,
  gridMin: 70,
  gridMax: 330,
  hintText: 'Trace a star shape — each line must connect two non-adjacent points through the center.',
  hintLine: [{ x: 200, y: 60 }, { x: 290, y: 310 }],
};

// Cross Out — cross shape, 9 dots, 5 lines
const CROSS: PuzzleConfig = {
  type: 'cross',
  name: 'Cross Out',
  dots: [
    // vertical bar
    { id: 1, x: 200, y: 60 },
    { id: 2, x: 200, y: 140 },
    { id: 3, x: 200, y: 220 },
    { id: 4, x: 200, y: 300 },
    { id: 5, x: 200, y: 380 },
    // horizontal bar (intersects at id:3)
    { id: 6, x: 60, y: 220 },
    { id: 7, x: 120, y: 220 },
    // id:3 is the center
    { id: 8, x: 280, y: 220 },
    { id: 9, x: 340, y: 220 },
  ],
  maxLines: 5,
  gridMin: 60,
  gridMax: 380,
  hintText: 'The cross shape has a wide spread. Use diagonal lines that extend past the cross tips.',
  hintLine: [{ x: 60, y: 220 }, { x: 340, y: 220 }],
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
