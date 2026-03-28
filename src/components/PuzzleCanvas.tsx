import React, { useRef, useState, useCallback } from 'react';
import { playLineConnect, playError } from '@/lib/sounds';
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

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function validateSolution(path: Point[], dots: Dot[], obstacles: number[] = []): boolean {
  if (path.length < 2) return false;
  const requiredDots = dots.filter(d => !obstacles.includes(d.id));
  const touched = new Set<number>();
  for (let i = 0; i < path.length - 1; i++) {
    requiredDots.forEach(dot => {
      if (distToSegment(dot, path[i], path[i + 1]) < 25) {
        touched.add(dot.id);
      }
    });
    // Check if line touches any obstacle
    for (const obstacleId of obstacles) {
      const obsDot = dots.find(d => d.id === obstacleId);
      if (obsDot && distToSegment(obsDot, path[i], path[i + 1]) < 25) {
        return false; // Touching obstacle = fail
      }
    }
  }
  return touched.size === requiredDots.length;
}

function checkObstacleHit(segs: [Point, Point][], dots: Dot[], obstacles: number[]): boolean {
  for (const [a, b] of segs) {
    for (const obstacleId of obstacles) {
      const obsDot = dots.find(d => d.id === obstacleId);
      if (obsDot && distToSegment(obsDot, a, b) < 25) return true;
    }
  }
  return false;
}

interface PuzzleCanvasProps {
  dots: Dot[];
  maxLines: number;
  dotColor: string;
  canvasBg: string;
  borderStyle: string;
  onSolve: (vertices: Point[]) => void;
  showHintLevel?: number;
  hintLine?: [Point, Point] | null;
  solutionPath?: Point[];
  obstacles?: number[]; // dot IDs that are obstacles
  soundEnabled?: boolean;
}

