import { useEffect, useState } from 'react';

interface ExerciseAnimationProps {
  exerciseType: string;
  className?: string;
}

const PHASES = ['Eccentric (Lowering)', 'Concentric (Lifting)', 'Peak Contraction'] as const;

function classifyExercise(type: string) {
  const t = type.toLowerCase();
  if (t.includes('push') || t.includes('press') || t.includes('dip') || t.includes('fly') || t.includes('chest')) return 'press';
  if (t.includes('squat') || t.includes('lunge') || t.includes('leg') || t.includes('glute') || t.includes('deadlift')) return 'squat';
  if (t.includes('pull') || t.includes('row') || t.includes('lat') || t.includes('back')) return 'pull';
  if (t.includes('curl') || t.includes('tricep') || t.includes('arm') || t.includes('bicep')) return 'curl';
  if (t.includes('shoulder') || t.includes('delt') || t.includes('overhead') || t.includes('ohp') || t.includes('raise')) return 'shoulder';
  if (t.includes('plank') || t.includes('crunch') || t.includes('sit') || t.includes('core') || t.includes('ab')) return 'core';
  if (t.includes('run') || t.includes('jump') || t.includes('burpee') || t.includes('cardio')) return 'cardio';
  return 'core';
}

const EXERCISE_META: Record<string, { label: string; primary: string; muscles: string[]; glowColor: string; bgFrom: string; bgTo: string }> = {
  press:    { label: 'Chest & Triceps Press',       primary: 'Pectoralis Major',    muscles: ['Pectoralis Major 🔥', 'Triceps Brachii', 'Anterior Deltoid'], glowColor: '#ef4444', bgFrom: '#1a0505', bgTo: '#0d1f17' },
  squat:    { label: 'Leg & Glute Drive',            primary: 'Quadriceps Femoris',  muscles: ['Quadriceps 🔥', 'Gluteus Maximus', 'Hamstrings'],             glowColor: '#f97316', bgFrom: '#1a0b00', bgTo: '#0d1f17' },
  pull:     { label: 'Back & Lat Pull',              primary: 'Latissimus Dorsi',    muscles: ['Latissimus Dorsi 🔥', 'Rhomboids', 'Rear Deltoids'],          glowColor: '#a855f7', bgFrom: '#12001a', bgTo: '#0d1f17' },
  curl:     { label: 'Arm Isolation Curl',           primary: 'Biceps Brachii',      muscles: ['Biceps Brachii 🔥', 'Brachialis', 'Forearm Flexors'],         glowColor: '#3b82f6', bgFrom: '#00091a', bgTo: '#0d1f17' },
  shoulder: { label: 'Shoulder Press & Raise',       primary: 'Deltoid Complex',     muscles: ['Anterior Deltoid 🔥', 'Lateral Deltoid', 'Trapezius'],        glowColor: '#f59e0b', bgFrom: '#1a1000', bgTo: '#0d1f17' },
  core:     { label: 'Core & Abdominal Drive',       primary: 'Rectus Abdominis',    muscles: ['Abdominal Wall 🔥', 'Transverse Abdominis', 'Obliques'],      glowColor: '#10b981', bgFrom: '#001a0e', bgTo: '#0d1f17' },
  cardio:   { label: 'Cardio & Full-Body Power',     primary: 'Full Body System',    muscles: ['Cardiovascular System 🔥', 'Leg Drive', 'Core Stabilizers'],  glowColor: '#ec4899', bgFrom: '#1a0010', bgTo: '#0d1f17' },
};

// ─── SVG Figures ───────────────────────────────────────────────────────────

function BenchPressSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 170" className="w-full h-full">
      <defs>
        <radialGradient id="chestGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="0.9" />
          <stop offset="100%" stopColor={gc} stopOpacity="0" />
        </radialGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Bench */}
      <rect x="20" y="128" width="240" height="14" rx="6" fill="#1e293b"/>
      <rect x="38" y="142" width="10" height="25" rx="3" fill="#334155"/>
      <rect x="232" y="142" width="10" height="25" rx="3" fill="#334155"/>

      {/* Barbell */}
      <rect x="30" y="52" width="220" height="8" rx="4" fill="#94a3b8"/>
      <rect x="18" y="42" width="22" height="28" rx="5" fill="#475569"/>
      <rect x="240" y="42" width="22" height="28" rx="5" fill="#475569"/>

      {/* Chest glow */}
      <ellipse cx="140" cy="102" rx="38" ry="22" fill={`url(#chestGlow)`} className="animate-pulse"/>

      {/* Body */}
      <circle cx="230" cy="110" r="20" fill="#e2d9c8"/> {/* head */}
      <ellipse cx="140" cy="108" rx="70" ry="24" fill="#cbd5e1"/> {/* torso */}
      <ellipse cx="72" cy="118" rx="18" ry="14" fill="#b0bec5"/> {/* shoulder L */}
      <ellipse cx="208" cy="118" rx="18" ry="14" fill="#b0bec5"/> {/* shoulder R */}

      {/* Arms animated */}
      <line x1="72" y1="118" x2="50" y2="56" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" className="animate-[bounce_2s_ease-in-out_infinite]"/>
      <line x1="208" y1="118" x2="230" y2="56" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" className="animate-[bounce_2s_ease-in-out_infinite]"/>

      {/* Legs */}
      <line x1="80" y1="132" x2="40" y2="168" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round"/>
      <line x1="98" y1="132" x2="120" y2="168" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round"/>
      <ellipse cx="38" cy="169" rx="10" ry="5" fill="#64748b"/>
      <ellipse cx="118" cy="169" rx="10" ry="5" fill="#64748b"/>
    </svg>
  );
}

function SquatSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full">
      <defs>
        <radialGradient id="legGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="0.85"/>
          <stop offset="100%" stopColor={gc} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Barbell */}
      <rect x="30" y="52" width="220" height="8" rx="4" fill="#94a3b8"/>
      <rect x="18" y="42" width="22" height="28" rx="5" fill="#475569"/>
      <rect x="240" y="42" width="22" height="28" rx="5" fill="#475569"/>

      {/* Leg glow */}
      <ellipse cx="110" cy="148" rx="22" ry="38" fill={`url(#legGlow)`} className="animate-pulse"/>
      <ellipse cx="170" cy="148" rx="22" ry="38" fill={`url(#legGlow)`} className="animate-pulse"/>

      {/* Body squatting */}
      <g className="animate-[bounce_2.4s_ease-in-out_infinite]">
        <circle cx="140" cy="36" r="20" fill="#e2d9c8"/>
        <rect x="105" y="56" width="70" height="75" rx="14" fill="#cbd5e1"/>
        <ellipse cx="108" cy="68" rx="16" ry="14" fill="#b0bec5"/>
        <ellipse cx="172" cy="68" rx="16" ry="14" fill="#b0bec5"/>
        {/* Arms on bar */}
        <line x1="108" y1="62" x2="72" y2="56" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round"/>
        <line x1="172" y1="62" x2="208" y2="56" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round"/>

        {/* Legs */}
        <line x1="118" y1="131" x2="98" y2="178" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round"/>
        <line x1="162" y1="131" x2="182" y2="178" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round"/>
        <circle cx="98" cy="180" r="11" fill="#b0bec5"/>
        <circle cx="182" cy="180" r="11" fill="#b0bec5"/>
        {/* Lower legs */}
        <line x1="98" y1="190" x2="105" y2="198" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <line x1="182" y1="190" x2="175" y2="198" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <ellipse cx="104" cy="199" rx="14" ry="5" fill="#64748b"/>
        <ellipse cx="176" cy="199" rx="14" ry="5" fill="#64748b"/>
      </g>

      {/* Floor */}
      <line x1="10" y1="200" x2="270" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="8 5" opacity="0.5"/>
    </svg>
  );
}

function PullUpSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 220" className="w-full h-full">
      <defs>
        <radialGradient id="backGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={gc} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Bar */}
      <rect x="20" y="18" width="240" height="11" rx="5" fill="#334155"/>
      <rect x="50" y="4" width="12" height="18" rx="4" fill="#475569"/>
      <rect x="218" y="4" width="12" height="18" rx="4" fill="#475569"/>

      {/* Back glow */}
      <ellipse cx="140" cy="100" rx="35" ry="48" fill={`url(#backGlow)`} className="animate-pulse"/>

      <g className="animate-[bounce_2.2s_ease-in-out_infinite]">
        {/* Hands */}
        <circle cx="98" cy="30" r="9" fill="#b0bec5"/>
        <circle cx="182" cy="30" r="9" fill="#b0bec5"/>
        {/* Arms */}
        <line x1="98" y1="30" x2="103" y2="72" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <line x1="182" y1="30" x2="177" y2="72" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        {/* Shoulders */}
        <ellipse cx="104" cy="78" rx="18" ry="16" fill="#b0bec5"/>
        <ellipse cx="176" cy="78" rx="18" ry="16" fill="#b0bec5"/>
        {/* Torso */}
        <rect x="108" y="72" width="64" height="90" rx="14" fill="#cbd5e1"/>
        {/* Head */}
        <circle cx="140" cy="52" r="20" fill="#e2d9c8"/>
        {/* Legs */}
        <line x1="126" y1="162" x2="115" y2="215" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
        <line x1="154" y1="162" x2="165" y2="215" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
        <ellipse cx="114" cy="216" rx="10" ry="5" fill="#64748b"/>
        <ellipse cx="165" cy="216" rx="10" ry="5" fill="#64748b"/>
      </g>
    </svg>
  );
}

function CurlSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 220" className="w-full h-full">
      <defs>
        <radialGradient id="bicepGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="1"/>
          <stop offset="100%" stopColor={gc} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Floor */}
      <line x1="10" y1="215" x2="270" y2="215" stroke="#334155" strokeWidth="2" strokeDasharray="8 5" opacity="0.5"/>

      {/* Head */}
      <circle cx="140" cy="38" r="20" fill="#e2d9c8"/>
      {/* Torso */}
      <rect x="108" y="58" width="64" height="92" rx="14" fill="#cbd5e1"/>
      {/* Shoulders */}
      <ellipse cx="108" cy="72" rx="18" ry="16" fill="#b0bec5"/>
      <ellipse cx="172" cy="72" rx="18" ry="16" fill="#b0bec5"/>

      {/* Bicep glow L */}
      <ellipse cx="94" cy="108" rx="16" ry="26" fill={`url(#bicepGlow)`} className="animate-pulse"/>
      {/* Bicep glow R */}
      <ellipse cx="186" cy="108" rx="16" ry="26" fill={`url(#bicepGlow)`} className="animate-[pulse_2s_ease-in-out_infinite_reverse]" opacity="0.7"/>

      {/* Right arm curling */}
      <g style={{ transformOrigin: '172px 88px', animation: 'spin 2s ease-in-out infinite alternate' }}>
        <line x1="172" y1="88" x2="172" y2="145" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <line x1="172" y1="145" x2="166" y2="178" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round"/>
        <rect x="151" y="173" width="32" height="10" rx="4" fill="#475569"/>
        <rect x="148" y="168" width="8" height="18" rx="3" fill="#334155"/>
        <rect x="180" y="168" width="8" height="18" rx="3" fill="#334155"/>
      </g>

      {/* Left arm curling (reverse phase) */}
      <g style={{ transformOrigin: '108px 88px', animation: 'spin 2s ease-in-out infinite alternate-reverse' }}>
        <line x1="108" y1="88" x2="108" y2="145" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <line x1="108" y1="145" x2="114" y2="178" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round"/>
        <rect x="97" y="173" width="32" height="10" rx="4" fill="#475569"/>
        <rect x="94" y="168" width="8" height="18" rx="3" fill="#334155"/>
        <rect x="126" y="168" width="8" height="18" rx="3" fill="#334155"/>
      </g>

      {/* Legs standing */}
      <line x1="126" y1="150" x2="118" y2="213" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
      <line x1="154" y1="150" x2="162" y2="213" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
      <ellipse cx="117" cy="214" rx="13" ry="5" fill="#64748b"/>
      <ellipse cx="162" cy="214" rx="13" ry="5" fill="#64748b"/>
    </svg>
  );
}

function ShoulderPressSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 220" className="w-full h-full">
      <defs>
        <radialGradient id="deltGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="1"/>
          <stop offset="100%" stopColor={gc} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <line x1="10" y1="215" x2="270" y2="215" stroke="#334155" strokeWidth="2" strokeDasharray="8 5" opacity="0.5"/>

      {/* Barbell overhead (animated) */}
      <g className="animate-[bounce_2s_ease-in-out_infinite]">
        <rect x="60" y="18" width="160" height="8" rx="4" fill="#94a3b8"/>
        <rect x="45" y="10" width="20" height="24" rx="4" fill="#475569"/>
        <rect x="215" y="10" width="20" height="24" rx="4" fill="#475569"/>
      </g>

      {/* Delt glow */}
      <ellipse cx="107" cy="82" rx="20" ry="20" fill={`url(#deltGlow)`} className="animate-pulse"/>
      <ellipse cx="173" cy="82" rx="20" ry="20" fill={`url(#deltGlow)`} className="animate-pulse"/>

      {/* Head */}
      <circle cx="140" cy="50" r="20" fill="#e2d9c8"/>
      {/* Torso */}
      <rect x="108" y="70" width="64" height="88" rx="14" fill="#cbd5e1"/>
      {/* Shoulders */}
      <ellipse cx="108" cy="82" rx="20" ry="18" fill="#b0bec5"/>
      <ellipse cx="172" cy="82" rx="20" ry="18" fill="#b0bec5"/>

      {/* Arms pressing up */}
      <g className="animate-[bounce_2s_ease-in-out_infinite]">
        <line x1="108" y1="76" x2="82" y2="30" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <line x1="172" y1="76" x2="198" y2="30" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
      </g>

      {/* Legs */}
      <line x1="126" y1="158" x2="118" y2="213" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
      <line x1="154" y1="158" x2="162" y2="213" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
      <ellipse cx="117" cy="214" rx="13" ry="5" fill="#64748b"/>
      <ellipse cx="162" cy="214" rx="13" ry="5" fill="#64748b"/>
    </svg>
  );
}

function CoreSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 200" className="w-full h-full">
      <defs>
        <radialGradient id="absGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="0.95"/>
          <stop offset="100%" stopColor={gc} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Mat */}
      <rect x="20" y="165" width="240" height="16" rx="7" fill="#1e3a2f" opacity="0.7"/>

      {/* Legs bent on floor */}
      <line x1="126" y1="165" x2="95" y2="172" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round"/>
      <line x1="154" y1="165" x2="185" y2="172" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round"/>
      <line x1="95" y1="172" x2="82" y2="145" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round"/>
      <line x1="185" y1="172" x2="198" y2="145" stroke="#94a3b8" strokeWidth="14" strokeLinecap="round"/>
      <ellipse cx="140" cy="166" rx="34" ry="14" fill="#b0bec5"/>

      {/* Torso crunching */}
      <g className="animate-[bounce_2s_ease-in-out_infinite]">
        {/* Abs glow */}
        <ellipse cx="140" cy="138" rx="30" ry="34" fill={`url(#absGlow)`}/>
        {/* Torso */}
        <rect x="108" y="100" width="64" height="68" rx="14" fill="#cbd5e1"/>
        {/* Ab detail lines */}
        <line x1="140" y1="106" x2="140" y2="162" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5 4"/>
        <line x1="118" y1="130" x2="162" y2="130" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <line x1="118" y1="148" x2="162" y2="148" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        {/* Arms behind head */}
        <line x1="108" y1="112" x2="75" y2="96" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round"/>
        <line x1="172" y1="112" x2="205" y2="96" stroke="#94a3b8" strokeWidth="11" strokeLinecap="round"/>
        <circle cx="73" cy="94" r="8" fill="#b0bec5"/>
        <circle cx="207" cy="94" r="8" fill="#b0bec5"/>
        {/* Head */}
        <circle cx="140" cy="82" r="20" fill="#e2d9c8"/>
      </g>
    </svg>
  );
}

