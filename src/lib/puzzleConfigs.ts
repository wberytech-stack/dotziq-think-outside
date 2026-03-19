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
  timed?: number;
  hintsAllowed: boolean;
  dotCount: number;
  rules: string[];
}

// ─── HELPERS ───

function polygon(n: number, cx: number, cy: number, r: number, rotDeg = -90): [number, number][] {
  const rot = (rotDeg * Math.PI) / 180;
  return Array.from({ length: n }, (_, i) => {
    const angle = rot + (2 * Math.PI * i) / n;
    return [Math.round(cx + r * Math.cos(angle)), Math.round(cy + r * Math.sin(angle))] as [number, number];
  });
}

function star(points: number, cx: number, cy: number, outerR: number, innerR: number): [number, number][] {
  const result: [number, number][] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = -Math.PI / 2 + (Math.PI * i) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    result.push([Math.round(cx + r * Math.cos(angle)), Math.round(cy + r * Math.sin(angle))]);
  }
  return result;
}

function gridPoints(rows: number, cols: number, cx: number, cy: number, spacing: number): [number, number][] {
  const x0 = cx - ((cols - 1) * spacing) / 2;
  const y0 = cy - ((rows - 1) * spacing) / 2;
  const dots: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      dots.push([Math.round(x0 + c * spacing), Math.round(y0 + r * spacing)]);
  return dots;
}

function makeDots(points: [number, number][]): Dot[] {
  return points.map((p, i) => ({ id: i + 1, x: p[0], y: p[1] }));
}

function makeConfig(
  type: string, name: string, points: [number, number][], maxLines: number,
  solutionPoints?: [number, number][]
): PuzzleConfig {
  const dots = makeDots(points);
  const xs = dots.map(d => d.x), ys = dots.map(d => d.y);
  const gMin = Math.min(...xs, ...ys);
  const gMax = Math.max(...xs, ...ys);
  const solPts = solutionPoints || points;
  const solutionPath = solPts.map(p => ({ x: p[0], y: p[1] }));
  return {
    type, name, dots, maxLines,
    gridMin: gMin, gridMax: gMax,
    hintText: 'Connect all the dots! Your lines can go outside the dashed box.',
    hintLine: dots.length >= 2 ? [{ x: dots[0].x, y: dots[0].y }, { x: dots[1].x, y: dots[1].y }] : null,
    solutionPath,
  };
}

function gridZigzagSolution(rows: number, cols: number, cx: number, cy: number, spacing: number): [number, number][] {
  const x0 = cx - ((cols - 1) * spacing) / 2;
  const y0 = cy - ((rows - 1) * spacing) / 2;
  const path: [number, number][] = [];
  for (let r = rows - 1; r >= 0; r--) {
    const y = y0 + r * spacing;
    const leftToRight = (rows - 1 - r) % 2 === 0;
    if (leftToRight) {
      path.push([x0, y]);
      path.push([x0 + (cols - 1) * spacing, y]);
    } else {
      path.push([x0 + (cols - 1) * spacing, y]);
      path.push([x0, y]);
    }
  }
  // Remove duplicate consecutive points
  return path.filter((p, i) => i === 0 || p[0] !== path[i - 1][0] || p[1] !== path[i - 1][1]);
}

function makeChallenge(
  id: number, config: PuzzleConfig, difficulty: Difficulty,
  title: string, description: string, xpReward: number,
  opts: { timed?: number; hintsAllowed?: boolean; rules?: string[] } = {}
): PuzzleChallenge {
  const rules: string[] = opts.rules || [];
  if (opts.timed) rules.push(`⏱ ${opts.timed}s time limit`);
  if (opts.hintsAllowed === false) rules.push('🚫 No hints');
  return {
    id, config, difficulty, title, description, xpReward,
    timed: opts.timed,
    hintsAllowed: opts.hintsAllowed !== false,
    dotCount: config.dots.length,
    rules,
  };
}

