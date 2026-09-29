import { CheckCircle2, ShieldAlert, Loader2, Repeat, Flame, Clock, Sparkles, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { usePoseDetection } from '../hooks/usePoseDetection';
import type { ExerciseType } from '../lib/poseAnalysis';

interface PoseCameraProps {
  exercise: ExerciseType;
  enabled: boolean;
  className?: string;
}

export default function PoseCamera({ exercise, enabled, className }: PoseCameraProps) {
  const { videoRef, canvasRef, postureResult, isLoading, isCameraReady, error, stats } = usePoseDetection({
    exercise,
    enabled,
  });

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center', className)}>
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Skeleton Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-10">
          <div className="flex flex-col items-center gap-3 text-white">
            <Loader2 className="w-10 h-10 animate-spin text-sage-400" />
            <p className="text-sm font-semibold tracking-wide">Loading AI Pose & Rep Detection Engine…</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10">
          <div className="text-center text-red-300 p-6">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* TOP LEFT: LIVE WORK & REP COUNTER HUD */}
      {enabled && isCameraReady && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-3">
          {/* Reps Count Badge */}
          <motion.div 
            key={stats.reps}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="bg-sage-600/90 border border-sage-400/40 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center gap-3 text-white shadow-lg relative overflow-hidden"
          >
            {stats.reps > 0 && stats.reps % 10 === 0 && (
              <motion.div 
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 bg-white rounded-full z-0 pointer-events-none"
              />
            )}
            
            <div className="relative w-10 h-10 flex items-center justify-center bg-black/20 rounded-full z-10 shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <motion.circle 
                  cx="20" cy="20" r="18" fill="none" stroke="#6ee7b7" strokeWidth="3"
                  strokeDasharray="113"
                  animate={{ strokeDashoffset: 113 - (113 * (stats.reps % 10) / 10) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </svg>
              <Repeat className="w-4 h-4 text-emerald-300" />
            </div>
            
            <div className="z-10">
              <p className="text-[9px] uppercase tracking-wider text-sage-200 font-bold mb-0.5">Reps Count</p>
              <motion.p 
                key={stats.reps}
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-black leading-none font-mono tracking-tight"
              >
                {stats.reps} <span className="text-xs font-medium text-sage-200">reps</span>
              </motion.p>
            </div>
          </motion.div>

          {/* Form Score Gauge */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/60 border border-white/20 backdrop-blur-md p-3 rounded-2xl flex items-center gap-3 text-white"
          >
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <motion.circle 
                  cx="16" cy="16" r="14" fill="none" 
                  stroke={stats.postureScore > 80 ? '#4ade80' : stats.postureScore > 50 ? '#facc15' : '#f87171'} 
                  strokeWidth="4"
                  strokeDasharray="88"
                  animate={{ strokeDashoffset: 88 - (88 * stats.postureScore / 100) }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <Target className="w-3.5 h-3.5 opacity-80" />
            </div>
            <div>
               <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold">Form Score</p>
               <span className="text-sm font-bold font-mono tracking-tight">{stats.postureScore}%</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* TOP RIGHT: CALORIES & TIMER HUD */}
      {enabled && isCameraReady && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="bg-black/60 border border-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-white font-mono">
            <Clock className="w-3.5 h-3.5 text-sage-400" />
            <span>{formatTime(stats.elapsedSeconds)}</span>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-orange-300 font-mono font-bold">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{stats.calories} kcal</span>
          </div>
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
              'absolute top-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full backdrop-blur-md flex items-center gap-2 font-semibold text-xs sm:text-sm transition-all duration-300 z-20 shadow-xl border max-w-[85%] text-center',
              postureResult.isCorrect
                ? 'bg-green-500/25 text-green-200 border-green-500/40 shadow-green-950/40'
                : 'bg-red-500/25 text-red-200 border-red-500/40 shadow-red-950/40'
            )}
          >
            {postureResult.isCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{postureResult.feedback}</span>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ rotate: [-10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                </motion.div>
                <span>{postureResult.feedback}</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM RIGHT: METRICS DETAILED ANGLE METERS */}
      {enabled && isCameraReady && postureResult && (
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20 max-w-[200px]">
          {postureResult.metrics.map((m, i) => (
            <div
              key={i}
              className={cn(
                'bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono border flex items-center justify-between gap-2',
                m.good ? 'border-green-500/40 text-green-300' : 'border-red-500/40 text-red-300'
              )}
            >
              <span className="truncate text-[11px]">{m.label}:</span>
              <span className="font-bold">{m.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM LEFT: AI POSTURE RECOMMENDATION HINT */}
      {enabled && isCameraReady && (
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-white/80 text-xs">
          <Sparkles className="w-4 h-4 text-sage-400 shrink-0" />
          <span>Keep your chest lifted & core braced to maintain 100% score</span>
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
}