function CardioSVG({ gc }: { gc: string }) {
  return (
    <svg viewBox="0 0 280 220" className="w-full h-full">
      <defs>
        <radialGradient id="cardioGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gc} stopOpacity="0.8"/>
          <stop offset="100%" stopColor={gc} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <line x1="10" y1="215" x2="270" y2="215" stroke="#334155" strokeWidth="2" strokeDasharray="8 5" opacity="0.5"/>

      {/* Heart-rate pulse line */}
      <polyline points="10,185 50,185 65,155 80,215 95,155 110,185 270,185"
        stroke={gc} strokeWidth="2.5" fill="none" opacity="0.5" strokeLinecap="round" strokeLinejoin="round"
        className="animate-pulse"/>

      {/* Body running */}
      <g className="animate-[bounce_0.8s_ease-in-out_infinite]">
        {/* Full-body glow */}
        <ellipse cx="140" cy="120" rx="40" ry="70" fill={`url(#cardioGlow)`} opacity="0.5"/>
        {/* Head */}
        <circle cx="148" cy="46" r="20" fill="#e2d9c8"/>
        {/* Torso (lean forward) */}
        <rect x="112" y="65" width="60" height="78" rx="14" fill="#cbd5e1" transform="rotate(-8 140 105)"/>
        {/* Front arm */}
        <line x1="118" y1="78" x2="88" y2="115" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round"/>
        <line x1="88" y1="115" x2="78" y2="148" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round"/>
        {/* Back arm */}
        <line x1="162" y1="78" x2="192" y2="108" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round"/>
        <line x1="192" y1="108" x2="204" y2="140" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round"/>
        {/* Front leg */}
        <line x1="132" y1="143" x2="114" y2="190" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
        <line x1="114" y1="190" x2="92" y2="213" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <ellipse cx="90" cy="214" rx="13" ry="5" fill="#64748b"/>
        {/* Back leg */}
        <line x1="152" y1="143" x2="178" y2="185" stroke="#94a3b8" strokeWidth="15" strokeLinecap="round"/>
        <line x1="178" y1="185" x2="188" y2="213" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round"/>
        <ellipse cx="188" cy="214" rx="13" ry="5" fill="#64748b"/>
      </g>

      {/* Speed lines */}
      <line x1="22" y1="80" x2="55" y2="80" stroke="white" strokeWidth="2" opacity="0.15" strokeLinecap="round"/>
      <line x1="15" y1="95" x2="52" y2="95" stroke="white" strokeWidth="2" opacity="0.1" strokeLinecap="round"/>
    </svg>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ExerciseAnimation({ exerciseType, className = 'w-full h-56' }: ExerciseAnimationProps) {
  const key = classifyExercise(exerciseType);
  const meta = EXERCISE_META[key];
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIdx(p => {
        const next = (p + 1) % PHASES.length;
        if (next === 0) setRepCount(r => r + 1);
        return next;
      });
    }, 1100);
    return () => clearInterval(timer);
  }, [exerciseType]);

  const phase = PHASES[phaseIdx];
  const phaseIcon = phaseIdx === 0 ? '⬇' : phaseIdx === 1 ? '⬆' : '🔥';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl flex flex-col ${className}`}
      style={{ background: `linear-gradient(135deg, ${meta.bgFrom} 0%, #0d1a14 50%, ${meta.bgTo} 100%)` }}
    >
      {/* Animated grid bg */}
      <div className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `linear-gradient(${meta.glowColor}55 1px, transparent 1px), linear-gradient(90deg, ${meta.glowColor}55 1px, transparent 1px)`,
          backgroundSize: '22px 22px',
        }}
      />

      {/* Radial glow behind figure */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 rounded-full opacity-20 animate-pulse"
          style={{ background: `radial-gradient(circle, ${meta.glowColor} 0%, transparent 70%)` }} />
      </div>

      {/* ── TOP BAR ── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full animate-ping shrink-0" style={{ backgroundColor: meta.glowColor }} />
          <span className="text-[11px] font-black text-white uppercase tracking-widest truncate">{meta.label}</span>
        </div>
        <div
          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-white shrink-0"
          style={{ backgroundColor: `${meta.glowColor}33`, border: `1px solid ${meta.glowColor}77` }}
        >
          {phaseIcon} {phase.split(' ')[0]}
        </div>
      </div>

      {/* ── SVG ANIMATION CANVAS ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2"
        style={{ filter: `drop-shadow(0 0 16px ${meta.glowColor}66)` }}>
        {key === 'press'    && <BenchPressSVG    gc={meta.glowColor} />}
        {key === 'squat'    && <SquatSVG         gc={meta.glowColor} />}
        {key === 'pull'     && <PullUpSVG        gc={meta.glowColor} />}
        {key === 'curl'     && <CurlSVG          gc={meta.glowColor} />}
        {key === 'shoulder' && <ShoulderPressSVG gc={meta.glowColor} />}
        {key === 'core'     && <CoreSVG          gc={meta.glowColor} />}
        {key === 'cardio'   && <CardioSVG        gc={meta.glowColor} />}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="relative z-10 border-t border-white/10 px-4 py-2 flex items-center justify-between gap-3">
        {/* Muscle badges */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
          {meta.muscles.map((m, i) => (
            <span key={i}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
              style={{
                color: i === 0 ? meta.glowColor : 'rgba(255,255,255,0.6)',
                borderColor: i === 0 ? `${meta.glowColor}66` : 'rgba(255,255,255,0.1)',
                backgroundColor: i === 0 ? `${meta.glowColor}18` : 'rgba(255,255,255,0.04)',
              }}
            >
              {m}
            </span>
          ))}
        </div>

        {/* Rep counter */}
        <div className="shrink-0 text-right">
          <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Reps</p>
          <p className="text-lg font-black leading-none" style={{ color: meta.glowColor }}>
            {String(repCount % 16).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Phase progress bar */}
      <div className="relative z-10 h-1 bg-white/5">
        <div
          className="h-full transition-all duration-1000 ease-in-out"
          style={{
            width: `${((phaseIdx + 1) / PHASES.length) * 100}%`,
            backgroundColor: meta.glowColor,
          }}
        />
      </div>
    </div>
  );
}
