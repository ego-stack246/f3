import { useRef, useState } from 'react';
import { X, Activity, Maximize2, Volume2, VolumeX } from 'lucide-react';
import PoseCamera, { type PoseCameraRef } from './PoseCamera';
import type { ExerciseType } from '../lib/poseAnalysis';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutPostureModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutTitle: string;
  exercise: ExerciseType;
}

export default function WorkoutPostureModal({ isOpen, onClose, workoutTitle, exercise }: WorkoutPostureModalProps) {
  const poseCameraRef = useRef<PoseCameraRef | null>(null);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fitsync_voice_muted') === 'true';
    }
    return false;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed inset-4 md:inset-10 lg:inset-16 z-[61] bg-earth-900 rounded-[2rem] p-4 md:p-6 flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sage-500/20 rounded-xl">
                  <Activity className="w-5 h-5 text-sage-400" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{workoutTitle}</h2>
                  <p className="text-white/50 text-xs">AI Posture Correction Active</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => poseCameraRef.current?.toggleMute()}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title={isVoiceMuted ? "Unmute Voice Coach" : "Mute Voice Coach"}
                  aria-label={isVoiceMuted ? "Unmute Voice Coach" : "Mute Voice Coach"}
                >
                  {isVoiceMuted ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => poseCameraRef.current?.toggleFullscreen()}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Full Screen Camera"
                  aria-label="Full Screen Camera"
                >
                  <Maximize2 className="w-5 h-5 text-emerald-400" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Camera */}
            <div className="flex-1 min-h-0">
              <PoseCamera
                ref={poseCameraRef}
                exercise={exercise}
                exerciseTitle={workoutTitle}
                enabled={isOpen}
                onMuteChange={setIsVoiceMuted}
                className="h-full border border-white/10"
              />
            </div>

            {/* Footer Tips */}
            <div className="mt-4 flex items-center justify-between text-white/50 text-xs">
              <span>Ensure full body is visible • Stand 6–10 ft from camera</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Detection
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
