# Frontend Audit Report

## Stack Overview
- **Package Manager**: npm (verified via `package-lock.json`)
- **Bundler / Framework**: Vite + React + TypeScript
- **Router**: `react-router-dom` (React Router v7)
- **State Management**: React Context (`AuthContext.tsx`) and local component state. No global stores like Redux or Zustand are present.
- **Styling**: Tailwind CSS (v3.4), Framer Motion for animations.
- **Icons**: Lucide React.
- **AI/ML Dependencies**: `@google/genai` (Gemini), `@mediapipe/tasks-vision` (client-side pose detection).

## Existing Pages & Routes
- `/` - Landing
- `/login` - Login/Auth
- `/dashboard` - Main User Dashboard
- `/workouts` - Workout Routines & Exercise Catalog
- `/posture` - AI Posture Coach (MediaPipe implementation)
- `/calculator` - Calorie Calculator (Mocked AI text output)
- `/leaderboard` - Community Leaderboard (Mocked UI)
- `/targeted-muscle` - Targeted Muscle selector

## API Integration State
- The frontend currently relies entirely on **mock data** (e.g., `DEFAULT_USER` in `AuthContext.tsx`, hardcoded exercises in `ExerciseDetailModal.tsx`).
- Network requests for the backend don't exist yet; API integration must be built by replacing the mock arrays and `setTimeout` promises with an `api/` client layer using `fetch` or a data fetching library.

## Exercise List Supported by Posture Coach
Found in `src/lib/poseAnalysis.ts`, the `ExerciseType` union type includes:
- `general_posture`
- `squat`
- `lunge`
- `plank`
- `tree_pose`
- `warrior_pose`
- `jumping_jack`
- `mountain_climber`
- `crunch`
- `russian_twist`
- `leg_raise`
- `heel_touch`
- `spine_twist`
- `standing_stretch`
- `bicep_curl`
- `overhead_press`
- `bench_press`
- `deadlift`
- `pull_up`
- `calf_raise`
- `push_up`
- `side_arm_raise`
- `arm_circles`
- `punches`

The backend seed must include these exercises to ensure the AI Posture Coach functions properly out of the box.
