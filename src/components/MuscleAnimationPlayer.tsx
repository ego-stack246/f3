import { useEffect, useState } from 'react';

interface MuscleAnimationPlayerProps {
  muscle: string;
  equipment: string;
}

const MUSCLE_DATA: Record<string, {
  color: string;
  label: string;
  exerciseType: 'press' | 'pull' | 'squat' | 'curl' | 'core';
  tip: string;
}> = {
  'chest': { color: '#ef4444', label: 'Pectoralis Major', exerciseType: 'press', tip: 'Feel the stretch at the bottom!' },
  'pectoralis-major': { color: '#ef4444', label: 'Pectoralis Major', exerciseType: 'press', tip: 'Squeeze at the top of the movement.' },
  'front-deltoids': { color: '#f97316', label: 'Anterior Deltoid', exerciseType: 'press', tip: 'Keep elbows slightly in front of the bar.' },
  'biceps': { color: '#3b82f6', label: 'Biceps Brachii', exerciseType: 'curl', tip: 'Supinate wrist at top for peak contraction.' },
  'triceps': { color: '#8b5cf6', label: 'Triceps Brachii', exerciseType: 'press', tip: 'Keep elbows tucked, drive through the heel of hand.' },
  'back': { color: '#a855f7', label: 'Latissimus Dorsi', exerciseType: 'pull', tip: 'Pull elbows to hips, not hands to chest.' },
  'upper-back': { color: '#7c3aed', label: 'Upper Back / Traps', exerciseType: 'pull', tip: 'Retract shoulder blades at peak contraction.' },
  'trapezius': { color: '#7c3aed', label: 'Trapezius', exerciseType: 'pull', tip: 'Drive elbows up and back.' },
  'quadriceps': { color: '#22c55e', label: 'Quadriceps', exerciseType: 'squat', tip: 'Drive through the full foot, not just toes.' },
  'hamstrings': { color: '#16a34a', label: 'Hamstrings', exerciseType: 'squat', tip: 'Hinge at hips, feel the stretch.' },
  'gluteal': { color: '#f59e0b', label: 'Glutes', exerciseType: 'squat', tip: 'Squeeze glutes hard at the top.' },
  'calves': { color: '#10b981', label: 'Gastrocnemius', exerciseType: 'squat', tip: 'Full range: heel below platform to tippy toes.' },
  'abs': { color: '#06b6d4', label: 'Rectus Abdominis', exerciseType: 'core', tip: 'Exhale forcefully at top of movement.' },
  'obliques': { color: '#0891b2', label: 'Obliques', exerciseType: 'core', tip: 'Rotate from the torso, not just the arms.' },
  'shoulders': { color: '#f97316', label: 'Deltoids', exerciseType: 'press', tip: 'Avoid shrugging, keep traps relaxed.' },
  'rear-deltoids': { color: '#fb923c', label: 'Posterior Deltoid', exerciseType: 'pull', tip: 'Lead with elbows, not hands.' },
};

function getMuscleMeta(muscle: string) {
  const lower = muscle.toLowerCase();
  const key = Object.keys(MUSCLE_DATA).find(k => lower.includes(k) || k.includes(lower));
  return key ? MUSCLE_DATA[key] : { color: '#10b981', label: muscle, exerciseType: 'core' as const, tip: 'Focus on mind-muscle connection.' };
}

// ─── SVG ANIMATIONS ───────────────────────────────────────────────────────────

