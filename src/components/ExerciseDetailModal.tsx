import { useState } from 'react';
import { X, Play, Camera, CheckCircle2, AlertTriangle, Dumbbell, Flame, Clock, Repeat, Wrench, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PoseCamera from './PoseCamera';
import type { ExerciseType } from '../lib/poseAnalysis';

export interface WorkoutDetail {
  id: number;
  title: string;
  category: string;
  type: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  reps: string;
  cals: number;
  equipment: string;
  image: string;
  exercise: ExerciseType;
  musclewikiUrl?: string;
  musclesWorked?: string[];
  instructions?: string[];
  mistakes?: string[];
  breathing?: string;
}

interface ExerciseDetailModalProps {
  workout: WorkoutDetail | null;
  isOpen: boolean;
  onClose: () => void;
}


function ExerciseAnimationPlayer({ title, imageUrl }: { title: string, imageUrl: string }) {
  return (
    <div className="relative aspect-video bg-white rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex items-center justify-center p-2 group">
      <img src={imageUrl} alt={title} className="w-full h-full object-contain mix-blend-multiply" />
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function ExerciseDetailModal({ workout, isOpen, onClose }: ExerciseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'camera' | 'instructions' | 'ai_insights' | 'mistakes'>('overview');
  
  if (!workout || !isOpen) return null;

  const muscles = workout.musclesWorked || getMusclesForCategory(workout.category);
  const instructions = workout.instructions || [
    `Setup: Position yourself with proper posture, engaging your core and stabilizing your joints.`,
    `Execution: Perform ${workout.title} with a controlled 2-second concentric phase and a 3-second eccentric phase.`,
    `Completion: Complete ${workout.reps} maintaining full range of motion. Rest 60 seconds between sets.`,
  ];
  const mistakes = workout.mistakes || [
    `Rushing the rep tempo — focus on time under tension rather than speed.`,
    `Improper joint alignment — keep your shoulders pulled back and down.`,
    `Hyperextending or rounding your lower back — brace your abdominals.`,
  ];

  const tabs = [
    { id: 'overview', icon: <Play className="w-4 h-4" />, label: 'Video Overview' },
    { id: 'camera', icon: <Camera className="w-4 h-4" />, label: 'AI Posture' },
    { id: 'instructions', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Guide' },
    { id: 'ai_insights', icon: <BrainCircuit className="w-4 h-4" />, label: 'AI Insights' },
    { id: 'mistakes', icon: <AlertTriangle className="w-4 h-4" />, label: 'Mistakes' },
  ] as const;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Deep Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xl"
        />

        {/* Premium Glassmorphic Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-5xl bg-slate-900/80 backdrop-blur-2xl border border-white/10 text-white rounded-[2rem] shadow-[0_0_50px_-12px_rgba(105,124,101,0.5)] overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* Header */}
          <div className="relative p-6 sm:p-8 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="bg-gradient-to-r from-emerald-400 to-sage-500 text-transparent bg-clip-text text-xs font-black px-1 uppercase tracking-[0.2em]">{workout.category}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{workout.level}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-white/60 text-xs font-medium flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-sage-400" /> {workout.equipment}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white/90 drop-shadow-md">{workout.title}</h2>
            </div>
            <button onClick={onClose} className="absolute top-6 right-6 sm:relative sm:top-0 sm:right-0 p-2.5 rounded-full bg-white/5 hover:bg-white/20 hover:rotate-90 text-white transition-all duration-300 shrink-0 border border-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Animated Tabs */}
          <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto px-6 gap-2 py-3 scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-sage-600 to-sage-500 rounded-2xl shadow-lg border border-white/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className={activeTab === tab.id ? 'text-white' : (tab.id === 'camera' ? 'text-emerald-400' : tab.id === 'ai_insights' ? 'text-purple-400' : 'text-white/50')}>{tab.icon}</span>
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Body */}
          <div className={`flex-1 overflow-y-auto relative bg-gradient-to-b from-transparent to-black/20 ${activeTab === 'camera' ? 'p-4 sm:p-6 flex flex-col' : 'p-6 sm:p-8 space-y-8'}`}>
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-sage-300 uppercase tracking-widest flex items-center gap-2">
                      <Play className="w-4 h-4" /> Exercise Demonstration
                    </h3>
                  </div>
                  <ExerciseAnimationPlayer title={workout.title} imageUrl={workout.image} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: <Clock className="w-6 h-6 text-sage-400 group-hover:text-white transition-colors" />, label: 'Duration', value: workout.duration },
                    { icon: <Repeat className="w-6 h-6 text-emerald-400 group-hover:text-white transition-colors" />, label: 'Reps / Sets', value: workout.reps },
                    { icon: <Flame className="w-6 h-6 text-orange-400 group-hover:text-white transition-colors" />, label: 'Est. Burn', value: `${workout.cals} kcal` },
                    { icon: <Dumbbell className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />, label: 'Gear', value: workout.equipment },
                  ].map((stat, i) => (
                    <div key={i} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 p-5 rounded-3xl flex flex-col items-start gap-3 transition-all duration-300 cursor-default shadow-lg">
                      <div className="bg-black/30 p-2.5 rounded-2xl">{stat.icon}</div>
                      <div>
                        <p className="text-[11px] text-white/50 font-bold uppercase tracking-wider mb-0.5">{stat.label}</p>
                        <p className="text-lg font-black tracking-tight">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AI CAMERA */}
            {activeTab === 'camera' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 flex-1 flex flex-col min-h-[50vh]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-sage-300 bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20 shrink-0">
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-emerald-400" /> Center yourself in frame • Ensure full body visibility</span>
                  <span className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Analysis
                  </span>
                </div>
                <div className="flex-1 min-h-[300px] rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <PoseCamera exercise={workout.exercise} enabled={activeTab === 'camera'} className="h-full w-full absolute inset-0" />
                </div>
              </motion.div>
            )}

            {/* AI INSIGHTS */}
            {activeTab === 'ai_insights' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/20 border border-purple-500/30 p-6 sm:p-8 rounded-[2rem] relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none" />
                  <h3 className="text-lg font-black text-white flex items-center gap-3 mb-6 relative z-10">
                    <BrainCircuit className="w-6 h-6 text-purple-400" /> AI Personal Trainer Analysis
                  </h3>
                  <div className="space-y-4 relative z-10">
                    <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Biomechanics Focus</h4>
                      <p className="text-sm text-white/80 leading-relaxed">For {workout.title}, focusing on the eccentric (lowering) phase will increase muscle hypertrophy by 15-20%. Ensure a slow 3-second descent.</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">Synergistic Muscles</h4>
                      <p className="text-sm text-white/80 leading-relaxed">While primarily targeting {muscles[0] || 'the main muscle'}, engaging your {muscles[1] || 'core stabilizers'} will improve overall force output and protect your joints.</p>
                    </div>
                    <div className="bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">Pro Tip</h4>
                        <p className="text-sm text-white/80 leading-relaxed">Use our AI Posture Camera for this exercise. It accurately tracks your joint angles to ensure you are maximizing range of motion without risk of injury.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* INSTRUCTIONS */}
            {activeTab === 'instructions' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="space-y-4">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 p-5 rounded-3xl flex items-start gap-5 transition-all duration-300">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sage-500 to-sage-700 text-white font-black flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <p className="text-[15px] text-white/90 leading-relaxed mt-2 font-medium">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* MISTAKES */}
            {activeTab === 'mistakes' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {mistakes.map((mistake, idx) => (
                  <div key={idx} className="group bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/10 hover:border-amber-500/30 p-5 rounded-3xl flex items-start gap-4 transition-all duration-300">
                    <div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0 group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <p className="text-[15px] text-amber-50/90 leading-relaxed mt-1 font-medium">{mistake}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/5 bg-gradient-to-t from-black/40 to-transparent flex flex-col sm:flex-row items-center justify-end gap-4 relative z-20">
            {activeTab !== 'camera' && (
              <button
                onClick={() => setActiveTab('camera')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-sage-600 hover:from-emerald-400 hover:to-sage-500 text-white rounded-2xl text-sm font-bold shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
              >
                <Camera className="w-4 h-4" /> Start AI Form Check
              </button>
            )}
            <button onClick={onClose} className="w-full sm:w-auto px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function getMusclesForCategory(category: string): string[] {
  switch (category.toLowerCase()) {
    case 'chest':      return ['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii', 'Serratus Anterior'];
    case 'back':       return ['Latissimus Dorsi', 'Rhomboids', 'Trapezius', 'Biceps', 'Erector Spinae'];
    case 'shoulders':  return ['Anterior Deltoid', 'Lateral Deltoid', 'Posterior Deltoid', 'Trapezius'];
    case 'biceps':     return ['Biceps Brachii', 'Brachialis', 'Brachioradialis'];
    case 'triceps':    return ['Triceps Brachii (Long, Lateral & Medial Heads)', 'Anconeus'];
    case 'legs':       return ['Quadriceps', 'Hamstrings', 'Gluteus Maximus', 'Calves'];
    case 'calves & feet': return ['Gastrocnemius', 'Soleus', 'Tibialis Anterior'];
    case 'core':       return ['Rectus Abdominis', 'Transverse Abdominis', 'Obliques'];
    case 'cardio':     return ['Cardiovascular System', 'Full Body Engagement'];
    case 'yoga':       return ['Full Body Flexibility', 'Core Stabilizers', 'Joint Mobility'];
    default:           return ['Primary Muscle Group', 'Stabilizer Muscles'];
  }
}
