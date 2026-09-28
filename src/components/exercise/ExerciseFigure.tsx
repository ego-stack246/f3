
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export type JointPositions = {
  head: { x: number; y: number };
  lShoulder: { x: number; y: number };
  rShoulder: { x: number; y: number };
  lElbow: { x: number; y: number };
  rElbow: { x: number; y: number };
  lWrist: { x: number; y: number };
  rWrist: { x: number; y: number };
  lHip: { x: number; y: number };
  rHip: { x: number; y: number };
  lKnee: { x: number; y: number };
  rKnee: { x: number; y: number };
  lAnkle: { x: number; y: number };
  rAnkle: { x: number; y: number };
};

export interface ExerciseFigureProps {
  keyframes: JointPositions[];
  tempoMs?: number;
  loop?: boolean;
  size?: number;
  highlightJoints?: (keyof JointPositions)[];
  className?: string;
  isGhost?: boolean;
}

const CONNECTIONS: [keyof JointPositions, keyof JointPositions][] = [
  ['head', 'lShoulder'], ['head', 'rShoulder'],
  ['lShoulder', 'rShoulder'],
  ['lShoulder', 'lElbow'], ['lElbow', 'lWrist'],
  ['rShoulder', 'rElbow'], ['rElbow', 'rWrist'],
  ['lShoulder', 'lHip'], ['rShoulder', 'rHip'],
  ['lHip', 'rHip'],
  ['lHip', 'lKnee'], ['lKnee', 'lAnkle'],
  ['rHip', 'rKnee'], ['rKnee', 'rAnkle'],
];

export default function ExerciseFigure({
  keyframes,
  tempoMs = 2000,
  loop = true,
  size = 200,
  highlightJoints = [],
  className,
  isGhost = false
}: ExerciseFigureProps) {
  const duration = tempoMs / 1000;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // We map the array of positions into a framer-motion keyframes format
  // For each joint, x: [val1, val2], y: [val1, val2]
  const createAnimation = (joint: keyof JointPositions, axis: 'x' | 'y') => {
    if (!keyframes || keyframes.length === 0) return 0;
    if (prefersReducedMotion || keyframes.length === 1) return keyframes[0][joint][axis];
    
    // Add the first frame at the end for smooth looping if loop is true
    const values = keyframes.map(frame => frame[joint][axis]);
    if (loop && keyframes.length > 1) values.push(values[0]);
    
    return values;
  };

  const getTransition = () => {
    if (prefersReducedMotion || keyframes.length <= 1) return {};
    return {
      duration,
      repeat: loop ? Infinity : 0,
      ease: "easeInOut" as const,
      times: keyframes.length === 2 ? [0, 1] : undefined
    };
  };

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={cn("overflow-visible", className)}
      style={{ opacity: isGhost ? 0.3 : 1 }}
    >
      <g stroke={isGhost ? "#fff" : "#4ade80"} strokeWidth={isGhost ? 2 : 4} strokeLinecap="round" strokeLinejoin="round">
        {/* Draw Bones */}
        {CONNECTIONS.map(([start, end], idx) => (
          <motion.line
            key={`bone-${idx}`}
            animate={{
              x1: createAnimation(start, 'x'),
              y1: createAnimation(start, 'y'),
              x2: createAnimation(end, 'x'),
              y2: createAnimation(end, 'y')
            }}
            transition={getTransition()}
          />
        ))}
        
        {/* Draw Joints */}
        {(Object.keys(keyframes[0] || {}) as (keyof JointPositions)[]).map(joint => {
          const isHighlighted = highlightJoints.includes(joint);
          return (
            <motion.circle
              key={`joint-${joint}`}
              r={joint === 'head' ? 5 : 2.5}
              fill={isHighlighted ? "#f87171" : (isGhost ? "#fff" : "#22c55e")}
              animate={{
                cx: createAnimation(joint, 'x'),
                cy: createAnimation(joint, 'y')
              }}
              transition={getTransition()}
            />
          );
        })}
      </g>
    </svg>
  );
}