// ─── EXPLORER MODE (Kids Grade 1-6) ───
// 50 levels of varied dot arrangements — colorful, encouraging, no timer

function generateExplorerChallenges(): PuzzleChallenge[] {
  const C = 200; // center
  const challenges: PuzzleChallenge[] = [];
  let id = 0;

  const add = (
    name: string, desc: string, pts: [number, number][], maxLines: number,
    diff: Difficulty, xp: number, solPts?: [number, number][]
  ) => {
    id++;
    const config = makeConfig('explorer', name, pts, maxLines, solPts);
    challenges.push(makeChallenge(id, config, diff, name, desc, xp));
  };

  // Levels 1-10: Simple shapes (3-4 dots)
  add('Big Triangle', 'Connect 3 dots to form a triangle!', polygon(3, C, C, 100), 2, 'easy', 10);
  add('Small Triangle', 'A tiny triangle — easy!', polygon(3, C, C, 70), 2, 'easy', 10);
  add('Square', 'Draw a square path', polygon(4, C, C, 90, -45), 3, 'easy', 10);
  add('Diamond', 'A sparkling diamond shape', polygon(4, C, C, 100), 3, 'easy', 10);
  add('Flat Line', 'Connect 3 dots in a row', [[100, 200], [200, 200], [300, 200]], 2, 'easy', 10);
  add('Tall Line', '3 dots going up', [[200, 100], [200, 200], [200, 300]], 2, 'easy', 10);
  add('Diagonal', 'Slanted line of dots', [[120, 280], [200, 200], [280, 120]], 2, 'easy', 10);
  add('Right Angle', 'An L-shaped corner', [[120, 120], [120, 280], [280, 280]], 2, 'easy', 10);
  add('Zigzag', 'A zigzag path!', [[100, 280], [200, 120], [300, 280]], 2, 'easy', 10);
  add('Wide V', 'A wide V shape', [[100, 120], [200, 300], [300, 120]], 2, 'easy', 10);

  // Levels 11-20: Medium shapes (4-5 dots)
  add('Pentagon', 'Five-sided wonder', polygon(5, C, C, 100), 4, 'easy', 10);
  add('House Shape', 'Draw a house!',
    [[130, 300], [130, 180], [200, 100], [270, 180], [270, 300]], 4, 'easy', 10);
  add('Arrow Right', 'An arrow pointing right',
    [[100, 200], [220, 200], [220, 130], [320, 200], [220, 270]], 4, 'easy', 10,
    [[100, 200], [220, 200], [220, 130], [320, 200], [220, 270]]);
  add('Letter T', 'The letter T!',
    [[120, 120], [200, 120], [280, 120], [200, 200], [200, 300]], 4, 'easy', 10);
  add('Plus Sign', 'A plus shape',
    [[200, 100], [300, 200], [200, 300], [100, 200], [200, 200]], 4, 'easy', 10);
  add('Kite', 'Fly a kite!',
    [[200, 80], [280, 200], [200, 320], [120, 200]], 3, 'easy', 10);
  add('Star Trail', 'Follow the star!', polygon(5, C, C, 110), 4, 'easy', 10,
    (() => { const p = polygon(5, C, C, 110); return [p[0], p[2], p[4], p[1], p[3]]; })());
  add('Bowtie', 'Looks like a bowtie!',
    [[120, 120], [280, 120], [200, 200], [120, 280], [280, 280]], 4, 'easy', 15);
  add('Crown', 'A royal crown!',
    [[100, 280], [140, 140], [200, 220], [260, 140], [300, 280]], 4, 'easy', 15);
  add('Wave', 'Ride the wave!',
    [[80, 200], [150, 120], [220, 200], [290, 120], [360, 200]], 4, 'easy', 15);

  // Levels 21-30: Bigger shapes (5-6 dots)
  add('Hexagon', 'Six sides!', polygon(6, C, C, 100), 5, 'medium', 25);
  add('Big Star', 'A six-pointed star', polygon(6, C, C, 110), 5, 'medium', 25,
    (() => { const p = polygon(6, C, C, 110); return [p[0], p[3], p[1], p[4], p[2], p[5]]; })());
  add('Big Cross', 'A plus with 6 dots',
    [[200, 80], [200, 160], [200, 240], [200, 320], [120, 200], [280, 200]], 5, 'medium', 25,
    [[200, 80], [200, 320], [120, 200], [280, 200], [200, 160], [200, 240]]);
  add('Letter W', 'Write a W!',
    [[80, 120], [140, 300], [200, 180], [260, 300], [320, 120]], 4, 'medium', 25);
  add('Letter M', 'Write an M!',
    [[80, 300], [80, 120], [200, 220], [320, 120], [320, 300]], 4, 'medium', 25);
  add('Double Diamond', 'Two diamonds!',
    [[200, 80], [280, 160], [200, 240], [120, 160], [280, 320], [120, 320]], 5, 'medium', 25);
  add('Fish', 'A fish shape',
    [[100, 200], [180, 140], [260, 140], [320, 200], [260, 260], [180, 260]], 5, 'medium', 25);
  add('Heart', 'A heart!',
    [[200, 300], [120, 200], [140, 120], [200, 160], [260, 120], [280, 200]], 5, 'medium', 25);
  add('Arrow Up', 'Pointing to the sky!',
    [[200, 80], [120, 180], [280, 180], [160, 180], [160, 320], [240, 320]], 5, 'medium', 25,
    [[200, 80], [120, 180], [160, 180], [160, 320], [240, 320], [280, 180]]);
  add('Moon Shape', 'A crescent moon',
    [[220, 100], [280, 160], [300, 240], [260, 310], [180, 330], [120, 280]], 5, 'medium', 25);

  // Levels 31-40: Complex shapes (6-8 dots)
  add('Heptagon', 'Seven sides!', polygon(7, C, C, 110), 6, 'medium', 25);
  add('Octagon', 'Eight sides!', polygon(8, C, C, 110), 7, 'medium', 25);
  add('Double Triangle', 'Star of David',
    (() => {
      const t1 = polygon(3, C, C - 10, 100);
      const t2 = polygon(3, C, C + 10, 100, 90);
      return [...t1, ...t2];
    })(), 5, 'medium', 25,
    (() => {
      const t1 = polygon(3, C, C - 10, 100);
      const t2 = polygon(3, C, C + 10, 100, 90);
      return [t1[0], t2[1], t1[1], t2[2], t1[2], t2[0]];
    })());
  add('Butterfly', 'Beautiful wings!',
    [[200, 120], [120, 100], [80, 200], [120, 300], [200, 280], [280, 300], [320, 200], [280, 100]], 7, 'medium', 25);
  add('Lightning', 'Lightning bolt!',
    [[160, 80], [260, 80], [180, 180], [260, 180], [140, 320], [220, 320], [140, 180]], 6, 'medium', 25);
  add('Spiral Path', 'Follow the spiral',
    [[200, 80], [300, 140], [320, 260], [240, 320], [140, 300], [100, 200], [160, 140]], 6, 'medium', 25);
  add('Rocket Ship', 'Blast off!',
    [[200, 60], [240, 140], [240, 280], [280, 340], [120, 340], [160, 280], [160, 140]], 6, 'hard', 50);
  add('Snowflake', 'Winter wonder',
    [[200, 80], [280, 140], [280, 260], [200, 320], [120, 260], [120, 140], [200, 200]], 6, 'hard', 50);
  add('Music Note', 'Musical dots',
    [[240, 80], [240, 160], [240, 240], [240, 320], [180, 280], [160, 200], [200, 160], [300, 120]], 7, 'hard', 50);
  add('Compass', 'Find your way!',
    [[200, 60], [260, 140], [340, 200], [260, 260], [200, 340], [140, 260], [60, 200], [140, 140]], 7, 'hard', 50);

  // Levels 41-50: Challenge shapes (8-10 dots)
  add('Grid 3×3', 'Connect all 9 dots!', gridPoints(3, 3, C, C, 100), 8, 'hard', 50,
    gridZigzagSolution(3, 3, C, C, 100));
  add('Diamond Ring', 'A ring of diamonds',
    [[200, 60], [280, 100], [320, 180], [300, 280], [220, 320], [120, 300], [80, 200], [120, 100], [200, 180]], 8, 'hard', 50);
  add('Maze Path', 'Navigate the maze!',
    [[100, 100], [200, 100], [300, 100], [300, 200], [200, 200], [100, 200], [100, 300], [200, 300], [300, 300]], 8, 'hard', 50);
  add('Galaxy Spiral', 'Explore the galaxy!',
    [[200, 80], [300, 100], [340, 180], [320, 280], [240, 330], [140, 320], [80, 240], [100, 140], [180, 100], [200, 200]], 9, 'hard', 50);
  add('Crystal', 'A crystal formation',
    [[200, 60], [280, 120], [320, 220], [260, 320], [200, 260], [140, 320], [80, 220], [120, 120], [200, 160]], 8, 'hard', 50);
  add('Constellation', 'Connect the stars!',
    [[120, 80], [280, 80], [340, 180], [300, 300], [200, 340], [100, 300], [60, 180], [160, 200], [240, 200], [200, 120]], 9, 'hard', 50);
  add('Dragon', 'Draw a dragon!',
    [[120, 100], [200, 60], [280, 100], [320, 200], [280, 300], [200, 340], [120, 300], [80, 200], [160, 160], [240, 240]], 9, 'hard', 50);
  add('Tree of Life', 'A sacred tree',
    [[200, 60], [140, 140], [260, 140], [120, 220], [200, 220], [280, 220], [100, 300], [180, 300], [220, 300], [300, 300]], 9, 'hard', 50);
  add('Shield', 'A warrior\'s shield',
    [[200, 60], [300, 100], [340, 200], [300, 300], [200, 340], [100, 300], [60, 200], [100, 100], [200, 180], [200, 280]], 9, 'hard', 50);
  add('Galaxy Boss', 'The final Explorer challenge!',
    [[200, 40], [300, 80], [360, 160], [340, 280], [260, 340], [160, 360], [60, 300], [40, 180], [100, 80], [200, 200]], 9, 'hard', 50);

  return challenges;
}

