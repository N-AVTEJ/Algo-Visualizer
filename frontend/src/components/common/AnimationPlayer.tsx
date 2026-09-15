import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Sliders } from 'lucide-react';

export interface AnimationPlayerProps<TStep = unknown> {
  steps: TStep[];
  currentStepIndex?: number;
  onStepChange?: (index: number, step: TStep | undefined) => void;
  isPlaying?: boolean;
  onPlayToggle?: (playing: boolean) => void;
  onReset?: () => void;
  onComplete?: () => void;
  initialSpeedMs?: number;
  onSpeedChange?: (speedMs: number) => void;
  renderStep?: (step: TStep | undefined, index: number, isPlaying: boolean) => React.ReactNode;
  children?: (step: TStep | undefined, index: number, isPlaying: boolean) => React.ReactNode;
  showControls?: boolean;
  className?: string;
}

export function AnimationPlayer<TStep = unknown>({
  steps,
  currentStepIndex: controlledStepIndex,
  onStepChange,
  isPlaying: controlledIsPlaying,
  onPlayToggle,
  onReset,
  initialSpeedMs = 600,
  onSpeedChange,
  renderStep,
  children,
  showControls = true,
  className = '',
  onComplete,
}: AnimationPlayerProps<TStep>) {
  // Internal state when not fully controlled
  const [internalStepIndex, setInternalStepIndex] = useState<number>(0);
  const [internalIsPlaying, setInternalIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(initialSpeedMs);

  const isControlledStep = controlledStepIndex !== undefined;
  const isControlledPlay = controlledIsPlaying !== undefined;

  const activeStepIndex = isControlledStep ? controlledStepIndex : internalStepIndex;
  const activeIsPlaying = isControlledPlay ? controlledIsPlaying : internalIsPlaying;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setStep = React.useCallback(
    (newIndex: number) => {
      const clamped = Math.max(0, Math.min(newIndex, steps.length - 1));
      if (!isControlledStep) {
        setInternalStepIndex(clamped);
      }
      onStepChange?.(clamped, steps[clamped]);
    },
    [steps, isControlledStep, onStepChange]
  );

  const togglePlay = () => {
    const nextPlay = !activeIsPlaying;
    if (!isControlledPlay) {
      setInternalIsPlaying(nextPlay);
    }
    onPlayToggle?.(nextPlay);
  };

  const handleReset = () => {
    if (!isControlledPlay) setInternalIsPlaying(false);
    onPlayToggle?.(false);
    setStep(0);
    onReset?.();
  };

  const handleStepForward = () => {
    if (activeIsPlaying) {
      if (!isControlledPlay) setInternalIsPlaying(false);
      onPlayToggle?.(false);
    }
    if (activeStepIndex < steps.length - 1) {
      setStep(activeStepIndex + 1);
    }
  };

  const handleStepBackward = () => {
    if (activeIsPlaying) {
      if (!isControlledPlay) setInternalIsPlaying(false);
      onPlayToggle?.(false);
    }
    if (activeStepIndex > 0) {
      setStep(activeStepIndex - 1);
    }
  };

  const handleSpeedSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = 1350 - Number(e.target.value);
    setSpeedMs(newSpeed);
    onSpeedChange?.(newSpeed);
  };

  // Playback timer
  useEffect(() => {
    if (!activeIsPlaying || steps.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (activeStepIndex >= steps.length - 1) {
        if (!isControlledPlay) setInternalIsPlaying(false);
        onPlayToggle?.(false);
        if (steps.length > 1) {
          onComplete?.();
        }
      } else {
        const nextIndex = activeStepIndex + 1;
        setStep(nextIndex);
        if (nextIndex === steps.length - 1 && steps.length > 1) {
          onComplete?.();
        }
      }
    }, speedMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    activeIsPlaying,
    activeStepIndex,
    steps.length,
    speedMs,
    isControlledPlay,
    onPlayToggle,
    setStep,
    onComplete,
  ]);

  const currentStep = steps.length > 0 ? steps[activeStepIndex] : undefined;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Visual Canvas / Active Step Rendering */}
      {renderStep && renderStep(currentStep, activeStepIndex, activeIsPlaying)}
      {children && children(currentStep, activeStepIndex, activeIsPlaying)}

      {/* Playback Control Bar */}
      {showControls && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={steps.length === 0}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold inline-flex items-center space-x-1.5 transition-colors focus:ring-2 focus:ring-violet-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {activeIsPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{activeStepIndex > 0 ? 'Resume' : 'Play'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={steps.length === 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              title="Reset to initial frame"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleStepBackward}
              disabled={steps.length === 0 || activeStepIndex <= 0}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              title="Step Backward"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleStepForward}
              disabled={steps.length === 0 || activeStepIndex >= steps.length - 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
              title="Step Forward"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Slider */}
          <div className="flex items-center space-x-3 text-xs text-slate-300">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>Speed:</span>
            <input
              type="range"
              min="150"
              max="1200"
              step="50"
              value={1350 - speedMs}
              onChange={handleSpeedSliderChange}
              className="w-28 sm:w-36 accent-violet-500 cursor-pointer"
            />
            <span className="font-mono text-slate-400 w-12 text-right">{speedMs}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnimationPlayer;
