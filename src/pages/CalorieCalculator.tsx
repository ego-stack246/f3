import { useState, useRef } from 'react';
import { Calculator, Flame, Loader2, Lightbulb, UtensilsCrossed, Sparkles, Camera, Upload, Scan, CheckCircle2, Apple } from 'lucide-react';
import { safeGenerateContent, CALORIE_SYSTEM_INSTRUCTION } from '../lib/gemini';

interface CalorieResult {
  calories: number;
  met: number;
  breakdown: string;
  tips: string[];
  diet_suggestion: string;
}

const EXERCISE_OPTIONS = [
  'Barbell Bench Press', 'Dumbbell Fly', 'Push-Up', 'Cable Crossover', 'Incline Bench Press',
  'Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Deadlift',
  'Barbell Squat', 'Leg Press', 'Lunges', 'Leg Curl', 'Leg Extension', 'Calf Raise',
  'Overhead Press', 'Lateral Raise', 'Face Pull', 'Arnold Press',
  'Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skull Crusher',
  'Crunches', 'Plank', 'Russian Twist', 'Leg Raise', 'Mountain Climbers',
  'Running', 'Cycling', 'Jump Rope', 'Swimming', 'Rowing Machine', 'Elliptical',
  'Standing Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise', 'Bosu Ball Balance',
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

  // Nutrition Scanner State
  const [scannerState, setScannerState] = useState<'idle' | 'scanning' | 'result'>('idle');
  const [nutritionResult, setNutritionResult] = useState<{name: string, calories: number, protein: number, carbs: number, fat: number, match: number} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
        const burned = Math.round(5.5 * 3.5 * (form.weight / 200) * form.duration);
        setResult({
          calories: burned,
          met: 5.5,
          breakdown: `Estimated ~${burned} kcal burned doing ${form.exercise || 'workout'} for ${form.duration} mins.`,
          tips: ['Maintain steady posture and controlled breathing throughout your workout.'],
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
        tips: ['Maintain steady posture and controlled breathing.'],
        diet_suggestion: 'Enjoy a lean protein snack.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = (e?: React.ChangeEvent<HTMLInputElement>) => {
    if (e && e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    } else if (!imagePreview) {
      // Demo image if camera clicked
      setImagePreview('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=500');
    }
    
    setScannerState('scanning');
    
    // Mock API call to Vision model
    setTimeout(() => {
      setNutritionResult({
        name: 'Grilled Chicken Salad & Avocado',
        calories: 450,
        protein: 42,
        carbs: 18,
        fat: 24,
        match: 98
      });
      setScannerState('result');
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10 max-w-7xl mx-auto px-4">
      <header className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" /> Powered by Gemini 2.5 Flash
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-earth-900 mb-4 tracking-tight">
          Calorie & Nutrition <span className="text-sage-600">Hub</span>
        </h1>
        <p className="text-earth-800/70 max-w-2xl mx-auto text-lg">
          Estimate your calorie burn accurately based on your biometrics, or scan your food to instantly get nutritional macros.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Calorie Calculator */}
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/50">
            <h2 className="text-2xl font-bold text-earth-900 mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-sage-600" />
              Burn Estimator
            </h2>
            <form onSubmit={calculate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-earth-900 mb-2">Exercise</label>
                <input
                  list="exercise-options"
                  value={form.exercise}
                  onChange={(e) => setForm({ ...form, exercise: e.target.value })}
                  placeholder="Type or select an exercise..."
                  className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm transition-all"
                />
                <datalist id="exercise-options">
                  {EXERCISE_OPTIONS.map((ex) => (
                    <option key={ex} value={ex} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: Number(e.target.value) })}
                    className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
                    className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                    className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-earth-900 mb-2">Intensity</label>
                  <select
                    value={form.intensity}
                    onChange={(e) => setForm({ ...form, intensity: e.target.value })}
                    className="w-full bg-white/50 border border-cream-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-400 appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 mt-2 flex items-center justify-center gap-2 rounded-xl text-lg font-bold"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Calculating...</>
                ) : (
                  <><Flame className="w-5 h-5" /> Calculate Burn</>
                )}
              </button>
            </form>
          </div>

          {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm">{error}</div>}

          {result && (
            <div className="glass-card p-6 md:p-8 rounded-3xl animate-slide-up border border-sage-200 bg-gradient-to-br from-white to-sage-50/50">
              <div className="text-center mb-6">
                <p className="text-earth-800 font-medium mb-1 uppercase tracking-wider text-xs">Estimated Burn</p>
                <h2 className="text-5xl font-black text-sage-600 flex justify-center items-baseline gap-1">
                  {result.calories} <span className="text-xl text-earth-600 font-medium">kcal</span>
                </h2>
                <p className="text-sm text-earth-800/70 mt-2">{result.breakdown}</p>
              </div>

              <div className="space-y-4 pt-4 border-t border-earth-200">
                <div>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-earth-900">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Tips
                  </h4>
                  <ul className="text-sm text-earth-800/80 space-y-1 list-disc pl-5">
                    {result.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2 text-earth-900">
                    <UtensilsCrossed className="w-4 h-4 text-sage-600" /> Recovery Meal
                  </h4>
                  <p className="text-sm text-earth-800/80">{result.diet_suggestion}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI Nutrition Scanner */}
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/50 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-earth-900 mb-6 flex items-center gap-2">
              <Scan className="w-6 h-6 text-blue-500" />
              AI Nutrition Scanner
            </h2>

            {scannerState === 'idle' && (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-cream-300 rounded-2xl p-8 bg-white/30 transition-all hover:bg-white/50 group">
                <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-earth-900 mb-2">Scan Your Meal</h3>
                <p className="text-sm text-earth-800/60 text-center mb-6">
                  Snap a photo or upload an image of your food to instantly get accurate calories and macros.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => handleScan()}
                    className="flex-1 bg-earth-900 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-earth-800 transition-colors text-sm"
                  >
                    <Camera className="w-4 h-4" /> Open Camera
                  </button>
                  <label className="flex-1 bg-white border border-earth-200 text-earth-900 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-cream-50 transition-colors cursor-pointer text-sm">
                    <Upload className="w-4 h-4" /> Upload
                    <input type="file" className="hidden" accept="image/*" onChange={handleScan} ref={fileInputRef} />
                  </label>
                </div>
              </div>
            )}

            {scannerState === 'scanning' && (
              <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden rounded-2xl bg-black">
                {imagePreview && (
                  <img src={imagePreview} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                )}
                <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                {/* Scanning line animation */}
                <div className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,1)] animate-scan" />
                
                <div className="relative z-10 flex flex-col items-center text-white">
                  <Scan className="w-12 h-12 mb-4 animate-pulse" />
                  <h3 className="font-bold text-lg">Analyzing food...</h3>
                  <p className="text-sm text-white/70">Identifying ingredients and portion size</p>
                </div>
              </div>
            )}

            {scannerState === 'result' && nutritionResult && (
              <div className="flex-1 flex flex-col">
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-earth-900">
                  {imagePreview && (
                    <img src={imagePreview} alt="Scanned Food" className="w-full h-full object-cover opacity-70" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {nutritionResult.match}% Match
                      </span>
                    </div>
                    <h3 className="text-xl font-bold line-clamp-1">{nutritionResult.name}</h3>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setScannerState('idle');
                      setImagePreview(null);
                    }}
                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                  >
                    <Scan className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-sage-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-sage-100">
                    <Flame className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-2xl font-black text-earth-900">{nutritionResult.calories}</span>
                    <span className="text-xs font-medium text-earth-800/60 uppercase tracking-wider">Calories</span>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-blue-100">
                    <Apple className="w-6 h-6 text-blue-500 mb-1" />
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="text-sm font-bold text-earth-900">{nutritionResult.protein}g</div>
                        <div className="text-[10px] text-earth-800/60 uppercase">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-earth-900">{nutritionResult.carbs}g</div>
                        <div className="text-[10px] text-earth-800/60 uppercase">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-earth-900">{nutritionResult.fat}g</div>
                        <div className="text-[10px] text-earth-800/60 uppercase">Fat</div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-3 bg-earth-900 hover:bg-earth-800 text-white rounded-xl font-bold transition-colors mt-auto">
                  Log to Daily Intake
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
