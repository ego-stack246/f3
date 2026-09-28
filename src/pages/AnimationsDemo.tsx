
import { EXERCISE_KEYFRAMES } from '../data/exerciseKeyframes';
import ExerciseFigure from '../components/exercise/ExerciseFigure';
import { Play, Activity } from 'lucide-react';

export default function AnimationsDemo() {
  return (
    <div className="min-h-screen bg-slate-950 p-8 pt-24 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-500/10 text-sage-400 text-sm font-bold border border-sage-500/20">
            <Activity className="w-4 h-4" /> SVG Motion Engine
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Exercise <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sage-400">Animations</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">
            High-performance, anatomically correct stick-figure animations driven by Framer Motion and MediaPipe landmark data formats.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(EXERCISE_KEYFRAMES).map(([id, data]) => (
            <div key={id} className="bg-slate-900 border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col group hover:border-sage-500/30 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{data.name}</h3>
                <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-sage-400 ml-0.5" />
                </span>
              </div>
              
              <div className="flex-1 flex items-center justify-center bg-black/40 rounded-3xl p-8 mb-6 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sage-500/5 to-transparent pointer-events-none" />
                <ExerciseFigure
                  keyframes={data.keyframes}
                  tempoMs={2000}
                  loop={true}
                  size={180}
                  className="drop-shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider">Target Phases</h4>
                {data.phases.map((phase, idx) => (
                  <div key={idx} className="flex gap-3 text-sm text-white/70 items-start">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-white">
                      {idx + 1}
                    </span>
                    <span className="leading-tight pt-0.5">{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