function PressAnimation({ muscleColor }: { muscleColor: string }) {
  return (
    <g>
      <style>{`
        @keyframes pressArm {
          0%,100% { transform: rotate(0deg); }
          50% { transform: rotate(-28deg); }
        }
        @keyframes pressChest {
          0%,100% { transform: scaleX(1); }
          50% { transform: scaleX(1.06); }
        }
        .press-arm { transform-origin: 118px 95px; animation: pressArm 2.2s ease-in-out infinite; }
        .press-chest { transform-origin: 120px 95px; animation: pressChest 2.2s ease-in-out infinite; }
      `}</style>

      {/* Bench */}
      <rect x="30" y="175" width="180" height="12" rx="5" fill="#334155" />
      <rect x="50" y="187" width="140" height="6" rx="3" fill="#1e293b" />
      {/* Bench legs */}
      <rect x="55" y="193" width="8" height="30" rx="3" fill="#475569" />
      <rect x="175" y="193" width="8" height="30" rx="3" fill="#475569" />

      {/* Barbell */}
      <rect x="40" y="68" width="160" height="7" rx="3.5" fill="#94a3b8" />
      <rect x="30" y="60" width="20" height="22" rx="4" fill="#64748b" />
      <rect x="190" y="60" width="20" height="22" rx="4" fill="#64748b" />

      {/* CHEST — targeted glow */}
      <ellipse className="press-chest" cx="120" cy="98" rx="30" ry="18" fill={muscleColor} opacity="0.85" />
      <ellipse className="press-chest" cx="120" cy="98" rx="30" ry="18" fill={muscleColor} opacity="0.4" style={{ filter: 'blur(6px)' }} />

      {/* Body lying down */}
      {/* Head */}
      <circle cx="210" cy="148" r="18" fill="#e2d9c8" />
      <circle cx="204" cy="144" r="3" fill="#fff" opacity="0.9" />
      {/* Torso */}
      <rect x="75" y="130" width="130" height="45" rx="10" fill="#cbd5e1" />
      {/* Shoulders */}
      <ellipse cx="80" cy="148" rx="14" ry="14" fill="#b0bec5" />
      <ellipse cx="195" cy="148" rx="14" ry="14" fill="#b0bec5" />

      {/* Arms pressing up */}
      <g className="press-arm">
        <line x1="80" y1="148" x2="80" y2="75" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
        <line x1="80" y1="75" x2="50" y2="75" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
      </g>
      <g style={{ transformOrigin: '195px 148px', animation: 'pressArm 2.2s ease-in-out infinite' }}>
        <line x1="195" y1="148" x2="195" y2="75" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
        <line x1="195" y1="75" x2="205" y2="75" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
      </g>

      {/* Legs */}
      <rect x="40" y="170" width="35" height="18" rx="6" fill="#b0bec5" />
      <rect x="40" y="170" width="35" height="18" rx="6" fill="#b0bec5" />
      <line x1="58" y1="188" x2="50" y2="220" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
      <line x1="68" y1="188" x2="76" y2="220" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round" />
    </g>
  );
}

function PullAnimation({ muscleColor }: { muscleColor: string }) {
  return (
    <g>
      <style>{`
        @keyframes pullUp {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes backGlow {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .pull-body { animation: pullUp 2s ease-in-out infinite; }
        .back-glow { animation: backGlow 2s ease-in-out infinite; }
      `}</style>

      {/* Pull-up bar */}
      <rect x="30" y="25" width="180" height="10" rx="5" fill="#334155" />
      <rect x="55" y="10" width="10" height="20" rx="4" fill="#475569" />
      <rect x="175" y="10" width="10" height="20" rx="4" fill="#475569" />

      <g className="pull-body">
        {/* Hands gripping bar */}
        <circle cx="85" cy="35" r="8" fill="#b0bec5" />
        <circle cx="155" cy="35" r="8" fill="#b0bec5" />

        {/* Arms */}
        <line x1="85" y1="35" x2="88" y2="75" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
        <line x1="155" y1="35" x2="152" y2="75" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />

        {/* BACK — targeted glow */}
        <ellipse className="back-glow" cx="120" cy="100" rx="32" ry="40" fill={muscleColor} opacity="0.85" />
        <ellipse className="back-glow" cx="120" cy="100" rx="32" ry="40" fill={muscleColor} opacity="0.3" style={{ filter: 'blur(8px)' }} />

        {/* Torso */}
        <rect x="88" y="70" width="64" height="80" rx="12" fill="#cbd5e1" />
        {/* Shoulders */}
        <ellipse cx="90" cy="78" rx="14" ry="14" fill="#b0bec5" />
        <ellipse cx="150" cy="78" rx="14" ry="14" fill="#b0bec5" />

        {/* Head */}
        <circle cx="120" cy="55" r="18" fill="#e2d9c8" />
        <circle cx="115" cy="52" r="3" fill="#fff" opacity="0.9" />

        {/* Legs hanging */}
        <line x1="108" y1="150" x2="100" y2="200" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
        <line x1="132" y1="150" x2="140" y2="200" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
        {/* Feet */}
        <circle cx="100" cy="204" r="6" fill="#94a3b8" />
        <circle cx="140" cy="204" r="6" fill="#94a3b8" />
      </g>
    </g>
  );
}

