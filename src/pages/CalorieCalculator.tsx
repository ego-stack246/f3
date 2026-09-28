import { useState } from 'react';
import { Calculator, Activity, Flame, Loader2, Lightbulb, UtensilsCrossed, Sparkles } from 'lucide-react';
import { safeGenerateContent, CALORIE_SYSTEM_INSTRUCTION } from '../lib/gemini';

interface CalorieResult {
  calories: number;
  met: number;
  breakdown: string;
  tips: string[];
  diet_suggestion: string;
}

const EXERCISE_OPTIONS = [
  // Chest
  'Barbell Bench Press', 'Dumbbell Fly', 'Push-Up', 'Cable Crossover', 'Incline Bench Press',
  // Back
  'Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Deadlift',
  // Legs
  'Barbell Squat', 'Leg Press', 'Lunges', 'Leg Curl', 'Leg Extension', 'Calf Raise',
  // Shoulders
  'Overhead Press', 'Lateral Raise', 'Face Pull', 'Arnold Press',
  // Arms
  'Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crusher',
  // Core
  'Crunches', 'Plank', 'Russian Twist', 'Leg Raise', 'Mountain Climbers',
  // Cardio
  'Running', 'Cycling', 'Jump Rope', 'Swimming', 'Rowing Machine', 'Elliptical',
  // Feet & Calves
  'Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise', 'Bosu Ball Balance',
  // Flexibility
  'Yoga', 'Stretching', 'Pilates',
];