// ─── CHALLENGER MODE (Grade 7-10) ───
// 50 levels on classic 9-dot grid with increasing constraints

const CLASSIC_GRID = gridPoints(3, 3, 200, 200, 100);
const CLASSIC_SOLUTION: [number, number][] = [
  [100, 300], [400, 300], [100, 0], [100, 300], [300, 100],
];

function generateChallengerChallenges(): PuzzleChallenge[] {
  const challenges: PuzzleChallenge[] = [];

  interface LevelDef {
    title: string;
    desc: string;
    maxLines: number;
    diff: Difficulty;
    xp: number;
    timed?: number;
    hints: boolean;
  }

  const levels: LevelDef[] = [
    // 1-4: Warm-up with 5 lines (very easy)
    { title: 'First Steps', desc: '5 lines to connect 9 dots — warm up!', maxLines: 5, diff: 'easy', xp: 10, hints: true },
    { title: 'Easy Start', desc: 'Still 5 lines — get comfortable', maxLines: 5, diff: 'easy', xp: 10, hints: true },
    { title: 'Warming Up', desc: '5 lines, but try to be quick!', maxLines: 5, diff: 'easy', xp: 10, hints: true },
    { title: 'Smooth Flow', desc: '5 lines — find your rhythm', maxLines: 5, diff: 'easy', xp: 10, hints: true },
    // 5-9: Classic 4 lines
    { title: 'The Classic', desc: '4 lines to connect 9 dots — think outside the box!', maxLines: 4, diff: 'medium', xp: 25, hints: true },
    { title: 'Box Breaker', desc: '4 lines — your lines can extend past the dots', maxLines: 4, diff: 'medium', xp: 25, hints: true },
    { title: 'Line Master', desc: '4 lines — fewer is harder', maxLines: 4, diff: 'medium', xp: 25, hints: true },
    { title: 'Classic Redux', desc: '4 lines — you know what to do', maxLines: 4, diff: 'medium', xp: 25, hints: true },
    { title: 'Confidence', desc: '4 lines — prove you\'ve mastered it', maxLines: 4, diff: 'medium', xp: 25, hints: true },
    // 10-14: 4 lines, no hints
    { title: 'No Training Wheels', desc: '4 lines, no hints — from memory!', maxLines: 4, diff: 'medium', xp: 25, hints: false },
    { title: 'Brain Power', desc: 'Pure thinking — 4 lines, no hints', maxLines: 4, diff: 'medium', xp: 25, hints: false },
    { title: 'Mental Map', desc: 'Visualize the solution — no help', maxLines: 4, diff: 'medium', xp: 25, hints: false },
    { title: 'Solo Solver', desc: 'You\'re on your own — 4 lines', maxLines: 4, diff: 'medium', xp: 25, hints: false },
    { title: 'Self Reliant', desc: '4 lines, no hints — becoming a pro', maxLines: 4, diff: 'medium', xp: 25, hints: false },
    // 15-19: 4 lines with timer
    { title: 'Speed Round', desc: '4 lines in 60 seconds!', maxLines: 4, diff: 'medium', xp: 25, timed: 60, hints: true },
    { title: 'Quick Thinking', desc: '4 lines in 50 seconds', maxLines: 4, diff: 'medium', xp: 25, timed: 50, hints: true },
    { title: 'Fast Fingers', desc: '4 lines in 45 seconds', maxLines: 4, diff: 'hard', xp: 50, timed: 45, hints: true },
    { title: 'Time Crunch', desc: '4 lines in 40 seconds', maxLines: 4, diff: 'hard', xp: 50, timed: 40, hints: true },
    { title: 'Speed Demon', desc: '4 lines in 35 seconds!', maxLines: 4, diff: 'hard', xp: 50, timed: 35, hints: true },
    // 20-24: No hints + various
    { title: 'Lockout', desc: '4 lines, no hints — pure skill', maxLines: 4, diff: 'hard', xp: 50, hints: false },
    { title: 'Timer + No Hints', desc: '4 lines, 60s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 60, hints: false },
    { title: 'Pressure Cooker', desc: '4 lines, 50s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 50, hints: false },
    { title: 'Under Pressure', desc: '4 lines, 45s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 45, hints: false },
    { title: 'Heat Wave', desc: '4 lines, 40s, no hints!', maxLines: 4, diff: 'hard', xp: 50, timed: 40, hints: false },
    // 25-34: Tighter time + no hints
    { title: 'Sprint 35', desc: '4 lines in 35 seconds, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 35, hints: false },
    { title: 'Sprint 30', desc: '4 lines in 30 seconds, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 30, hints: false },
    { title: 'Blitz 28', desc: '4 lines, 28 seconds!', maxLines: 4, diff: 'hard', xp: 50, timed: 28, hints: false },
    { title: 'Blitz 25', desc: '4 lines, 25 seconds!', maxLines: 4, diff: 'hard', xp: 50, timed: 25, hints: false },
    { title: 'Lightning 22', desc: '22 seconds — lightning reflexes!', maxLines: 4, diff: 'hard', xp: 50, timed: 22, hints: false },
    { title: 'Lightning 20', desc: '20 seconds flat!', maxLines: 4, diff: 'hard', xp: 50, timed: 20, hints: false },
    { title: 'Warp Speed 18', desc: '18 seconds — are you fast enough?', maxLines: 4, diff: 'hard', xp: 50, timed: 18, hints: false },
    { title: 'Warp Speed 16', desc: '16 seconds!', maxLines: 4, diff: 'hard', xp: 50, timed: 16, hints: false },
    { title: 'Insane 14', desc: '14 seconds — nearly impossible!', maxLines: 4, diff: 'hard', xp: 50, timed: 14, hints: false },
    { title: 'Insane 12', desc: '12 seconds — superhuman speed!', maxLines: 4, diff: 'hard', xp: 50, timed: 12, hints: false },
    // 35-44: Mix of tight constraints
    { title: 'Zen Master', desc: '4 lines, no hints, your pace', maxLines: 4, diff: 'medium', xp: 25, hints: false },
    { title: 'Quick Zen', desc: '4 lines, 45s, hints allowed', maxLines: 4, diff: 'medium', xp: 25, timed: 45, hints: true },
    { title: 'Timed Mastery', desc: '4 lines, 30s, hints allowed', maxLines: 4, diff: 'hard', xp: 50, timed: 30, hints: true },
    { title: 'Cold Start', desc: '4 lines, 40s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 40, hints: false },
    { title: 'Gauntlet 1', desc: '4 lines, 25s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 25, hints: false },
    { title: 'Gauntlet 2', desc: '4 lines, 22s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 22, hints: false },
    { title: 'Gauntlet 3', desc: '4 lines, 20s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 20, hints: false },
    { title: 'Gauntlet 4', desc: '4 lines, 18s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 18, hints: false },
    { title: 'Gauntlet 5', desc: '4 lines, 15s, no hints', maxLines: 4, diff: 'hard', xp: 50, timed: 15, hints: false },
    { title: 'Gauntlet Final', desc: '4 lines, 12s, no hints!', maxLines: 4, diff: 'hard', xp: 50, timed: 12, hints: false },
    // 45-50: Ultimate challenges
    { title: 'Elite 1', desc: '4 lines, 10 seconds!', maxLines: 4, diff: 'hard', xp: 50, timed: 10, hints: false },
    { title: 'Elite 2', desc: '4 lines, 10 seconds — consistency!', maxLines: 4, diff: 'hard', xp: 50, timed: 10, hints: false },
    { title: 'Elite 3', desc: '4 lines, 8 seconds!', maxLines: 4, diff: 'hard', xp: 50, timed: 8, hints: false },
    { title: 'Legend', desc: '4 lines, 8 seconds — legendary', maxLines: 4, diff: 'hard', xp: 50, timed: 8, hints: false },
    { title: 'Mythic', desc: '4 lines, 6 seconds — mythic level!', maxLines: 4, diff: 'hard', xp: 50, timed: 6, hints: false },
    { title: 'Challenger Champion', desc: '4 lines, 5 seconds — the ultimate!', maxLines: 4, diff: 'hard', xp: 50, timed: 5, hints: false },
  ];

  levels.forEach((l, i) => {
    const config = makeConfig('challenger', l.title, CLASSIC_GRID, l.maxLines, CLASSIC_SOLUTION);
    challenges.push(makeChallenge(i + 1, config, l.diff, l.title, l.desc, l.xp, {
      timed: l.timed, hintsAllowed: l.hints,
    }));
  });

  return challenges;
}

// ─── PRO MODE (Adults) ───
// 50 levels of expanding grids

interface ProGridDef {
  rows: number;
  cols: number;
  spacing: number;
  maxLines: number;
}

const PRO_GRID_TIERS: { range: [number, number]; rows: number; cols: number; spacing: number; maxLines: number }[] = [
  { range: [1, 10], rows: 3, cols: 3, spacing: 100, maxLines: 4 },    // 9 dots
  { range: [11, 20], rows: 3, cols: 4, spacing: 80, maxLines: 7 },    // 12 dots
  { range: [21, 30], rows: 4, cols: 4, spacing: 75, maxLines: 6 },    // 16 dots
  { range: [31, 40], rows: 4, cols: 5, spacing: 65, maxLines: 9 },    // 20 dots
  { range: [41, 50], rows: 5, cols: 5, spacing: 55, maxLines: 8 },    // 25 dots
];

function generateProChallenges(): PuzzleChallenge[] {
  const challenges: PuzzleChallenge[] = [];
  const C = 200;

  for (const tier of PRO_GRID_TIERS) {
    const { rows, cols, spacing, maxLines } = tier;
    const dotCount = rows * cols;
    const gridPts = gridPoints(rows, cols, C, C, spacing);
    const solution = rows === 3 && cols === 3
      ? CLASSIC_SOLUTION
      : gridZigzagSolution(rows, cols, C, C, spacing);

    for (let i = tier.range[0]; i <= tier.range[1]; i++) {
      const levelInTier = i - tier.range[0];
      const tierName = `${rows}×${cols}`;

      // Progressive constraints within each tier
      let timed: number | undefined;
      let hints = true;
      let diff: Difficulty = 'medium';
      let xp = 25;

      if (levelInTier >= 7) {
        timed = 30 - (levelInTier - 7) * 5;
        if (timed < 10) timed = 10;
        hints = false;
        diff = 'hard';
        xp = 50;
      } else if (levelInTier >= 5) {
        hints = false;
        diff = 'medium';
        xp = 25;
      } else if (levelInTier >= 3) {
        timed = 90 - levelInTier * 10;
        diff = 'medium';
        xp = 25;
      }

      const titles = [
        `${tierName} Intro`, `${tierName} Basics`, `${tierName} Flow`,
        `${tierName} Timed`, `${tierName} Quick`,
        `${tierName} Solo`, `${tierName} Focus`,
        `${tierName} Sprint`, `${tierName} Blitz`, `${tierName} Master`,
      ];

      const config = makeConfig('pro', titles[levelInTier] || `${tierName} Level`, gridPts, maxLines, solution);
      const desc = `${dotCount} dots, ${maxLines} lines — ${tierName} grid`;

      challenges.push(makeChallenge(i, config, diff, titles[levelInTier] || `Grid ${tierName}`, desc, xp, {
        timed, hintsAllowed: hints,
      }));
    }
  }

  return challenges;
}

// ─── EXPORTS ───

export const EXPLORER_CHALLENGES = generateExplorerChallenges();
export const CHALLENGER_CHALLENGES = generateChallengerChallenges();
export const PRO_CHALLENGES = generateProChallenges();

export const MODE_CHALLENGES: Record<string, PuzzleChallenge[]> = {
  kids: EXPLORER_CHALLENGES,
  student: CHALLENGER_CHALLENGES,
  pro: PRO_CHALLENGES,
};

export const PUZZLES_PER_MODE = 50;

export function getModeChallenges(mode: string): PuzzleChallenge[] {
  return MODE_CHALLENGES[mode] || EXPLORER_CHALLENGES;
}

export function getModeChallenge(mode: string, index: number): PuzzleChallenge {
  const challenges = getModeChallenges(mode);
  return challenges[Math.min(index, challenges.length - 1)];
}

// Legacy exports for backward compatibility
export const PUZZLE_CHALLENGES = CHALLENGER_CHALLENGES;
export const TOTAL_PUZZLES = PUZZLES_PER_MODE;
export function getPuzzleChallenge(index: number): PuzzleChallenge {
  return CHALLENGER_CHALLENGES[Math.min(index, CHALLENGER_CHALLENGES.length - 1)];
}
export function getPuzzleConfig(type: string) {
  return CHALLENGER_CHALLENGES[0].config;
}
