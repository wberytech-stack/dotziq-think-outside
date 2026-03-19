import React, { useRef, useState, useCallback, useEffect } from 'react';
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
  { x: 100, y: 100 },
  { x: 300, y: 300 },
  { x: 300, y: 0 },
];

// Alternative valid solution
const CLASSIC_SOLUTION_ALT: Point[] = [
  { x: 100, y: 300 },
  { x: 300, y: 100 },
  { x: 0, y: 100 },
  { x: 300, y: 400 },
  { x: 300, y: 100 },
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
  onSolve: () => void;
  showHintLevel?: number;
}

export default function PuzzleCanvas({ dots, maxLines, onSolve, showHintLevel = 0 }: PuzzleCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { gameState, getThemeColors } = useApp();
  const theme = getThemeColors();

  const [vertices, setVertices] = useState<Point[]>([]);
  const [currentPos, setCurrentPos] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [touchedDots, setTouchedDots] = useState<Set<number>>(new Set());

  const canvasWidth = 400;
  const canvasHeight = 400;

  const getSvgPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY : e.clientY;
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, []);

  const snapToDot = useCallback((p: Point): Point | null => {
    for (const dot of dots) {
      if (Math.hypot(p.x - dot.x, p.y - dot.y) < 30) return { x: dot.x, y: dot.y };
    }
    return null;
  }, [dots]);

  const updateTouched = useCallback((path: Point[]) => {
    const t = new Set<number>();
    for (let i = 0; i < path.length - 1; i++) {
      dots.forEach(d => {
        if (distToSegment(d, path[i], path[i + 1]) < 20) t.add(d.id);
      });
    }
    setTouchedDots(t);
  }, [dots]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const p = getSvgPoint(e);
    if (!p) return;
    const snapped = snapToDot(p);
    if (snapped) {
      setVertices([snapped]);
      setCurrentPos(snapped);
      setIsDrawing(true);
      setFeedback(null);
    }
  }, [getSvgPoint, snapToDot]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const p = getSvgPoint(e);
    if (p) setCurrentPos(p);
  }, [isDrawing, getSvgPoint]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentPos) return;

    const snapped = snapToDot(currentPos);
    if (snapped && vertices.length > 0) {
      const last = vertices[vertices.length - 1];
      if (Math.hypot(snapped.x - last.x, snapped.y - last.y) > 10) {
        const newVerts = [...vertices, snapped];
        const lineCount = newVerts.length - 1;

        if (lineCount <= maxLines) {
          setVertices(newVerts);
          updateTouched(newVerts);

          if (validateSolution(newVerts, dots)) {
            setIsDrawing(false);
            setCurrentPos(null);
            onSolve();
            return;
          }

          if (lineCount === maxLines) {
            setIsDrawing(false);
            setCurrentPos(null);
            if (!validateSolution(newVerts, dots)) {
              setFeedback('Not quite — all dots must be connected. Try again!');
            }
            return;
          }
          // Continue — next line starts from this vertex
          return;
        }
      }
    }
    // If we can't snap, just keep drawing
  }, [isDrawing, currentPos, vertices, maxLines, dots, snapToDot, updateTouched, onSolve]);

  const reset = useCallback(() => {
    setVertices([]);
    setCurrentPos(null);
    setIsDrawing(false);
    setFeedback(null);
    setTouchedDots(new Set());
  }, []);

  // Build the lines for rendering
  const lineSegments: { x1: number; y1: number; x2: number; y2: number; color: string }[] = [];
  for (let i = 0; i < vertices.length - 1; i++) {
    lineSegments.push({
      x1: vertices[i].x, y1: vertices[i].y,
      x2: vertices[i + 1].x, y2: vertices[i + 1].y,
      color: LINE_COLORS[i % LINE_COLORS.length],
    });
  }

  // Current drawing line
  const activeLine = isDrawing && vertices.length > 0 && currentPos ? {
    x1: vertices[vertices.length - 1].x,
    y1: vertices[vertices.length - 1].y,
    x2: currentPos.x,
    y2: currentPos.y,
    color: LINE_COLORS[(vertices.length - 1) % LINE_COLORS.length],
  } : null;

  // Hint lines
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

  // Bounding box
  const minX = Math.min(...dots.map(d => d.x));
  const maxX = Math.max(...dots.map(d => d.x));
  const minY = Math.min(...dots.map(d => d.y));
  const maxY = Math.max(...dots.map(d => d.y));

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full max-w-[340px] px-1">
        <span className="text-sm font-medium text-muted-foreground">
          Lines: {vertices.length > 0 ? vertices.length - 1 : 0} / {maxLines}
        </span>
        <button onClick={reset} className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
          Reset
        </button>
      </div>

      <div className="relative w-full max-w-[340px] aspect-square rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Subtle grid pattern */}
          <defs>
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.08" />
            </pattern>
          </defs>
          <rect width={canvasWidth} height={canvasHeight} fill="url(#dotGrid)" />

          {/* Boundary box (dashed) */}
          <rect
            x={minX - 10} y={minY - 10}
            width={maxX - minX + 20} height={maxY - minY + 20}
            fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4"
            opacity="0.12" rx="4"
          />

          {/* Hint lines */}
          {hintLines.map((l, i) => (
            <line key={`hint-${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.color} strokeWidth="2" strokeLinecap="round" opacity="0.25" strokeDasharray="8 4" />
          ))}

          {/* Drawn lines */}
          {lineSegments.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={l.color} strokeWidth="3" strokeLinecap="round" />
          ))}

          {/* Active drawing line */}
          {activeLine && (
            <line x1={activeLine.x1} y1={activeLine.y1} x2={activeLine.x2} y2={activeLine.y2}
              stroke={activeLine.color} strokeWidth="3" strokeLinecap="round" opacity="0.6" strokeDasharray="4 2" />
          )}

          {/* Dots */}
          {dots.map(dot => (
            <g key={dot.id}>
              {touchedDots.has(dot.id) && (
                <circle cx={dot.x} cy={dot.y} r="14" fill={theme.dotColor} opacity="0.15" />
              )}
              <circle
                cx={dot.x} cy={dot.y} r="8"
                fill={theme.dotColor}
                className="dot-pulse"
                style={{ animationDelay: `${dot.id * 0.1}s` }}
              />
            </g>
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