function SquatAnimation({ muscleColor }: { muscleColor: string }) {
  return (
    <g>
      <style>{`
        @keyframes squat {
          0%,100% { transform: translateY(0px) scaleY(1); }
          50% { transform: translateY(25px) scaleY(0.9); }
        }
        @keyframes legGlow {
          0%,100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        .squat-body { transform-origin: 120px 150px; animation: squat 2.4s ease-in-out infinite; }
        .leg-glow { animation: legGlow 2.4s ease-in-out infinite; }
      `}</style>

      {/* Barbell on shoulders */}
      <rect x="30" y="72" width="180" height="8" rx="4" fill="#94a3b8" />
      <rect x="20" y="64" width="20" height="24" rx="5" fill="#64748b" />
      <rect x="200" y="64" width="20" height="24" rx="5" fill="#64748b" />

      <g className="squat-body">
        {/* Head */}
        <circle cx="120" cy="48" r="18" fill="#e2d9c8" />
        <circle cx="115" cy="45" r="3" fill="#fff" opacity="0.9" />

        {/* Arms on bar */}
        <line x1="120" y1="65" x2="70" y2="80" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />
        <line x1="120" y1="65" x2="170" y2="80" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />

        {/* Torso */}
        <rect x="88" y="68" width="64" height="80" rx="12" fill="#cbd5e1" />

        {/* QUADS — targeted glow */}
        <ellipse className="leg-glow" cx="100" cy="170" rx="18" ry="35" fill={muscleColor} opacity="0.85" />
        <ellipse className="leg-glow" cx="140" cy="170" rx="18" ry="35" fill={muscleColor} opacity="0.85" />
        <ellipse className="leg-glow" cx="120" cy="165" rx="34" ry="40" fill={muscleColor} opacity="0.25" style={{ filter: 'blur(10px)' }} />

        {/* Legs squatting */}
        <line x1="103" y1="148" x2="88" y2="205" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
        <line x1="137" y1="148" x2="152" y2="205" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />

        {/* Knees */}
        <circle cx="88" cy="195" r="9" fill="#b0bec5" />
        <circle cx="152" cy="195" r="9" fill="#b0bec5" />

        {/* Lower legs */}
        <line x1="88" y1="204" x2="95" y2="230" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
        <line x1="152" y1="204" x2="145" y2="230" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />

        {/* Feet */}
        <ellipse cx="93" cy="234" rx="14" ry="6" fill="#64748b" />
        <ellipse cx="147" cy="234" rx="14" ry="6" fill="#64748b" />
      </g>

      {/* Floor */}
      <line x1="10" y1="240" x2="230" y2="240" stroke="#334155" strokeWidth="3" strokeDasharray="8 4" opacity="0.5" />
    </g>
  );
}

