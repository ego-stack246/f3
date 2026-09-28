import { useState, useEffect, useRef } from 'react';

export interface ExerciseDBEntry {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
  gifUrl: string;
}

interface UseExerciseGifResult {
  gif: string | null;
  fallbackEntry: ExerciseDBEntry | null;
  loading: boolean;
  error: boolean;
}

// Map our exercise titles/categories → ExerciseDB search terms
function buildSearchTerms(title: string, category: string, equipment: string): string[] {
  const t = title.toLowerCase();
  const c = category.toLowerCase();
  const e = equipment.toLowerCase();

  const terms: string[] = [
    t,
    `${t} ${e}`.trim(),
    `${e} ${c}`.trim(),
  ];

  // Specific overrides for common exercises
  const overrides: Record<string, string> = {
    'push-up': 'push-up',
    'push up': 'push-up',
    'barbell bench press': 'barbell bench press',
    'bench press': 'bench press',
    'pull-up': 'pull-up',
    'pull up': 'pull-up',
    'deadlift': 'deadlift',
    'squat': 'squat',
    'barbell back squat': 'barbell squat',
    'overhead press': 'overhead press',
    'barbell curl': 'barbell curl',
    'hammer curl': 'hammer curl',
    'lat pulldown': 'lat pulldown',
    'tricep pushdown': 'triceps pushdown',
    'plank': 'plank',
    'crunch': 'crunch',
    'lunge': 'lunge',
    'calf raise': 'calf raise',
    'lateral raise': 'lateral raise',
    'russian twist': 'russian twist',
    'mountain climber': 'mountain climber',
    'jumping jack': 'jumping jack',
    'burpee': 'burpee',
    'face pull': 'face pull',
    'incline': 'incline',
    'dumbbell fly': 'dumbbell fly',
    'skull crusher': 'skull crusher',
    'arnold press': 'arnold press',
    'seated cable row': 'seated cable row',
    'single arm row': 'dumbbell row',
    'romanian deadlift': 'romanian deadlift',
  };

  for (const [key, val] of Object.entries(overrides)) {
    if (t.includes(key)) {
      terms.unshift(val);
      break;
    }
  }

  return terms;
}

// In-memory cache: exerciseTitle → gifUrl
const gifCache = new Map<string, string | null>();
// Full data cache
let allExercises: ExerciseDBEntry[] | null = null;
let fetchPromise: Promise<ExerciseDBEntry[]> | null = null;

async function fetchAllExercises(): Promise<ExerciseDBEntry[]> {
  if (allExercises) return allExercises;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const res = await fetch('https://oss.exercisedb.dev/api/v1/exercises?limit=1500&offset=0', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed');
      const json = await res.json();
      allExercises = (json.data || json) as ExerciseDBEntry[];
      return allExercises;
    } catch {
      allExercises = [];
      return [];
    }
  })();

  return fetchPromise;
}

function findBestMatch(exercises: ExerciseDBEntry[], terms: string[]): ExerciseDBEntry | null {
  for (const term of terms) {
    const lower = term.toLowerCase();
    // Exact name match
    const exact = exercises.find(e => e.name.toLowerCase() === lower);
    if (exact) return exact;
    // Starts with
    const starts = exercises.find(e => e.name.toLowerCase().startsWith(lower));
    if (starts) return starts;
    // Contains
    const contains = exercises.find(e => e.name.toLowerCase().includes(lower));
    if (contains) return contains;
  }
  return null;
}

export function useExerciseGif(title: string, category: string, equipment: string): UseExerciseGifResult {
  const [gif, setGif] = useState<string | null>(null);
  const [fallbackEntry, setFallbackEntry] = useState<ExerciseDBEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    setError(false);

    const cacheKey = `${title}::${category}::${equipment}`;
    if (gifCache.has(cacheKey)) {
      const cached = gifCache.get(cacheKey);
      setGif(cached ?? null);
      setLoading(false);
      return;
    }

    const terms = buildSearchTerms(title, category, equipment);

    fetchAllExercises().then(exercises => {
      if (!mountedRef.current) return;
      if (exercises.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }
      const match = findBestMatch(exercises, terms);
      if (match) {
        gifCache.set(cacheKey, match.gifUrl);
        setGif(match.gifUrl);
        setFallbackEntry(match);
      } else {
        gifCache.set(cacheKey, null);
        setError(true);
      }
      setLoading(false);
    });

    return () => { mountedRef.current = false; };
  }, [title, category, equipment]);

  return { gif, fallbackEntry, loading, error };
}
