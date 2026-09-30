import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Repeat,
  Flame,
  Clock,
  Sparkles,
  Target,
  Maximize2,
  Minimize2,
  Scan,
  Activity,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { usePoseDetection } from '../hooks/usePoseDetection';
import type { ExerciseType } from '../lib/poseAnalysis';
import { apiFetch } from '../api/client';

export interface PoseCameraRef {
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  toggleMute: () => void;
  isMuted: boolean;
}

export interface PoseCameraProps {
  exercise: ExerciseType;
  enabled: boolean;
  className?: string;
  exerciseTitle?: string;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  isMuted?: boolean;
  onMuteChange?: (isMuted: boolean) => void;
}

const PoseCamera = forwardRef<PoseCameraRef, PoseCameraProps>(function PoseCamera(
  { exercise, enabled, className, exerciseTitle, onFullscreenChange, isMuted: propMuted, onMuteChange },
  ref
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectMode, setAspectMode] = useState<'cover' | 'contain'>('cover');

  const {
    videoRef,
    canvasRef,
    postureResult,
    isLoading,
    isCameraReady,
    error,
    stats,
    isMuted,
    toggleMute,
  } = usePoseDetection({
    exercise,
    enabled,
    isMuted: propMuted,
  });

  useEffect(() => {
    onMuteChange?.(isMuted);
  }, [isMuted, onMuteChange]);

  const lastSyncedStatsRef = useRef<{ reps: number; duration: number }>({ reps: 0, duration: 0 });

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fullscreen toggle handler (Native API with robust CSS fullscreen fallback)
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      setIsFullscreen(true);
      onFullscreenChange?.(true);

      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        }
      } catch (e) {
        // Fullscreen request rejected or restricted; CSS fullscreen overlay handles it
        console.warn('Native fullscreen request fallback:', e);
      }
    } else {
      setIsFullscreen(false);
      onFullscreenChange?.(false);

      try {
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          }
        }
      } catch (e) {
        console.warn('Native exit fullscreen fallback:', e);
      }
    }
  }, [isFullscreen, onFullscreenChange]);

  // Expose toggleFullscreen, isFullscreen, toggleMute, isMuted to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      toggleFullscreen,
      isFullscreen,
      toggleMute,
      isMuted,
    }),
    [toggleFullscreen, isFullscreen, toggleMute, isMuted]
  );

  // Sync fullscreen change with document events & ESC key
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isNative && isFullscreen) {
        setIsFullscreen(false);
        onFullscreenChange?.(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, onFullscreenChange, toggleFullscreen]);

  // Clean up native fullscreen when unmounting
  useEffect(() => {
    return () => {
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
          }
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Background workout session sync when workout completes or stops
  useEffect(() => {
    return () => {
      const reps = stats.reps;
      const duration = stats.elapsedSeconds;
      if (
        (reps > 0 || duration >= 15) &&
        (reps !== lastSyncedStatsRef.current.reps || duration !== lastSyncedStatsRef.current.duration)
      ) {
        lastSyncedStatsRef.current = { reps, duration };
        apiFetch('/fitness/sessions/complete', {
          method: 'POST',
          body: JSON.stringify({
            exercise_name: exercise.replace('_', ' '),
            duration_s: Math.max(15, duration),
            reps: Math.max(1, reps),
            valid_reps: Math.max(1, reps),
            avg_form_score: Math.min(100, Math.max(0, stats.postureScore || 90.0)),
            calories: stats.calories || 20,
            difficulty: 2,
            confidence: 0.92,
            source: 'camera_ai',
          }),
        }).catch((err) => {
          console.warn('Leaderboard session sync note:', err);
        });
      }
    };
  }, [exercise, stats.reps, stats.elapsedSeconds, stats.postureScore, stats.calories]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-black flex items-center justify-center transition-all duration-300 select-none',
        isFullscreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen !max-w-none !max-h-none rounded-none shadow-none m-0 p-0 overflow-hidden'
          : cn('relative w-full h-full rounded-2xl overflow-hidden shadow-2xl', className)
      )}
    >
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'w-full h-full',
          aspectMode === 'cover' ? 'object-cover' : 'object-contain'
        )}
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Skeleton Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 w-full h-full pointer-events-none',
          aspectMode === 'cover' ? 'object-cover' : 'object-contain'
        )}
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-md z-30">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-sage-400" />
            <p className="text-sm font-semibold tracking-wide">Initializing AI Pose & Rep Detection Engine…</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-30">
          <div className="text-center text-red-300 p-6">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* TOP LEFT: LIVE WORK & REP COUNTER HUD */}
      {enabled && isCameraReady && (
        <div className={cn(
          "absolute z-20 flex flex-col gap-3",
          isFullscreen ? "top-6 left-6" : "top-4 left-4"
        )}>
          {/* Reps Count Badge */}
          <motion.div
            key={stats.reps}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={cn(
              "bg-sage-600/90 border border-sage-400/40 backdrop-blur-md rounded-2xl flex items-center gap-3 text-white shadow-xl relative overflow-hidden",
              isFullscreen ? "px-5 py-3.5 sm:px-6 sm:py-4" : "px-4 py-2.5"
            )}
          >
            {stats.reps > 0 && stats.reps % 10 === 0 && (
              <motion.div
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-white rounded-full z-0 pointer-events-none"
              />
            )}

            <div className={cn(
              "relative flex items-center justify-center bg-black/20 rounded-full z-10 shrink-0",
              isFullscreen ? "w-12 h-12" : "w-10 h-10"
            )}>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx={isFullscreen ? 24 : 20} cy={isFullscreen ? 24 : 20} r={isFullscreen ? 21 : 18} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <motion.circle
                  cx={isFullscreen ? 24 : 20}
                  cy={isFullscreen ? 24 : 20}
                  r={isFullscreen ? 21 : 18}
                  fill="none"
                  stroke="#6ee7b7"
                  strokeWidth="3"
                  strokeDasharray={isFullscreen ? 132 : 113}
                  animate={{ strokeDashoffset: (isFullscreen ? 132 : 113) - ((isFullscreen ? 132 : 113) * (stats.reps % 10)) / 10 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </svg>
              <Repeat className={cn("text-emerald-300", isFullscreen ? "w-5 h-5" : "w-4 h-4")} />
            </div>

            <div className="z-10">
              <p className={cn("uppercase tracking-wider text-sage-200 font-bold mb-0.5", isFullscreen ? "text-[10px]" : "text-[9px]")}>
                Reps Count
              </p>
              <motion.p
                key={stats.reps}
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                  "font-black leading-none font-mono tracking-tight",
                  isFullscreen ? "text-3xl sm:text-5xl" : "text-2xl"
                )}
              >
                {stats.reps} <span className={cn("font-medium text-sage-200", isFullscreen ? "text-sm sm:text-base" : "text-xs")}>reps</span>
              </motion.p>
            </div>
          </motion.div>

          {/* Form Score Gauge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "bg-black/60 border border-white/20 backdrop-blur-md rounded-2xl flex items-center gap-3 text-white shadow-xl",
              isFullscreen ? "p-3.5 sm:p-4" : "p-3"
            )}
          >
            <div className={cn("relative flex items-center justify-center shrink-0", isFullscreen ? "w-10 h-10" : "w-8 h-8")}>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx={isFullscreen ? 20 : 16} cy={isFullscreen ? 20 : 16} r={isFullscreen ? 17 : 14} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <motion.circle
                  cx={isFullscreen ? 20 : 16}
                  cy={isFullscreen ? 20 : 16}
                  r={isFullscreen ? 17 : 14}
                  fill="none"
                  stroke={stats.postureScore > 80 ? '#4ade80' : stats.postureScore > 50 ? '#facc15' : '#f87171'}
                  strokeWidth="4"
                  strokeDasharray={isFullscreen ? 107 : 88}
                  animate={{ strokeDashoffset: (isFullscreen ? 107 : 88) - ((isFullscreen ? 107 : 88) * stats.postureScore) / 100 }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <Target className={cn("opacity-80", isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5")} />
            </div>
            <div>
              <p className={cn("uppercase tracking-wider text-white/50 font-bold", isFullscreen ? "text-[10px]" : "text-[9px]")}>
                Form Score
              </p>
              <span className={cn("font-bold font-mono tracking-tight", isFullscreen ? "text-base sm:text-lg" : "text-sm")}>
                {stats.postureScore}%
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* TOP RIGHT: CONTROLS & HUD */}
      {enabled && isCameraReady && (
        <div className={cn(
          "absolute z-20 flex items-center gap-2",
          isFullscreen ? "top-6 right-6" : "top-4 right-4"
        )}>
          {/* Exercise Title Badge */}
          {exerciseTitle && (
            <div className={cn(
              "bg-sage-600/80 border border-sage-400/30 backdrop-blur-md rounded-xl flex items-center gap-1.5 text-white font-bold uppercase tracking-wider shadow-lg",
              isFullscreen ? "px-3.5 py-2 text-xs sm:text-sm" : "px-2.5 py-1.5 text-[11px]"
            )}>
              <Activity className={cn("text-emerald-300", isFullscreen ? "w-4 h-4" : "w-3 h-3")} />
              <span className="truncate max-w-[120px] sm:max-w-none">{exerciseTitle}</span>
            </div>
          )}

          {/* Timer */}
          <div className={cn(
            "bg-black/60 border border-white/20 backdrop-blur-md rounded-xl flex items-center gap-1.5 text-white font-mono shadow-lg",
            isFullscreen ? "px-3.5 py-2 text-xs sm:text-sm" : "px-3 py-1.5 text-xs"
          )}>
            <Clock className={cn("text-sage-400", isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5")} />
            <span>{formatTime(stats.elapsedSeconds)}</span>
          </div>

          {/* Calories */}
          <div className={cn(
            "bg-orange-500/20 border border-orange-500/30 backdrop-blur-md rounded-xl flex items-center gap-1.5 text-orange-300 font-mono font-bold shadow-lg",
            isFullscreen ? "px-3.5 py-2 text-xs sm:text-sm" : "px-3 py-1.5 text-xs"
          )}>
            <Flame className={cn("text-orange-400", isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5")} />
            <span>{stats.calories} kcal</span>
          </div>

          {/* Aspect mode toggle (Fit/Fill) in fullscreen */}
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setAspectMode(prev => (prev === 'cover' ? 'contain' : 'cover'))}
              className="bg-black/60 hover:bg-black/80 border border-white/20 px-3 py-2 rounded-xl text-xs text-white/90 font-medium hidden md:flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg active:scale-95 cursor-pointer"
              title={aspectMode === 'cover' ? "Switch to Fit (show entire camera frame)" : "Switch to Fill (fill entire screen)"}
            >
              <Scan className="w-3.5 h-3.5 text-sage-300" />
              <span>{aspectMode === 'cover' ? 'Fill' : 'Fit'}</span>
            </button>
          )}

          {/* Volume Mute/Unmute Button */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? "Unmute Voice Coach" : "Mute Voice Coach"}
            aria-label={isMuted ? "Unmute Voice Coach" : "Mute Voice Coach"}
            className={cn(
              "rounded-xl border backdrop-blur-md flex items-center gap-1.5 font-bold transition-all shadow-lg active:scale-95 cursor-pointer",
              isMuted
                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/40 hover:border-red-400"
                : "bg-black/60 hover:bg-black/80 text-white hover:text-emerald-300 border-white/20 hover:border-emerald-400/50",
              isFullscreen ? "px-3.5 py-2 text-xs sm:text-sm" : "px-2.5 py-1.5 text-xs"
            )}
          >
            {isMuted ? (
              <>
                <VolumeX className={cn("text-red-400", isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5")} />
                <span className="hidden sm:inline">Muted</span>
              </>
            ) : (
              <>
                <Volume2 className={cn("text-emerald-400", isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5")} />
                <span className="hidden sm:inline">Voice</span>
              </>
            )}
          </button>

          {/* Full Screen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen Camera Detection"}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Full Screen Camera Detection"}
            className={cn(
              "rounded-xl border backdrop-blur-md flex items-center gap-1.5 font-bold transition-all shadow-lg active:scale-95 cursor-pointer",
              isFullscreen
                ? "bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-400/50 px-3.5 py-2 text-xs sm:text-sm"
                : "bg-black/60 hover:bg-black/80 text-white hover:text-emerald-300 border-white/20 hover:border-emerald-400/50 px-3 py-1.5 text-xs"
            )}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className={cn("text-white", isFullscreen ? "w-4 h-4" : "w-3.5 h-3.5")} />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TOP CENTER: REAL-TIME POSTURE FEEDBACK BANNER */}
      <AnimatePresence>
        {enabled && isCameraReady && postureResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={cn(
              'absolute left-1/2 -translate-x-1/2 rounded-full backdrop-blur-md flex items-center gap-2.5 font-bold transition-all duration-300 z-20 shadow-2xl border text-center',
              isFullscreen
                ? 'top-6 px-6 py-3 sm:px-8 sm:py-3.5 text-sm sm:text-base md:text-lg max-w-[80%]'
                : 'top-4 px-5 py-2.5 text-xs sm:text-sm max-w-[85%]',
              postureResult.isCorrect
                ? 'bg-green-500/30 text-green-100 border-green-500/50 shadow-green-950/50'
                : 'bg-red-500/30 text-red-100 border-red-500/50 shadow-red-950/50'
            )}
          >
            {postureResult.isCorrect ? (
              <>
                <CheckCircle2 className={cn("text-emerald-400 shrink-0", isFullscreen ? "w-5 h-5" : "w-4 h-4")} />
                <span>{postureResult.feedback}</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [-10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <ShieldAlert className={cn("text-red-400 shrink-0", isFullscreen ? "w-5 h-5" : "w-4 h-4")} />
                </motion.div>
                <span>{postureResult.feedback}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM RIGHT: METRICS DETAILED ANGLE METERS */}
      {enabled && isCameraReady && postureResult && (
        <div className={cn(
          "absolute z-20 flex flex-col gap-1.5",
          isFullscreen ? "bottom-6 right-6 max-w-[260px]" : "bottom-4 right-4 max-w-[200px]"
        )}>
          {postureResult.metrics.map((m, i) => (
            <div
              key={i}
              className={cn(
                'bg-black/75 backdrop-blur-md rounded-xl font-mono border flex items-center justify-between gap-2 shadow-lg',
                isFullscreen ? 'px-4 py-2 text-xs sm:text-sm' : 'px-3 py-1.5 text-xs',
                m.good ? 'border-green-500/40 text-green-300' : 'border-red-500/40 text-red-300'
              )}
            >
              <span className="truncate text-[11px] sm:text-xs">{m.label}:</span>
              <span className="font-bold">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM LEFT: AI POSTURE RECOMMENDATION HINT */}
      {enabled && isCameraReady && (
        <div className={cn(
          "absolute z-20 hidden sm:flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-2xl border border-white/15 text-white/90 shadow-xl",
          isFullscreen ? "bottom-6 left-6 px-5 py-3 text-xs sm:text-sm" : "bottom-4 left-4 px-3.5 py-2 text-xs"
        )}>
          <Sparkles className={cn("text-emerald-400 shrink-0", isFullscreen ? "w-5 h-5" : "w-4 h-4")} />
          <span>
            {isFullscreen
              ? "Full Screen Detection Active • Press Esc or tap Exit Fullscreen to return"
              : "Keep your chest lifted & core braced to maintain 100% score"}
          </span>
        </div>
      )}

      {/* Waiting for camera */}
      {enabled && !isCameraReady && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
          <p className="text-sm font-medium animate-pulse">Initializing Camera & Pose Landmarks…</p>
        </div>
      )}
    </div>
  );
});

export default PoseCamera;
