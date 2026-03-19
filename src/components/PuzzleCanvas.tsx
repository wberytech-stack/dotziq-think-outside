import React, { useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';

interface Dot {
  id: number;
  x: number;
  y: number;
}

interface Point {
  x: number;
  y: number;
}

const LINE_COLORS = ['#E94560', '#F5A623', '#0FD688', '#7C3AED', '#3B82F6'];

const CLASSIC_SOLUTION: Point[] = [
  { x: 300, y: 100 },
  { x: 100, y: 300 },
  { x: 300, y: 300 },
  { x: 100, y: 100 },
  { x: 100, y: 400 },
];

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function validateSolution(path: Point[], dots: Dot[]): boolean {
  if (path.length < 2) return false;
  const touched = new Set<number>();
  for (let i = 0; i < path.length - 1; i++) {
    dots.forEach(dot => {
      if (distToSegment(dot, path[i], path[i + 1]) < 20) {
        touched.add(dot.id);
      }
    });
  }
  return touched.size === dots.length;
}

interface PuzzleCanvasProps {
  dots: Dot[];
  maxLines: number;
  onSolve: (vertices: Point[]) => void;
  showHintLevel?: number;
}

export default function PuzzleCanvas({ dots, maxLines, onSolve, showHintLevel = 0 }: PuzzleCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { getThemeColors } = useApp();
  const theme = getThemeColors();

  // vertices = the anchor points. Each pair of consecutive vertices = one line segment.
  // Drawing state: user taps a dot to place first vertex, then drags freely.
  // On release: if near a dot, snap and commit segment. If max lines reached or solved, end.
  // Otherwise, next segment starts from that snapped dot automatically (pen stays down).
  const [vertices, setVertices] = useState<Point[]>([]);
  const [currentPos, setCurrentPos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [touchedDots, setTouchedDots] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);

  // Canvas coordinate system — dots are at 100,200,300 so we need padding for outside-the-box lines
  const viewBox = '-50 -50 500 500'; // allows drawing well outside the 100-300 grid

  const getSvgPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY) : e.clientY;
    // Map screen coords to SVG viewBox coords
    const svgX = ((clientX - rect.left) / rect.width) * 500 - 50;
    const svgY = ((clientY - rect.top) / rect.height) * 500 - 50;
    return { x: svgX, y: svgY };
  }, []);

  const snapToDot = useCallback((p: Point): Point | null => {
    for (const dot of dots) {
      if (Math.hypot(p.x - dot.x, p.y - dot.y) < 30) return { x: dot.x, y: dot.y };
    }
    return null;
  }, [dots]);

  const computeTouched = useCallback((path: Point[]) => {
    const t = new Set<number>();
    for (let i = 0; i < path.length - 1; i++) {
      dots.forEach(d => {
        if (distToSegment(d, path[i], path[i + 1]) < 20) t.add(d.id);
      });
    }
    return t;
  }, [dots]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (solved) return;
    const p = getSvgPoint(e);
    if (!p) return;

    // If no vertices yet, must tap on a dot to start
    if (vertices.length === 0) {
      const snapped = snapToDot(p);
      if (snapped) {
        setVertices([snapped]);
        setCurrentPos(snapped);
        setIsDrawing(true);
        setFeedback(null);
      }
    }
    // If already have vertices (continuing from last segment), start next line
    // This happens automatically since isDrawing stays true between segments
  }, [getSvgPoint, snapToDot, vertices, solved]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || solved) return;
    const p = getSvgPoint(e);
    if (p) {
      setCurrentPos(p);
      // Live update touched dots including the active line being drawn
      if (vertices.length > 0) {
        const livePath = [...vertices, p];
        setTouchedDots(computeTouched(livePath));
      }
    }
  }, [isDrawing, getSvgPoint, vertices, computeTouched, solved]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentPos || solved) return;

    // Try to snap end point — lines CAN go beyond the grid, but must end on a meaningful point
    // For the puzzle mechanic: user drags to place the endpoint. 
    // We allow any endpoint (even outside grid) to support "outside the box" thinking.
    const snapped = snapToDot(currentPos);
    const endPoint = snapped || currentPos; // Allow non-dot endpoints for outside-the-box lines

    if (vertices.length > 0) {
      const last = vertices[vertices.length - 1];
      // Minimum drag distance to count as a line
      if (Math.hypot(endPoint.x - last.x, endPoint.y - last.y) > 15) {
        const newVerts = [...vertices, endPoint];
        const lineCount = newVerts.length - 1;

        if (lineCount <= maxLines) {
          setVertices(newVerts);
          const touched = computeTouched(newVerts);
          setTouchedDots(touched);

          if (validateSolution(newVerts, dots)) {
            setSolved(true);
            setIsDrawing(false);
            setCurrentPos(null);
            onSolve(newVerts);
            return;
          }

          if (lineCount >= maxLines) {
            // Used all lines but didn't solve
            setIsDrawing(false);
            setCurrentPos(null);
            setFeedback('Not quite — all 9 dots must be connected. Try again!');
            return;
          }

          // More lines available — keep drawing from this endpoint
          // isDrawing stays true, next handleMove will draw from the new last vertex
          return;
        }
      }
    }
  }, [isDrawing, currentPos, vertices, maxLines, dots, snapToDot, computeTouched, onSolve, solved]);

  const reset = useCallback(() => {
    setVertices([]);
    setCurrentPos(null);
    setIsDrawing(false);
    setFeedback(null);
    setTouchedDots(new Set());
    setSolved(false);
  }, []);

  // Build line segments for rendering
  const lineSegments: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    lineSegments.push({
      x1: vertices[i].x, y1: vertices[i].y,
      x2: vertices[i + 1].x, y2: vertices[i + 1].y,
      color: LINE_COLORS[i % LINE_COLORS.length],
    });
  }

  // Active drawing line (from last vertex to current cursor)
  const activeLine = isDrawing && vertices.length > 0 && currentPos ? {
    x1: vertices[vertices.length - 1].x,
    y1: vertices[vertices.length - 1].y,
    x2: currentPos.x,
    y2: currentPos.y,
    color: LINE_COLORS[(vertices.length - 1) % LINE_COLORS.length],
  } : null;

  // Hint ghost lines
  const hintLines: typeof lineSegments = [];
  if (showHintLevel >= 2) {
    const sol = CLASSIC_SOLUTION;
    const count = showHintLevel >= 3 ? sol.length - 1 : 1;
    for (let i = 0; i < count; i++) {
      hintLines.push({
        x1: sol[i].x, y1: sol[i].y,
        x2: sol[i + 1].x, y2: sol[i + 1].y,
        color: '#E94560',
      });
    }
  }

  const gridMin = Math.min(...dots.map(d => d.x), ...dots.map(d => d.y));
  const gridMax = Math.max(...dots.map(d => d.x), ...dots.map(d => d.y));

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-sm font-medium text-muted-foreground">
          Lines: {vertices.length > 0 ? vertices.length - 1 : 0} / {maxLines}
        </span>
        <button onClick={reset} className="text-sm font-medium text-accent hover:text-accent/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          Reset
        </button>
      </div>

      <div className="relative w-full aspect-square rounded-2xl border border-border bg-card overflow-visible shadow-sm">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ overflow: 'visible' }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Subtle dot grid background */}
          <defs>
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.08" />
            </pattern>
          </defs>
          <rect x="-50" y="-50" width="500" height="500" fill="url(#dotGrid)" />

          {/* Dashed boundary box — shows the "box" users need to think outside of */}
          <rect
            x={gridMin - 10} y={gridMin - 10}
            width={gridMax - gridMin + 20} height={gridMax - gridMin + 20}
            fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4"
            opacity="0.15" rx="4"
          />

          {/* Hint ghost lines */}
          {hintLines.map((l, i) => (
            <line key={`hint-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.color} strokeWidth="2" strokeLinecap="round" opacity="0.25" strokeDasharray="8 4" />
          ))}

          {/* Committed line segments */}
          {lineSegments.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.color} strokeWidth="3.5" strokeLinecap="round" />
          ))}

          {/* Active drawing line */}
          {activeLine && (
            <line x1={activeLine.x1} y1={activeLine.y1} x2={activeLine.x2} y2={activeLine.y2}
              stroke={activeLine.color} strokeWidth="3" strokeLinecap="round" opacity="0.5" strokeDasharray="6 3" />
          )}

          {/* Dots */}
          {dots.map(dot => (
            <g key={dot.id}>
              {touchedDots.has(dot.id) && (
                <circle cx={dot.x} cy={dot.y} r="16" fill={theme.dotColor} opacity="0.15" />
              )}
              <circle
                cx={dot.x} cy={dot.y} r="9"
                fill={theme.dotColor}
                className={solved ? '' : 'dot-pulse'}
                style={{ animationDelay: `${dot.id * 0.1}s` }}
              />
              {touchedDots.has(dot.id) && (
                <circle cx={dot.x} cy={dot.y} r="4" fill="white" opacity="0.6" />
              )}
            </g>
          ))}

          {/* Vertex indicators — small circles at each anchor point */}
          {vertices.map((v, i) => (
            <circle key={`v-${i}`} cx={v.x} cy={v.y} r="4" fill="white" stroke={LINE_COLORS[Math.max(0, i - 1) % LINE_COLORS.length]} strokeWidth="1.5" />
          ))}
        </svg>
      </div>

      {feedback && (
        <div className="text-sm text-accent font-medium text-center animate-fade-slide-up px-4">
          {feedback}
        </div>
      )}

      {showHintLevel === 1 && (
        <div className="text-sm text-gold font-medium text-center animate-fade-slide-up px-4">
          💡 Remember — your lines can go beyond the dots!
        </div>
      )}
    </div>
  );
}