export default function PuzzleCanvas({
  dots, maxLines, dotColor, canvasBg, borderStyle,
  onSolve, showHintLevel = 0, hintLine, solutionPath = [],
  obstacles = [], soundEnabled = true,
}: PuzzleCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const [segments, setSegments] = useState<[Point, Point][]>([]);
  const [currentStart, setCurrentStart] = useState<Point | null>(null);
  const [currentEnd, setCurrentEnd] = useState<Point | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [touchedDots, setTouchedDots] = useState<Set<number>>(new Set());
  const [solved, setSolved] = useState(false);

  // Dynamic viewBox — 100px padding ensures drawing area extends 60px+ outside grid
  const gMin = Math.min(...dots.map(d => d.x), ...dots.map(d => d.y));
  const gMax = Math.max(...dots.map(d => d.x), ...dots.map(d => d.y));
  const padding = 100;
  const vbSize = (gMax - gMin) + padding * 2;
  const vbOrigin = gMin - padding;
  const viewBox = `${vbOrigin} ${vbOrigin} ${vbSize} ${vbSize}`;

  const getSvgPoint = useCallback((e: React.MouseEvent | React.TouchEvent): Point | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX) : e.clientX;
    const clientY = 'touches' in e ? (e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY) : e.clientY;
    const svgX = ((clientX - rect.left) / rect.width) * vbSize + vbOrigin;
    const svgY = ((clientY - rect.top) / rect.height) * vbSize + vbOrigin;
    return { x: svgX, y: svgY };
  }, [vbSize, vbOrigin]);

  const computeTouched = useCallback((segs: [Point, Point][]) => {
    const t = new Set<number>();
    for (const [a, b] of segs) {
      dots.forEach(d => {
        if (distToSegment(d, a, b) < 25) t.add(d.id);
      });
    }
    return t;
  }, [dots]);

  const computeTouchedWithLive = useCallback((segs: [Point, Point][], liveStart: Point | null, liveEnd: Point | null) => {
    const t = computeTouched(segs);
    if (liveStart && liveEnd) {
      dots.forEach(d => {
        if (distToSegment(d, liveStart, liveEnd) < 25) t.add(d.id);
      });
    }
    return t;
  }, [dots, computeTouched]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (solved) return;
    const p = getSvgPoint(e);
    if (!p) return;

    if (segments.length === 0 && !currentStart) {
      setCurrentStart(p);
      setCurrentEnd(p);
      setIsDrawing(true);
      setFeedback(null);
    } else if (currentStart && !isDrawing) {
      setCurrentEnd(currentStart);
      setIsDrawing(true);
    }
  }, [getSvgPoint, segments, currentStart, isDrawing, solved]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || solved || !currentStart) return;
    const p = getSvgPoint(e);
    if (p) {
      setCurrentEnd(p);
      setTouchedDots(computeTouchedWithLive(segments, currentStart, p));
    }
  }, [isDrawing, getSvgPoint, currentStart, segments, computeTouchedWithLive, solved]);

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentStart || !currentEnd || solved) return;

    const dist = Math.hypot(currentEnd.x - currentStart.x, currentEnd.y - currentStart.y);
    if (dist < 15) {
      if (segments.length === 0) setIsDrawing(false);
      return;
    }

    const newSegments: [Point, Point][] = [...segments, [currentStart, currentEnd]];

    // Check obstacle hit
    if (obstacles.length > 0 && checkObstacleHit([[currentStart, currentEnd]], dots, obstacles)) {
      if (soundEnabled) playError();
      setFeedback('🔴 Line hit an obstacle! Tap Reset to try again.');
      setSegments(newSegments);
      setIsDrawing(false);
      setCurrentEnd(null);
      setCurrentStart(null);
      return;
    }

    setSegments(newSegments);
    if (soundEnabled) playLineConnect(newSegments.length - 1);

    const path = [newSegments[0][0], ...newSegments.map(s => s[1])];
    const requiredDots = dots.filter(d => !obstacles.includes(d.id));
    const touched = computeTouched(newSegments);
    // Remove obstacle dots from touched count
    const activeTouched = new Set([...touched].filter(id => !obstacles.includes(id)));
    setTouchedDots(touched);

    if (validateSolution(path, dots, obstacles)) {
      setSolved(true);
      setIsDrawing(false);
      setCurrentEnd(null);
      onSolve(path);
      return;
    }

    if (newSegments.length >= maxLines) {
      setIsDrawing(false);
      setCurrentEnd(null);
      setCurrentStart(null);
      if (soundEnabled) playError();
      setFeedback(`Not quite — ${activeTouched.size}/${requiredDots.length} dots connected. Tap Reset to try again!`);
      return;
    }

    setCurrentStart(currentEnd);
    setCurrentEnd(currentEnd);
    setIsDrawing(false);
  }, [isDrawing, currentStart, currentEnd, segments, maxLines, dots, computeTouched, onSolve, solved, obstacles, soundEnabled]);

  const handleContinue = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (solved || segments.length >= maxLines) return;
    if (currentStart && !isDrawing && segments.length > 0) {
      setIsDrawing(true);
      const p = getSvgPoint(e);
      if (p) setCurrentEnd(p);
    }
  }, [solved, segments, maxLines, currentStart, isDrawing, getSvgPoint]);

  const handlePointerDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (segments.length > 0 && currentStart && !isDrawing) {
      handleContinue(e);
    } else {
      handleStart(e);
    }
  }, [segments, currentStart, isDrawing, handleContinue, handleStart]);

  const reset = useCallback(() => {
    setSegments([]);
    setCurrentStart(null);
    setCurrentEnd(null);
    setIsDrawing(false);
    setFeedback(null);
    setTouchedDots(new Set());
    setSolved(false);
  }, []);

  // Build solution segments for hint level 3
  const solutionSegments: [Point, Point][] = [];
  if (solutionPath.length >= 2) {
    for (let i = 0; i < solutionPath.length - 1; i++) {
      solutionSegments.push([solutionPath[i], solutionPath[i + 1]]);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="flex items-center justify-between w-full px-1">
        <span className="text-sm font-medium opacity-60">
          Lines: {segments.length} / {maxLines}
        </span>
        <button onClick={reset} className="text-sm font-medium text-accent hover:text-accent/80 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
          Reset
        </button>
      </div>

      <div className={`relative w-full aspect-square rounded-2xl border ${borderStyle} overflow-visible shadow-sm`}
        style={{ backgroundColor: canvasBg }}>
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full touch-none cursor-crosshair"
          style={{ overflow: 'visible' }}
          onMouseDown={handlePointerDown}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handlePointerDown}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {/* Subtle dot grid background */}
          <defs>
            <pattern id="dotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.06" />
            </pattern>
          </defs>
          <rect x={vbOrigin} y={vbOrigin} width={vbSize} height={vbSize} fill="url(#dotGrid)" />

          {/* Dashed boundary box — the "box" to think outside of, with 30px padding */}
          <rect
            x={gMin - 30} y={gMin - 30}
            width={gMax - gMin + 60} height={gMax - gMin + 60}
            fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="8 5"
            opacity="0.15" rx="8"
          />

          {/* Hint level 2: single ghost line */}
          {showHintLevel >= 2 && showHintLevel < 3 && hintLine && (
            <line
              x1={hintLine[0].x} y1={hintLine[0].y}
              x2={hintLine[1].x} y2={hintLine[1].y}
              stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"
              opacity="0.35" strokeDasharray="8 4"
            />
          )}

          {/* Hint level 3: full solution ghost path */}
          {showHintLevel >= 3 && solutionSegments.map(([a, b], i) => (
            <line key={`sol-${i}`}
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"
              opacity="0.3" strokeDasharray="6 4"
            />
          ))}

          {/* Committed line segments */}
          {segments.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth="3.5" strokeLinecap="round" />
          ))}

          {/* Active drawing line */}
          {isDrawing && currentStart && currentEnd && (
            <line
              x1={currentStart.x} y1={currentStart.y}
              x2={currentEnd.x} y2={currentEnd.y}
              stroke={LINE_COLORS[segments.length % LINE_COLORS.length]}
              strokeWidth="3" strokeLinecap="round" opacity="0.6" strokeDasharray="6 3"
            />
          )}

          {/* Dots — 18px radius with 28px tap target glow */}
          {dots.map(dot => {
            const isObstacle = obstacles.includes(dot.id);
            const fillColor = isObstacle ? '#EF4444' : dotColor;
            return (
              <g key={dot.id}>
                {/* Invisible tap target area */}
                <circle cx={dot.x} cy={dot.y} r="28" fill="transparent" />
                {isObstacle && (
                  <circle cx={dot.x} cy={dot.y} r="24" fill="#EF4444" opacity="0.08" />
                )}
                {touchedDots.has(dot.id) && !isObstacle && (
                  <circle cx={dot.x} cy={dot.y} r="26" fill={fillColor} opacity="0.12" />
                )}
                <circle
                  cx={dot.x} cy={dot.y} r={isObstacle ? 14 : 18}
                  fill={fillColor}
                  opacity={solved ? undefined : isObstacle ? 0.6 : 1}
                  className={solved && !isObstacle ? 'dot-win-glow' : ''}
                  style={solved && !isObstacle ? { animationDelay: `${dot.id * 0.1}s` } : undefined}
                />
                {isObstacle && (
                  <>
                    {/* X mark on obstacle */}
                    <line x1={dot.x - 6} y1={dot.y - 6} x2={dot.x + 6} y2={dot.y + 6} stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                    <line x1={dot.x + 6} y1={dot.y - 6} x2={dot.x - 6} y2={dot.y + 6} stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                  </>
                )}
                {touchedDots.has(dot.id) && !isObstacle && (
                  <circle cx={dot.x} cy={dot.y} r="7" fill="white" opacity="0.7" />
                )}
              </g>
            );
          })}

          {/* Vertex indicators at segment joints */}
          {segments.length > 0 && (
            <circle cx={segments[0][0].x} cy={segments[0][0].y} r="4"
              fill="white" stroke={LINE_COLORS[0]} strokeWidth="1.5" />
          )}
          {segments.map(([, b], i) => (
            <circle key={`v-${i}`} cx={b.x} cy={b.y} r="4"
              fill="white" stroke={LINE_COLORS[i % LINE_COLORS.length]} strokeWidth="1.5" />
          ))}

          {/* "Tap to start" prompt */}
          {segments.length === 0 && !isDrawing && (
            <text x={(gMin + gMax) / 2} y={gMax + 60} textAnchor="middle" fontSize="14" fill="currentColor" opacity="0.3"
              fontFamily="sans-serif">
              Tap anywhere to start drawing
            </text>
          )}
        </svg>
      </div>

      {feedback && (
        <div className="text-sm text-accent font-medium text-center animate-fade-slide-up px-4">
          {feedback}
        </div>
      )}
    </div>
  );
}