function CurlAnimation({ muscleColor }: { muscleColor: string }) {
  return (
    <g>
      <style>{`
        @keyframes curlArm {
          0%,100% { transform: rotate(5deg); }
          50% { transform: rotate(-60deg); }
        }
        @keyframes bicepGlow {
          0%,100% { rx: 10; ry: 8; opacity: 0.7; }
          50% { rx: 14; ry: 12; opacity: 1; }
        }
        .curl-arm-r { transform-origin: 152px 118px; animation: curlArm 2s ease-in-out infinite; }
        .curl-arm-l { transform-origin: 88px 118px; animation: curlArm 2s ease-in-out infinite reverse; }
      `}</style>

      {/* Head */}
      <circle cx="120" cy="40" r="18" fill="#e2d9c8" />
      <circle cx="115" cy="37" r="3" fill="#fff" opacity="0.9" />

      {/* Torso standing */}
      <rect x="88" y="58" width="64" height="90" rx="12" fill="#cbd5e1" />

      {/* Shoulders */}
      <ellipse cx="88" cy="72" rx="16" ry="14" fill="#b0bec5" />
      <ellipse cx="152" cy="72" rx="16" ry="14" fill="#b0bec5" />

      {/* Right arm curling */}
      <g className="curl-arm-r">
        <line x1="152" y1="80" x2="152" y2="138" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
        {/* BICEP glow on right */}
        <ellipse cx="152" cy="104" rx="13" ry="20" fill={muscleColor} opacity="0.9" />
        <ellipse cx="152" cy="104" rx="13" ry="20" fill={muscleColor} opacity="0.4" style={{ filter: 'blur(6px)' }} />
        {/* Forearm */}
        <line x1="152" y1="138" x2="148" y2="170" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />
        {/* Dumbbell */}
        <rect x="135" y="165" width="30" height="10" rx="4" fill="#475569" />
        <rect x="133" y="160" width="8" height="18" rx="3" fill="#334155" />
        <rect x="158" y="160" width="8" height="18" rx="3" fill="#334155" />
      </g>

      {/* Left arm curling (offset phase) */}
      <g className="curl-arm-l">
        <line x1="88" y1="80" x2="88" y2="138" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="88" cy="104" rx="13" ry="20" fill={muscleColor} opacity="0.6" />
        <line x1="88" y1="138" x2="92" y2="170" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />
        {/* Dumbbell left */}
        <rect x="75" y="165" width="30" height="10" rx="4" fill="#475569" />
        <rect x="73" y="160" width="8" height="18" rx="3" fill="#334155" />
        <rect x="98" y="160" width="8" height="18" rx="3" fill="#334155" />
      </g>

      {/* Legs standing */}
      <line x1="106" y1="148" x2="100" y2="220" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round" />
      <line x1="134" y1="148" x2="140" y2="220" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round" />
      <ellipse cx="100" cy="226" rx="14" ry="6" fill="#64748b" />
      <ellipse cx="140" cy="226" rx="14" ry="6" fill="#64748b" />

      {/* Floor */}
      <line x1="10" y1="232" x2="230" y2="232" stroke="#334155" strokeWidth="3" strokeDasharray="8 4" opacity="0.5" />
    </g>
  );
}

