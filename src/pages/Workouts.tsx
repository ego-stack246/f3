import { useState } from 'react';
import { Play, Clock, Flame, Filter, Camera, Repeat, Dumbbell, Wrench, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import type { WorkoutDetail } from '../components/ExerciseDetailModal';
import exercisesData from '../data/exercises-library.json';


const capitalize = (s) => s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const mapCategory = (bodyPart) => {
  const map = {
    'waist': 'Core',
    'chest': 'Chest',
    'back': 'Back',
    'shoulders': 'Shoulders',
    'upper arms': 'Arms',
    'lower arms': 'Arms',
    'upper legs': 'Legs',
    'lower legs': 'Calves & Feet',
    'cardio': 'Cardio',
    'neck': 'Neck'
  };
  return map[bodyPart.toLowerCase()] || 'Other';
};

const EXTRA_WORKOUTS = exercisesData.map((ex, i) => ({
  id: 1000 + i,
  title: capitalize(ex.name),
  category: mapCategory(ex.bodyPart),
  type: ex.bodyPart.toLowerCase() === 'cardio' ? 'Cardio' : 'Strength',
  level: 'Intermediate' as const,
  duration: '10 min',
  reps: '3 × 12 reps',
  cals: 80,
  equipment: capitalize(ex.equipment),
  image: ex.gifUrl,
  exercise: 'push_up',
  musclesWorked: [capitalize(ex.target)],
  instructions: ex.instructions,
  mistakes: []
}));

const WORKOUTS: WorkoutDetail[] = [
  // ─── CHEST ────────────────────────────────────────
  { id: 1,   title: 'Push-Up',                     category: 'Chest',      type: 'Strength',    level: 'Beginner',     duration: '10 min', reps: '4 × 15 reps',       cals: 80,  equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0662-I4hDWkc.gif', exercise: 'push_up', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/chest/push-up', musclesWorked: ['Pectoralis Major', 'Triceps', 'Anterior Deltoid', 'Core Stabilizers'], instructions: ['Place hands shoulder-width apart on the floor with fingers pointed forward.', 'Keep your body in a straight plank line from head to heels.', 'Lower your chest to within 1 inch of the floor, keeping elbows at a 45-degree angle.', 'Push forcefully back up to starting plank position.'], mistakes: ['Flaring elbows out to 90 degrees.', 'Sagging lower back or arching hips up.', 'Half reps — not lowering all the way down.'], breathing: 'Inhale on the way down, exhale as you push yourself back up.' },
  { id: 2,   title: 'Barbell Bench Press',         category: 'Chest',      type: 'Strength',    level: 'Intermediate', duration: '15 min', reps: '4 × 8-12 reps',     cals: 130, equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0025-EIeI8Vf.gif', exercise: 'bench_press', musclewikiUrl: 'https://musclewiki.com/barbell/male/chest/barbell-bench-press', musclesWorked: ['Pectoralis Major', 'Triceps Brachii', 'Anterior Deltoids'], instructions: ['Lie flat on the bench with feet firmly planted on the ground.', 'Grasp the barbell slightly wider than shoulder-width with wrists straight.', 'Unrack the bar and lower it smoothly to mid-chest level.', 'Press the bar back up until arms are extended, keeping shoulder blades pinched.'], mistakes: ['Bouncing the bar off your chest.', 'Flaring elbows excessively wide.', 'Lifting feet or hips off the bench during heavy press.'] },
  { id: 3,   title: 'Dumbbell Fly',                category: 'Chest',      type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '3 × 12 reps',       cals: 90,  equipment: 'Dumbbells',   image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0308-yz9nUhF.gif', exercise: 'bench_press', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/chest/dumbbell-fly' },
  { id: 4,   title: 'Incline Dumbbell Press',      category: 'Chest',      type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '4 × 10 reps',       cals: 110, equipment: 'Dumbbells',   image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=500', exercise: 'bench_press', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/chest/dumbbell-incline-bench-press' },
  { id: 5,   title: 'Cable Crossover',             category: 'Chest',      type: 'Strength',    level: 'Intermediate', duration: '10 min', reps: '3 × 15 reps',       cals: 85,  equipment: 'Cable',       image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=500', exercise: 'bench_press', musclewikiUrl: 'https://musclewiki.com/cables/male/chest/cable-crossover' },
  { id: 6,   title: 'Chest Dips',                  category: 'Chest',      type: 'Strength',    level: 'Advanced',     duration: '10 min', reps: '4 × 10 reps',       cals: 120, equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0251-9WTm7dq.gif', exercise: 'plank', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/chest/chest-dips' },

  // ─── BACK ─────────────────────────────────────────
  { id: 7,   title: 'Pull-Up',                     category: 'Back',       type: 'Strength',    level: 'Intermediate', duration: '10 min', reps: '4 × 8-10 reps',     cals: 100, equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/3293-72BC5Za.gif', exercise: 'pull_up', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/lats/pull-up', musclesWorked: ['Latissimus Dorsi', 'Rhomboids', 'Biceps', 'Core'], instructions: ['Grasp pull-up bar overhand with hands wider than shoulders.', 'Hang with arms fully extended and engage your shoulder blades down.', 'Pull yourself up until chin passes over the bar.', 'Lower under control to a full dead hang position.'], mistakes: ['Kipping or swinging legs for momentum.', 'Not reaching full chin-over-bar height.', 'Shrugging shoulders into ears.'] },
  { id: 8,   title: 'Barbell Bent Over Row',       category: 'Back',       type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '4 × 10 reps',       cals: 120, equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0027-eZyBC3j.gif', exercise: 'deadlift', musclewikiUrl: 'https://musclewiki.com/barbell/male/lats/barbell-bent-over-row' },
  { id: 9,   title: 'Lat Pulldown',                category: 'Back',       type: 'Strength',    level: 'Beginner',     duration: '10 min', reps: '3 × 12 reps',       cals: 85,  equipment: 'Cable',       image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/2330-LEprlgG.gif', exercise: 'pull_up', musclewikiUrl: 'https://musclewiki.com/cables/male/lats/cable-lat-pulldown' },
  { id: 10,  title: 'Seated Cable Row',            category: 'Back',       type: 'Strength',    level: 'Beginner',     duration: '10 min', reps: '3 × 12 reps',       cals: 80,  equipment: 'Cable',       image: 'https://images.unsplash.com/photo-1521804906057-1df8fdb718b7?auto=format&fit=crop&q=80&w=500', exercise: 'deadlift', musclewikiUrl: 'https://musclewiki.com/cables/male/lats/cable-seated-row' },
  { id: 11,  title: 'Deadlift',                    category: 'Back',       type: 'Strength',    level: 'Advanced',     duration: '15 min', reps: '5 × 5 reps',        cals: 200, equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1009-kuMiR2T.gif', exercise: 'deadlift', musclewikiUrl: 'https://musclewiki.com/barbell/male/lats/barbell-deadlift' },
  { id: 12,  title: 'Dumbbell Single Arm Row',     category: 'Back',       type: 'Strength',    level: 'Beginner',     duration: '10 min', reps: '3 × 12 reps/arm',   cals: 90,  equipment: 'Dumbbells',   image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=500', exercise: 'deadlift', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/lats/dumbbell-row' },

  // ─── SHOULDERS ────────────────────────────────────
  { id: 13,  title: 'Overhead Press',               category: 'Shoulders',  type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '4 × 8-10 reps',     cals: 110, equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1012-u4bAmKp.gif', exercise: 'overhead_press', musclewikiUrl: 'https://musclewiki.com/barbell/male/shoulders/barbell-overhead-press' },
  { id: 14,  title: 'Dumbbell Lateral Raise',       category: 'Shoulders',  type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 15 reps',       cals: 60,  equipment: 'Dumbbells',   image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0334-DsgkuIt.gif', exercise: 'side_arm_raise', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/shoulders/dumbbell-lateral-raise' },
  { id: 15,  title: 'Face Pull',                    category: 'Shoulders',  type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 15 reps',       cals: 50,  equipment: 'Cable',       image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=500', exercise: 'overhead_press', musclewikiUrl: 'https://musclewiki.com/cables/male/shoulders/cable-face-pull' },
  { id: 16,  title: 'Arnold Press',                 category: 'Shoulders',  type: 'Strength',    level: 'Intermediate', duration: '10 min', reps: '3 × 10 reps',       cals: 90,  equipment: 'Dumbbells',   image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/2137-Xy4jlWA.gif', exercise: 'overhead_press', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/shoulders/dumbbell-arnold-press' },
  { id: 17,  title: 'Rear Delt Fly',                category: 'Shoulders',  type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 15 reps',       cals: 55,  equipment: 'Dumbbells',   image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=500', exercise: 'overhead_press', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/shoulders/dumbbell-rear-delt-fly' },
  { id: 40,  title: 'Arm Circles',                  category: 'Shoulders',  type: 'Flexibility', level: 'Beginner',     duration: '5 min',  reps: '3 × 30 sec',        cals: 30,  equipment: 'Bodyweight',  image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500', exercise: 'arm_circles' },

  // ─── BICEPS ───────────────────────────────────────
  { id: 18,  title: 'Barbell Curl',                 category: 'Biceps',     type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 12 reps',       cals: 55,  equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0031-25GPyDY.gif', exercise: 'bicep_curl', musclewikiUrl: 'https://musclewiki.com/barbell/male/biceps/barbell-curl' },
  { id: 19,  title: 'Hammer Curl',                  category: 'Biceps',     type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 12 reps',       cals: 50,  equipment: 'Dumbbells',   image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0165-HPlPoQA.gif', exercise: 'bicep_curl', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/biceps/dumbbell-hammer-curl' },
  { id: 20,  title: 'Concentration Curl',           category: 'Biceps',     type: 'Strength',    level: 'Intermediate', duration: '8 min',  reps: '3 × 10 reps/arm',   cals: 45,  equipment: 'Dumbbells',   image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0976-kmVVAfu.gif', exercise: 'bicep_curl', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/biceps/dumbbell-concentration-curl' },

  // ─── TRICEPS ──────────────────────────────────────
  { id: 21,  title: 'Tricep Pushdown',              category: 'Triceps',    type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 15 reps',       cals: 50,  equipment: 'Cable',       image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1723-qRZ5S1N.gif', exercise: 'bench_press', musclewikiUrl: 'https://musclewiki.com/cables/male/triceps/cable-pushdown' },
  { id: 22,  title: 'Skull Crusher',                category: 'Triceps',    type: 'Strength',    level: 'Intermediate', duration: '10 min', reps: '3 × 10 reps',       cals: 70,  equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0060-h8LFzo9.gif', exercise: 'bench_press', musclewikiUrl: 'https://musclewiki.com/barbell/male/triceps/barbell-skull-crusher' },
  { id: 23,  title: 'Tricep Dips',                  category: 'Triceps',    type: 'Strength',    level: 'Intermediate', duration: '10 min', reps: '3 × 12 reps',       cals: 80,  equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0814-X6C6i5Y.gif', exercise: 'plank', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/triceps/tricep-dips' },

  // ─── LEGS ─────────────────────────────────────────
  { id: 24,  title: 'Barbell Back Squat',           category: 'Legs',       type: 'Strength',    level: 'Intermediate', duration: '15 min', reps: '5 × 5 reps',        cals: 180, equipment: 'Barbell',     image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=500', exercise: 'squat', musclewikiUrl: 'https://musclewiki.com/barbell/male/quads/barbell-squat', musclesWorked: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings', 'Lower Back'], instructions: ['Stand with feet shoulder-width apart, barbell resting across upper traps.', 'Break at hips and knees simultaneously to lower into a deep squat.', 'Keep knees tracking in line with toes, chest up.', 'Drive back up through mid-foot to starting position.'], mistakes: ['Knees caving inwards.', 'Rounding upper/lower back.', 'Heels lifting off ground.'] },
  { id: 25,  title: 'Leg Press',                    category: 'Legs',       type: 'Strength',    level: 'Beginner',     duration: '12 min', reps: '4 × 12 reps',       cals: 130, equipment: 'Machine',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/2287-V07qpXy.gif', exercise: 'squat', musclewikiUrl: 'https://musclewiki.com/machine/male/quads/machine-leg-press' },
  { id: 26,  title: 'Dumbbell Walking Lunges',      category: 'Legs',       type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '3 × 12 reps/leg',   cals: 140, equipment: 'Dumbbells',   image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1460-IZVHb27.gif', exercise: 'lunge', musclewikiUrl: 'https://musclewiki.com/dumbbells/male/quads/dumbbell-lunge' },
  { id: 27,  title: 'Romanian Deadlift',            category: 'Legs',       type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '4 × 10 reps',       cals: 150, equipment: 'Barbell',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0085-wQ2c4XD.gif', exercise: 'deadlift', musclewikiUrl: 'https://musclewiki.com/barbell/male/hamstrings/barbell-romanian-deadlift' },

  // ─── CALVES & FEET ────────────────────────────────
  { id: 28,  title: 'Standing Calf Raise',          category: 'Calves & Feet', type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '4 × 20 reps',       cals: 50,  equipment: 'Machine',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1372-8ozhUIZ.gif', exercise: 'calf_raise', musclewikiUrl: 'https://musclewiki.com/machine/male/calves/machine-standing-calf-raise' },
  { id: 29,  title: 'Seated Calf Raise',            category: 'Calves & Feet', type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '4 × 20 reps',       cals: 45,  equipment: 'Machine',     image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0088-ktsFQAZ.gif', exercise: 'calf_raise', musclewikiUrl: 'https://musclewiki.com/machine/male/calves/machine-seated-calf-raise' },
  { id: 30,  title: 'Toe Raises (Tibialis)',        category: 'Calves & Feet', type: 'Strength',    level: 'Beginner',     duration: '6 min',  reps: '3 × 20 reps',       cals: 25,  equipment: 'Bodyweight',  image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=500', exercise: 'calf_raise' },
  { id: 31,  title: 'Ankle Circles',                category: 'Calves & Feet', type: 'Flexibility', level: 'Beginner',     duration: '4 min',  reps: '3 × 20 circles/dir', cals: 10, equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1368-uL9CsKm.gif', exercise: 'standing_stretch' },

  // ─── CORE ─────────────────────────────────────────
  { id: 32,  title: 'Plank Hold',                   category: 'Core',       type: 'Strength',    level: 'Beginner',     duration: '5 min',  reps: '3 × 45 sec hold',   cals: 40,  equipment: 'Bodyweight',  image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&q=80&w=500', exercise: 'plank', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/abs/plank' },
  { id: 33,  title: 'Abdominal Crunches',           category: 'Core',       type: 'Strength',    level: 'Beginner',     duration: '8 min',  reps: '3 × 20 reps',       cals: 60,  equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0972-tZkGYZ9.gif', exercise: 'crunch', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/abs/crunch' },
  { id: 34,  title: 'Russian Twist',                category: 'Core',       type: 'Strength',    level: 'Intermediate', duration: '10 min', reps: '3 × 30 reps',       cals: 90,  equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0687-XVDdcoj.gif', exercise: 'russian_twist', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/abs/russian-twist' },
  { id: 35,  title: 'Mountain Climbers',            category: 'Core',       type: 'Cardio',      level: 'Intermediate', duration: '10 min', reps: '4 × 30 sec',        cals: 120, equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/0630-RJgzwny.gif', exercise: 'mountain_climber', musclewikiUrl: 'https://musclewiki.com/bodyweight/male/abs/mountain-climber' },

  // ─── CARDIO ───────────────────────────────────────
  { id: 36,  title: 'Jumping Jacks',                category: 'Cardio',     type: 'Cardio',      level: 'Beginner',     duration: '10 min', reps: '4 × 30 reps',       cals: 100, equipment: 'Bodyweight',  image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?auto=format&fit=crop&q=80&w=500', exercise: 'jumping_jack' },
  { id: 37,  title: 'Burpee Challenge',             category: 'Cardio',     type: 'Cardio',      level: 'Advanced',     duration: '15 min', reps: '5 × 10 reps',       cals: 200, equipment: 'Bodyweight',  image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/master/videos/1160-dK9394r.gif', exercise: 'squat' },
  { id: 41,  title: 'Punches',                      category: 'Cardio',     type: 'Cardio',      level: 'Beginner',     duration: '10 min', reps: '4 × 50 reps',       cals: 150, equipment: 'Bodyweight',  image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&q=80&w=500', exercise: 'punches' },

  // ─── YOGA & FLEXIBILITY ───────────────────────────
  { id: 38,  title: 'Morning Flow Yoga',            category: 'Yoga',       type: 'Flexibility', level: 'Beginner',     duration: '15 min', reps: 'Flow sequence',     cals: 80,  equipment: 'Yoga Mat',    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500', exercise: 'tree_pose' },
  { id: 39,  title: 'Warrior Pose Series',          category: 'Yoga',       type: 'Strength',    level: 'Intermediate', duration: '12 min', reps: '5 × 30 sec/side',   cals: 70,  equipment: 'Yoga Mat',    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=500', exercise: 'warrior_pose' },
  ...EXTRA_WORKOUTS,
];

const CATEGORIES = ['All', 'Gym', ...Array.from(new Set(WORKOUTS.map(w => w.category)))].sort((a, b) => {
  if (a === 'All') return -1;
  if (b === 'All') return 1;
  if (a === 'Gym') return -1;
  if (b === 'Gym') return 1;
  return a.localeCompare(b as string);
});
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const TYPES = ['All Types', 'Strength', 'Cardio', 'Flexibility'];
const EQUIPMENT = ['All Equipment', ...Array.from(new Set(WORKOUTS.map(w => w.equipment)))].sort();

export default function Workouts() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [activeType, setActiveType] = useState('All Types');
  const [activeEquipment, setActiveEquipment] = useState('All Equipment');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetail | null>(null);

  const filteredWorkouts = WORKOUTS.filter(w => {
    let catMatch = false;
    if (activeCategory === 'All') {
      catMatch = true;
    } else if (activeCategory === 'Gym') {
      const nonGym = ['bodyweight', 'body weight', 'yoga mat', 'assisted', 'band', 'rope', 'roller'];
      catMatch = !nonGym.some(eq => w.equipment.toLowerCase().includes(eq));
    } else {
      catMatch = w.category === activeCategory;
    }
    
    const levelMatch = activeLevel === 'All Levels' || w.level === activeLevel;
    const typeMatch = activeType === 'All Types' || w.type === activeType;
    const equipMatch = activeEquipment === 'All Equipment' || w.equipment === activeEquipment;
    return catMatch && levelMatch && typeMatch && equipMatch;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Animated Demos & AI Camera
          </div>
          <h1 className="text-3xl font-bold">Routines & Exercises</h1>
          <p className="text-earth-800/70 mt-1">
            Tap any exercise card below to view **animated form video**, **step-by-step instructions**, and launch **live AI posture detection**!
          </p>
        </div>
        <div className="text-sm text-earth-800/60 font-medium">
          Showing {filteredWorkouts.length} of {WORKOUTS.length}
        </div>
      </header>

      {/* Category Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="p-2 bg-cream-200 rounded-full shrink-0 hidden md:block">
            <Filter className="w-5 h-5 text-earth-800" />
          </div>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                activeCategory === cat
                  ? "bg-sage-600 text-white border-sage-600 shadow-sm"
                  : "bg-white/50 text-earth-800 hover:bg-white border-white/40"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sub-filters: Level & Type */}
        <div className="flex flex-wrap gap-2">
          {LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                activeLevel === lvl
                  ? "bg-earth-900 text-white border-earth-900"
                  : "bg-white/30 text-earth-800/70 hover:bg-white/60 border-white/30"
              )}
            >
              {lvl}
            </button>
          ))}
          <span className="text-earth-800/20 mx-1">|</span>
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                activeType === t
                  ? "bg-earth-900 text-white border-earth-900"
                  : "bg-white/30 text-earth-800/70 hover:bg-white/60 border-white/30"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Equipment Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="p-1.5 bg-cream-200 rounded-full shrink-0 hidden md:block">
            <Wrench className="w-4 h-4 text-earth-800" />
          </div>
          {EQUIPMENT.map(eq => (
            <button
              key={eq}
              onClick={() => setActiveEquipment(eq)}
              className={cn(
                "whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border",
                activeEquipment === eq
                  ? "bg-sage-700 text-white border-sage-700"
                  : "bg-white/30 text-earth-800/60 hover:bg-white/60 border-white/30"
              )}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredWorkouts.map(workout => (
          <div
            key={workout.id}
            onClick={() => setSelectedWorkout(workout)}
            className="glass-card group overflow-hidden flex flex-col hover:-translate-y-1.5 transition-all duration-300 cursor-pointer border-white/60 hover:shadow-xl hover:border-sage-400"
          >
            {/* Image & Video Play Overlay */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={workout.image}
                alt={workout.title}
                className="w-full h-full object-cover mix-blend-multiply bg-white group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                <span className="bg-white/90 backdrop-blur text-earth-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  {workout.level}
                </span>
                <span className="bg-sage-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  {workout.category}
                </span>
              </div>

              {/* Animated Video Play Hint */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-sage-600/90 text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-sage-500 transition-all duration-300 shadow-xl border border-white/40">
                  <Play className="w-5 h-5 ml-0.5 fill-white" />
                </div>
              </div>

              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-medium">
                <span className="bg-black/50 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Play className="w-3 h-3 text-emerald-400" /> Animated Video
                </span>
                <span className="bg-black/50 backdrop-blur px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Camera className="w-3 h-3 text-sage-300" /> AI Camera
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col justify-between bg-white/60">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sage-600 mb-1">{workout.type}</p>
                <h3 className="text-base font-bold text-earth-900 group-hover:text-sage-700 transition-colors line-clamp-1">{workout.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-earth-800/70 mt-1">
                  <Repeat className="w-3 h-3 text-sage-600" />
                  <span>{workout.reps}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-earth-800/70 mt-4 pt-3 border-t border-earth-900/10">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sage-600" /> {workout.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-500" /> {workout.cals} kcal
                  </span>
                </div>

                <span className="text-sage-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                  View <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWorkouts.length === 0 && (
        <div className="text-center py-20 text-earth-800/60 flex flex-col items-center gap-2">
          <Dumbbell className="w-10 h-10 opacity-30" />
          <p>No workouts match your filters. Try adjusting your selection.</p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        isOpen={!!selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        workout={selectedWorkout}
      />
    </div>
  );
}
