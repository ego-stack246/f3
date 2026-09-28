import type { JointPositions } from '../components/exercise/ExerciseFigure';

export type ExerciseKeyframeData = {
  name: string;
  phases: string[];
  keyframes: JointPositions[];
  targetAngles: { joint: string; target: number; tolerance: number }[];
};

// Standardized a 100x100 grid for coordinates
export const EXERCISE_KEYFRAMES: Record<string, ExerciseKeyframeData> = {
  squat: {
    name: 'Squat',
    phases: ['Standing tall, feet shoulder-width', 'Hips back, knees bent parallel'],
    targetAngles: [
      { joint: 'hip', target: 90, tolerance: 15 },
      { joint: 'knee', target: 90, tolerance: 15 }
    ],
    keyframes: [
      // Phase 1: Standing
      {
        head: { x: 50, y: 10 },
        lShoulder: { x: 40, y: 25 }, rShoulder: { x: 60, y: 25 },
        lElbow: { x: 35, y: 40 }, rElbow: { x: 65, y: 40 },
        lWrist: { x: 45, y: 35 }, rWrist: { x: 55, y: 35 }, // Hands clasped in front
        lHip: { x: 45, y: 50 }, rHip: { x: 55, y: 50 },
        lKnee: { x: 45, y: 75 }, rKnee: { x: 55, y: 75 },
        lAnkle: { x: 45, y: 95 }, rAnkle: { x: 55, y: 95 },
      },
      // Phase 2: Squat down
      {
        head: { x: 55, y: 30 }, // Leaning forward slightly
        lShoulder: { x: 45, y: 45 }, rShoulder: { x: 65, y: 45 },
        lElbow: { x: 40, y: 55 }, rElbow: { x: 70, y: 55 },
        lWrist: { x: 50, y: 50 }, rWrist: { x: 60, y: 50 },
        lHip: { x: 40, y: 65 }, rHip: { x: 50, y: 65 }, // Hips pushed back and down
        lKnee: { x: 55, y: 65 }, rKnee: { x: 65, y: 65 }, // Knees forward
        lAnkle: { x: 45, y: 95 }, rAnkle: { x: 55, y: 95 }, // Ankles stay planted
      }
    ]
  },
  lunge: {
    name: 'Lunge',
    phases: ['Standing', 'Stepping forward, back knee down'],
    targetAngles: [
      { joint: 'knee', target: 90, tolerance: 15 }
    ],
    keyframes: [
      // Phase 1: Standing
      {
        head: { x: 50, y: 10 },
        lShoulder: { x: 50, y: 25 }, rShoulder: { x: 50, y: 25 },
        lElbow: { x: 45, y: 40 }, rElbow: { x: 55, y: 40 },
        lWrist: { x: 45, y: 50 }, rWrist: { x: 55, y: 50 },
        lHip: { x: 50, y: 50 }, rHip: { x: 50, y: 50 },
        lKnee: { x: 50, y: 75 }, rKnee: { x: 50, y: 75 },
        lAnkle: { x: 50, y: 95 }, rAnkle: { x: 50, y: 95 },
      },
      // Phase 2: Lunge (Side profile)
      {
        head: { x: 50, y: 15 },
        lShoulder: { x: 50, y: 30 }, rShoulder: { x: 50, y: 30 },
        lElbow: { x: 45, y: 45 }, rElbow: { x: 55, y: 45 },
        lWrist: { x: 45, y: 55 }, rWrist: { x: 55, y: 55 },
        lHip: { x: 50, y: 55 }, rHip: { x: 50, y: 55 },
        lKnee: { x: 30, y: 75 }, rKnee: { x: 70, y: 85 }, // Left knee forward, right knee down
        lAnkle: { x: 30, y: 95 }, rAnkle: { x: 75, y: 95 }, // Left foot forward, right foot back
      }
    ]
  }
};

export function getExerciseKeyframes(exerciseId: string) {
  const normalized = exerciseId.toLowerCase().replace(' ', '');
  return EXERCISE_KEYFRAMES[normalized] || EXERCISE_KEYFRAMES['squat'];
}