function CoreAnimation({ muscleColor }: { muscleColor: string }) {
  return (
    <g>
      <style>{`
        @keyframes crunch {
          0%,100% { transform: rotate(0deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes absGlow {
          0%,100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .crunch-torso { transform-origin: 120px 158px; animation: crunch 2s ease-in-out infinite; }
        .abs-glow { animation: absGlow 2s ease-in-out infinite; }
      `}</style>

      {/* Floor mat */}
      <rect x="20" y="195" width="200" height="16" rx="6" fill="#1e3a2f" opacity="0.8" />

      {/* Legs (static on floor) */}
      <line x1="108" y1="195" x2="80" y2="200" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
      <line x1="132" y1="195" x2="160" y2="200" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
      {/* Bent knees */}
      <line x1="80" y1="200" x2="72" y2="175" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />
      <line x1="160" y1="200" x2="168" y2="175" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round" />

      {/* Hips/Lower body */}
      <ellipse cx="120" cy="197" rx="32" ry="16" fill="#b0bec5" />

      {/* Torso crunching up */}
      <g className="crunch-torso">
        <rect x="88" y="115" width="64" height="80" rx="14" fill="#cbd5e1" />

        {/* ABS glow */}
        <ellipse className="abs-glow" cx="120" cy="148" rx="24" ry="32" fill={muscleColor} opacity="0.9" />
        <ellipse className="abs-glow" cx="120" cy="148" rx="24" ry="32" fill={muscleColor} opacity="0.35" style={{ filter: 'blur(8px)' }} />

        {/* Ab lines */}
        <line x1="120" y1="120" x2="120" y2="185" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="6 4" />
        <line x1="100" y1="145" x2="140" y2="145" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
        <line x1="100" y1="162" x2="140" y2="162" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

        {/* Arms behind head */}
        <line x1="88" y1="125" x2="62" y2="110" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />
        <line x1="152" y1="125" x2="178" y2="110" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round" />

        {/* Head */}
        <circle cx="120" cy="100" r="18" fill="#e2d9c8" />
        <circle cx="115" cy="97" r="3" fill="#fff" opacity="0.9" />

        {/* Hands behind head */}
        <circle cx="60" cy="108" r="7" fill="#b0bec5" />
        <circle cx="180" cy="108" r="7" fill="#b0bec5" />
      </g>
    </g>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function MuscleAnimationPlayer({ muscle, equipment }: MuscleAnimationPlayerProps) {
  const meta = getMuscleMeta(muscle);
  const [phase, setPhase] = useState<'lowering' | 'lifting' | 'peak'>('lifting');
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    const phases: Array<'lifting' | 'peak' | 'lowering'> = ['lifting', 'peak', 'lowering'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setPhase(phases[idx]);
      if (phases[idx] === 'lifting') {
        setRepCount(r => r + 1);
      }
    }, 1100);
    return () => clearInterval(interval);
  }, [muscle]);

  const phaseLabel = phase === 'lifting' ? '⬆ Concentric' : phase === 'peak' ? '🔥 Peak Contraction' : '⬇ Eccentric';

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-2xl overflow-hidden flex flex-col">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {/* Radial glow behind figure */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${meta.color} 0%, transparent 70%)` }} />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: meta.color }} />
          <span className="text-xs font-bold text-white uppercase tracking-widest">Live Animation</span>
        </div>
        <div className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: `${meta.color}55`, border: `1px solid ${meta.color}88` }}>
          {phaseLabel}
        </div>
      </div>

      {/* SVG Animation Canvas */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2">
        <svg viewBox="0 0 240 250" className="w-full h-full max-h-52" style={{ filter: `drop-shadow(0 0 18px ${meta.color}55)` }}>
          {meta.exerciseType === 'press' && <PressAnimation muscleColor={meta.color} />}
          {meta.exerciseType === 'pull' && <PullAnimation muscleColor={meta.color} />}
          {meta.exerciseType === 'squat' && <SquatAnimation muscleColor={meta.color} />}
          {meta.exerciseType === 'curl' && <CurlAnimation muscleColor={meta.color} />}
          {meta.exerciseType === 'core' && <CoreAnimation muscleColor={meta.color} />}
        </svg>
      </div>

      {/* Muscle target callout */}
      <div className="relative z-10 flex items-center justify-between px-4 pb-3 pt-1 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full animate-pulse shrink-0" style={{ backgroundColor: meta.color }} />
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Targeted Muscle</p>
            <p className="text-xs font-black text-white">{meta.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase">Reps</p>
            <p className="text-sm font-black" style={{ color: meta.color }}>{repCount % 13}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] font-semibold text-white/50 uppercase">Equipment</p>
            <p className="text-xs font-black text-white truncate max-w-[70px]">{equipment}</p>
          </div>
        </div>
      </div>

      {/* Tip strip */}
      <div className="relative z-10 px-4 pb-3">
        <div className="text-[10px] text-white/60 font-semibold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          💡 {meta.tip}
        </div>
      </div>
    </div>
  );
}
