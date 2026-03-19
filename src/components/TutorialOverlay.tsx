import { useState } from 'react';

const LINE_COLORS = ['#E94560', '#F5A623', '#0FD688', '#7C3AED'];

const DOTS = [
  { x: 100, y: 100 }, { x: 200, y: 100 }, { x: 300, y: 100 },
  { x: 100, y: 200 }, { x: 200, y: 200 }, { x: 300, y: 200 },
  { x: 100, y: 300 }, { x: 200, y: 300 }, { x: 300, y: 300 },
];

// Classic 9-dot solution lines (each line = [start, end])
const SOLUTION_LINES: [{ x: number; y: number }, { x: number; y: number }][] = [
  [{ x: 100, y: 300 }, { x: 400, y: 300 }],   // Line 1: extends right outside grid
  [{ x: 400, y: 300 }, { x: 100, y: 0 }],      // Line 2: diagonal up-left outside grid
  [{ x: 100, y: 0 }, { x: 100, y: 300 }],      // Line 3: straight down
  [{ x: 100, y: 300 }, { x: 300, y: 100 }],    // Line 4: diagonal up-right
];

const STEP_TEXT = [
  'Lines can go outside the boundary',
  'Keep going — stay connected',
  'Each line starts where the last one ended',
  "That's it! Now try it yourself.",
];

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);

  const visibleLines = step + 1; // step 0 = 1 line, step 3 = 4 lines

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="w-full max-w-[380px] rounded-2xl p-6 flex flex-col items-center"
        style={{ background: '#1A1A2E' }}>
        
        <h2 className="text-lg font-display font-bold text-white mb-1">
          How to Solve
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Step {step + 1} of 4
        </p>

        {/* Canvas */}
        <div className="w-full aspect-square max-w-[280px] mb-4">
          <svg viewBox="-20 -40 460 400" className="w-full h-full">
            {/* Dashed boundary */}
            <rect x={90} y={90} width={220} height={220}
              fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 4" rx="4" />

            {/* Solution lines with draw animation */}
            {SOLUTION_LINES.slice(0, visibleLines).map((line, i) => {
              const dx = line[1].x - line[0].x;
              const dy = line[1].y - line[0].y;
              const len = Math.sqrt(dx * dx + dy * dy);
              const isNew = i === step;
              return (
                <line
                  key={`${step}-${i}`}
                  x1={line[0].x} y1={line[0].y}
                  x2={line[1].x} y2={line[1].y}
                  stroke={LINE_COLORS[i]}
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity={isNew ? 1 : 0.5}
                  strokeDasharray={isNew ? len : undefined}
                  strokeDashoffset={isNew ? len : undefined}
                  style={isNew ? {
                    animation: `tutorialDraw 0.8s ease-out forwards`,
                  } : undefined}
                />
              );
            })}

            {/* Dots — completely static */}
            {DOTS.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r="8" fill="#E94560" />
            ))}
          </svg>
        </div>

        {/* Step text */}
        <p key={step} className="text-sm text-white text-center font-medium mb-6 animate-fade-slide-up min-h-[40px] flex items-center">
          {STEP_TEXT[step]}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 w-full">
          {step < 3 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Skip
              </button>
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-transform active:scale-95"
                style={{ background: '#E94560' }}
              >
                Next
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-display font-semibold text-white transition-transform active:scale-95"
              style={{ background: '#E94560' }}
            >
              Start Playing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
