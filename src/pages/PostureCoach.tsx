import { useState } from 'react';
import { Camera, Activity, CheckCircle2, ShieldCheck, Sparkles, Lightbulb, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import PoseCamera from '../components/PoseCamera';
import type { ExerciseType } from '../lib/poseAnalysis';

const EXERCISE_OPTIONS: { value: ExerciseType; label: string; desc: string }[] = [
  { value: 'general_posture', label: 'Desk Posture', desc: 'Check sitting spine alignment' },
  { value: 'squat', label: 'Squat', desc: 'Track knee angle & depth' },
  { value: 'lunge', label: 'Lunge', desc: 'Front knee 90° & torso' },
  { value: 'plank', label: 'Plank', desc: 'Full-body straight line' },
  { value: 'tree_pose', label: 'Tree Pose', desc: 'Single-leg balance' },
  { value: 'warrior_pose', label: 'Warrior Pose', desc: 'Knee depth & arms' },
  { value: 'jumping_jack', label: 'Jumping Jack', desc: 'Arm reach & leg spread' },
  { value: 'mountain_climber', label: 'Mountain Climber', desc: 'Hip level & arm lock' },
  { value: 'crunch', label: 'Crunch', desc: 'Core curl & neck' },
  { value: 'russian_twist', label: 'Russian Twist', desc: 'Lean angle & rotation' },
  { value: 'leg_raise', label: 'Leg Raise', desc: 'Leg angle & knee lock' },
  { value: 'heel_touch', label: 'Heel Touch', desc: 'Oblique reach & curl' },
  { value: 'spine_twist', label: 'Spine Twist', desc: 'Spinal rotation' },
  { value: 'standing_stretch', label: 'Standing Stretch', desc: 'Overhead extension' },
];

export default function PostureCoach() {
  const [isActive, setIsActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('general_posture');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 pb-20 pt-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
        
        {/* Header Section */}
        <header className="text-center max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-medium cursor-default">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>On-Device Edge AI Processing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight">
            Vision Intelligence
          </h1>
          <p className="text-zinc-500 text-lg font-light">
            Select a movement pattern below. Our neural engine tracks your biomechanics locally in real-time.
          </p>
        </header>

        {/* Neural Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
          {EXERCISE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedExercise(opt.value)}
              className={cn(
                'p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group',
                selectedExercise === opt.value
                  ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
              )}
            >
              <p className={cn("font-medium text-sm tracking-tight mb-1", selectedExercise === opt.value ? 'text-black' : 'text-zinc-200')}>
                {opt.label}
              </p>
              <p className={cn('text-[10px] leading-tight font-light', selectedExercise === opt.value ? 'text-zinc-700' : 'text-zinc-500')}>
                {opt.desc}
              </p>
              {selectedExercise === opt.value && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-black/5 to-transparent rounded-bl-full" />
              )}
            </button>
          ))}
        </div>

        {/* AI Camera Viewfinder */}
        <div className="relative bg-zinc-900 rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden p-2">
          <div className="bg-black rounded-[1.5rem] overflow-hidden relative">
            <PoseCamera
              exercise={selectedExercise}
              enabled={isActive}
              className="border-none w-full"
            />
            
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
                <div className="text-center space-y-4">
                  <Camera className="w-12 h-12 text-zinc-500 mx-auto" />
                  <p className="text-zinc-400 font-light">Camera feed is paused</p>
                </div>
              </div>
            )}
          </div>

          {/* Vision Controls */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl z-20">
            <div className="flex items-center gap-4 text-zinc-300 text-sm">
              {isActive ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-white tracking-tight">Neural Tracking Active</p>
                    <p className="text-xs text-zinc-500 font-light">Analyzing {EXERCISE_OPTIONS.find(o => o.value === selectedExercise)?.label}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white tracking-tight">System Ready</p>
                    <p className="text-xs text-zinc-500 font-light">Initialize camera to begin</p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setIsActive(!isActive)}
              className={cn(
                'px-8 py-3.5 rounded-full font-medium transition-all text-sm flex items-center gap-2 w-full sm:w-auto justify-center',
                isActive
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-white text-black hover:scale-105 hover:bg-zinc-200'
              )}
            >
              {isActive ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Terminate Tracking
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" /> Initialize Engine
                </>
              )}
            </button>
          </div>
        </div>

        {/* Biomechanics Rules */}
        <div className="pt-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-white/10 text-white rounded-xl border border-white/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-medium tracking-tight">Biomechanics Protocol</h2>
              <p className="text-zinc-500 text-sm font-light">Core principles evaluated by the AI during movement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: CheckCircle2, title: "Spinal Alignment", desc: "Maintains a neutral spine angle to prevent disk compression and lumbar sheer forces.", color: "text-blue-400" },
              { icon: ShieldCheck, title: "Core Stabilization", desc: "Analyzes abdominal bracing and torso rigidity during compound movements.", color: "text-purple-400" },
              { icon: Activity, title: "Joint Tracking", desc: "Monitors knee valgus, elbow flare, and hip hinge depth to protect connective tissue.", color: "text-emerald-400" }
            ].map((rule, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <rule.icon className={cn("w-5 h-5", rule.color)} />
                  <h3 className="font-medium tracking-tight">{rule.title}</h3>
                </div>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