export default function CalorieCalculator() {
  const [form, setForm] = useState({
    exercise: '',
    weight: 70,
    age: 25,
    height: 170,
    gender: 'male' as 'male' | 'female',
    duration: 30,
    intensity: 'medium',
  });

  const [result, setResult] = useState<CalorieResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.exercise) {
      setError('Please select or type an exercise.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);

    const prompt = `Calculate the calorie burn for the following:
- Exercise: ${form.exercise}
- Duration: ${form.duration} minutes
- Intensity: ${form.intensity}
- Weight: ${form.weight} kg
- Age: ${form.age} years
- Height: ${form.height} cm
- Gender: ${form.gender}

Respond ONLY with the JSON object as specified.`;

    try {
      const response = await safeGenerateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: CALORIE_SYSTEM_INSTRUCTION,
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      });

      const text = response.text ?? '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed: CalorieResult = JSON.parse(jsonMatch[0]);
        setResult(parsed);
      } else {
        // Fallback estimate calculation
        const burned = Math.round(5.5 * 3.5 * (form.weight / 200) * form.duration);
        setResult({
          calories: burned,
          met: 5.5,
          breakdown: `Estimated ~${burned} kcal burned doing ${form.exercise || 'workout'} for ${form.duration} mins.`,
          tips: [
            'Maintain steady posture and controlled breathing throughout your workout.',
            'Keep your core engaged to protect your spine.',
            'Stay hydrated before and after exercising.'
          ],
          diet_suggestion: 'Enjoy a lean protein snack with complex carbs post-workout.'
        });
      }
    } catch (err) {
      console.error('Calorie calc error:', err);
      const burned = Math.round(5.5 * 3.5 * (form.weight / 200) * form.duration);
      setResult({
        calories: burned,
        met: 5.5,
        breakdown: `Estimated ~${burned} kcal burned doing ${form.exercise || 'workout'} for ${form.duration} mins.`,
        tips: [
          'Maintain steady posture and controlled breathing throughout your workout.',
          'Keep your core engaged to protect your spine.',
          'Stay hydrated before and after exercising.'
        ],
        diet_suggestion: 'Enjoy a lean protein snack with complex carbs post-workout.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-5xl mx-auto">
      <header className="text-center">
        <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-3xl font-bold">AI Calorie Burn Estimator</h1>
        <p className="text-earth-800/70 mt-3 max-w-2xl mx-auto">
          Tell us your details and which exercise you're doing — our AI will estimate your calorie burn, give you training tips, and suggest a post-workout meal.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-12">
        {/* Form — takes 2 cols */}
        <div className="lg:col-span-2 glass-card p-8">
          <form onSubmit={calculate} className="space-y-5">
            {/* Exercise */}
            <div>
              <label className="block text-sm font-medium text-earth-900 mb-2">Exercise</label>
              <input
                list="exercise-options"
                value={form.exercise}
                onChange={(e) => setForm({ ...form, exercise: e.target.value })}
                placeholder="Type or select an exercise..."
                className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
              />
              <datalist id="exercise-options">
                {EXERCISE_OPTIONS.map((ex) => (
                  <option key={ex} value={ex} />
                ))}
              </datalist>
            </div>

            {/* Weight & Age */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-earth-900 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                  className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  min="30" max="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-900 mb-2">Age</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                  className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  min="10" max="100"
                />
              </div>
            </div>

            {/* Height & Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-earth-900 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: Number(e.target.value) })}
                  className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  min="100" max="250"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-900 mb-2">Gender</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['male', 'female'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm({ ...form, gender: g })}
                      className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                        form.gender === g
                          ? 'bg-sage-600 text-white border-sage-600 shadow-md'
                          : 'bg-white/50 text-earth-800 border-cream-300 hover:bg-cream-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-earth-900 mb-2">Duration (minutes)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                min="5" max="300"
              />
            </div>

            {/* Intensity */}
            <div>
              <label className="block text-sm font-medium text-earth-900 mb-2">Workout Intensity</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setForm({ ...form, intensity: level })}
                    className={`py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                      form.intensity === level
                        ? 'bg-sage-600 text-white border-sage-600 shadow-md'
                        : 'bg-white/50 text-earth-800 border-cream-300 hover:bg-cream-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-4 mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" /> Calculate with AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results — takes 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {error && (
            <div className="glass-card p-6 border-red-200 bg-red-50/50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {result ? (
            <>
              {/* Main calorie card */}
              <div className="glass-card p-10 text-center animate-slide-up flex flex-col items-center">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Flame className="w-10 h-10 text-orange-500" />
                </div>
                <p className="text-earth-800 font-medium mb-1">Estimated Calories Burned</p>
                <p className="text-xs text-earth-800/50 mb-4">{form.exercise} · {form.duration} min · {form.intensity} intensity</p>
                <h2 className="text-6xl font-bold font-display text-earth-900">{result.calories}</h2>
                <p className="text-earth-800/60 mt-2">kcal</p>

                <div className="mt-6 pt-6 border-t border-earth-900/10 w-full text-left">
                  <p className="text-sm text-earth-800/70">{result.breakdown}</p>
                  <p className="text-xs text-earth-800/40 mt-2">MET value used: {result.met}</p>
                </div>

                {/* Food equivalents */}
                <div className="mt-6 pt-6 border-t border-earth-900/10 w-full text-left">
                  <h4 className="font-semibold text-sm mb-4">Breakdown Equivalent</h4>
                  <div className="space-y-3 text-sm text-earth-800/80">
                    <div className="flex items-center justify-between">
                      <span>Apples</span>
                      <span className="font-medium">~{Math.round(result.calories / 95 * 10) / 10} apples</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Rice (cups)</span>
                      <span className="font-medium">~{Math.round(result.calories / 205 * 10) / 10} cups</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Eggs</span>
                      <span className="font-medium">~{Math.round(result.calories / 78 * 10) / 10} eggs</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Training Tips
                </h4>
                <ul className="space-y-3 text-sm text-earth-800/80">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-5 h-5 bg-sage-100 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-sage-700">{i + 1}</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diet suggestion card */}
              <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-sage-600" /> Post-Workout Meal Suggestion
                </h4>
                <p className="text-sm text-earth-800/80">{result.diet_suggestion}</p>
              </div>
            </>
          ) : !isLoading ? (
            <div className="glass-card p-12 text-center w-full h-full flex flex-col items-center justify-center border-dashed border-2 border-cream-300/50 bg-white/20">
              <Activity className="w-12 h-12 text-sage-300 mb-4" />
              <p className="text-earth-800/60 font-medium">Enter your details and an exercise to get AI-powered calorie estimates, training tips, and meal suggestions.</p>
            </div>
          ) : (
            <div className="glass-card p-12 text-center w-full flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-sage-400 animate-spin mb-4" />
              <p className="text-earth-800/60 font-medium">Gemini is analyzing your workout...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
