import { useState } from 'react';
import { Camera, Activity, CheckCircle2, ShieldCheck, Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import PoseCamera from '../components/PoseCamera';
import type { ExerciseType } from '../lib/poseAnalysis';

const EXERCISE_OPTIONS: { value: ExerciseType; label: string; desc: string }[] = [
  { value: 'general_posture', label: 'Desk Posture', desc: 'Check sitting spine & shoulder alignment' },
  { value: 'squat', label: 'Squat', desc: 'Track knee angle and spine depth' },
  { value: 'lunge', label: 'Lunge', desc: 'Front knee 90° and torso uprightness' },
  { value: 'plank', label: 'Plank', desc: 'Full-body straight line check' },
  { value: 'tree_pose', label: 'Tree Pose', desc: 'Single-leg balance and shoulder symmetry' },
  { value: 'warrior_pose', label: 'Warrior Pose', desc: 'Knee depth and arm extension' },
  { value: 'jumping_jack', label: 'Jumping Jack', desc: 'Overhead arm reach and leg spread' },
  { value: 'mountain_climber', label: 'Mountain Climber', desc: 'Hip level alignment and arm lock' },
  { value: 'crunch', label: 'Crunch', desc: 'Core curl angle and neck protection' },
  { value: 'russian_twist', label: 'Russian Twist', desc: 'Lean angle and torso rotation' },
  { value: 'leg_raise', label: 'Leg Raise', desc: 'Leg angle and knee lock tracking' },
  { value: 'heel_touch', label: 'Heel Touch', desc: 'Oblique reach and curl angle' },
  { value: 'spine_twist', label: 'Spine Twist', desc: 'Spinal rotation and posture' },
  { value: 'standing_stretch', label: 'Standing Stretch', desc: 'Overhead extension and spine alignment' },
];

export default function PostureCoach() {
  const [isActive, setIsActive] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('general_posture');

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <header className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          <Sparkles className="w-3.5 h-3.5" /> MediaPipe Pose Detection & Rep Counter
        </div>
        <h1 className="text-3xl font-bold">AI Posture Coach & Rep Counter</h1>
        <p className="text-earth-800/70 mt-2">
          Select an exercise below to track **rep counts**, **calories burned**, and get **real-time AI posture feedback** to protect your joints and maximize form.
        </p>
      </header>

      {/* Exercise Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {EXERCISE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => { setSelectedExercise(opt.value); }}
            className={cn(
              'p-4 rounded-xl border text-left transition-all duration-200',
              selectedExercise === opt.value
                ? 'bg-sage-600 text-white border-sage-600 shadow-lg shadow-sage-600/20'
                : 'glass-card hover:border-sage-300'
            )}
          >
            <p className="font-semibold text-sm">{opt.label}</p>
            <p className={cn('text-xs mt-1 line-clamp-2', selectedExercise === opt.value ? 'text-white/70' : 'text-earth-800/60')}>
              {opt.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Main Camera Area */}
      <div className="bg-earth-900 rounded-[2rem] p-4 md:p-8 shadow-2xl space-y-6">
        <PoseCamera
          exercise={selectedExercise}
          enabled={isActive}
          className="border border-white/10"
        />

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3 text-white/70 text-sm">
            {isActive ? (
              <>
                <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                <span>AI Camera Active — tracking <span className="font-bold text-white">{EXERCISE_OPTIONS.find(o => o.value === selectedExercise)?.label}</span></span>
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 text-sage-400" />
                <span>Select an exercise above and click Start AI Analysis</span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsActive(!isActive)}
            className={cn(
              'px-8 py-3 rounded-full font-bold transition-all text-sm flex items-center gap-2',
              isActive
                ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-sage-500 hover:bg-sage-600 text-white shadow-lg shadow-sage-600/20'
            )}
          >
            {isActive ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Stop Analysis
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" /> Start AI Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {/* POSTURE MAINTENANCE RECOMMENDATIONS */}
      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sage-100 text-sage-700 rounded-2xl">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-earth-900">How to Maintain Good Posture</h2>
            <p className="text-earth-800/70 text-xs">Essential guidelines to protect your spine, knees, and joints during workouts and daily routines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 border border-cream-300 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-sage-700 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Spine & Shoulder Alignment
            </div>
            <p className="text-xs text-earth-800/80 leading-relaxed">
              Pull your shoulders back and down. Keep your ears aligned directly over your shoulders to eliminate forward neck tilt.
            </p>
          </div>

          <div className="bg-white/50 border border-cream-300 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-sage-700 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> 2. Core Engagement
            </div>
            <p className="text-xs text-earth-800/80 leading-relaxed">
              Brace your abdominal wall as if preparing for a punch. This supports your lumbar spine and prevents lower back sagging.
            </p>
          </div>

          <div className="bg-white/50 border border-cream-300 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-sage-700 font-bold text-sm">
              <Activity className="w-4 h-4 text-emerald-600" /> 3. Knee Tracking & Range
            </div>
            <p className="text-xs text-earth-800/80 leading-relaxed">
              Ensure your knees track in line with your second toe during squats and lunges. Never allow knees to cave inward (valgus collapse).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
