import { useState } from 'react';
import Model from 'react-body-highlighter';
import { Play, ChevronRight, Activity, Filter, Info } from 'lucide-react';

const equipments = ['Bodyweight', 'Dumbbell', 'Barbell', 'Cables', 'Machine'];

export default function TargetedMuscle() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('Bodyweight');

  // Handle muscle click
  const handleClick = (e: any) => {
    setSelectedMuscle(e.muscle);
  };

  const data: any[] = selectedMuscle
    ? [{ name: 'Selected', muscles: [selectedMuscle] }]
    : [];

  const getMuscleImage = (muscle: string, index: number) => {
    const images: Record<string, string[]> = {
      'chest': [
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80"
      ],
      'back': [
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?auto=format&fit=crop&w=400&q=80"
      ],
      'legs': [
        "https://images.unsplash.com/photo-1434596922112-19c563067271?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80"
      ],
      'arms': [
        "https://images.unsplash.com/photo-1581009137042-c552e485697a?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=80"
      ],
      'shoulders': [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=400&q=80"
      ],
      'abs': [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80"
      ]
    };

    // Find the category that matches or use a default
    const category = Object.keys(images).find(key => muscle.toLowerCase().includes(key)) || 'abs';
    // Fallback if category not found (abs used as default above, but let's be safe)
    const categoryImages = images[category] || images['abs'];
    
    return categoryImages[index % categoryImages.length];
  };

  const getAction = (m: string) => {
    const l = m.toLowerCase();
    if (['chest', 'shoulders'].some(k => l.includes(k))) return 'Press';
    if (['back', 'lats'].some(k => l.includes(k))) return 'Row';
    if (['legs', 'glutes', 'quads', 'hamstrings'].some(k => l.includes(k))) return 'Squat';
    if (['arms', 'biceps', 'triceps'].some(k => l.includes(k))) return 'Curl';
    return 'Exercise';
  };

  const getExercises = (muscle: string, eq: string) => {
    return [
      {
        id: 1,
        name: `${eq} ${muscle.charAt(0).toUpperCase() + muscle.slice(1)} Press`,
        image: getMuscleImage(muscle, 0),
        video: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${eq} ${muscle} exercise form tutorial`)}`,
        description: `Focus on form and controlled movement for the ${muscle}.`,
        sets: "3 sets x 10 reps"
      },
      {
        id: 2,
        name: `${eq} ${getAction(muscle)} for ${muscle.charAt(0).toUpperCase() + muscle.slice(1)}`,
        image: getMuscleImage(muscle, 1),
        video: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${eq} isolated ${muscle} workout form tutorial`)}`,
        description: "Keep your core tight throughout the movement to maximize gains.",
        sets: "4 sets x 12 reps"
      }
    ];
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in">
      <div className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl md:text-5xl font-display font-black text-earth-900 mb-4 tracking-tight">
          Targeted <span className="text-sage-600">Muscle</span>
        </h1>
        <p className="text-earth-800/70 max-w-2xl text-lg">
          Select a muscle group on the interactive model and choose your equipment to see tailored exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Side: Body Model */}
        <div className="lg:col-span-5 glass-card p-6 md:p-8 rounded-3xl flex flex-col items-center shadow-lg border border-white/50">
          <div className="flex justify-center gap-4 mb-8 w-full bg-cream-50 p-2 rounded-2xl">
            <span className="text-sm font-bold text-earth-800 uppercase tracking-wider">Interactive Anatomy Map</span>
          </div>
          
          <div className="flex flex-row justify-center gap-4 sm:gap-10 w-full overflow-hidden">
            <div className="w-[140px] sm:w-[180px] hover:scale-105 transition-transform duration-300">
              <Model
                type="anterior"
                data={data}
                style={{ width: '100%', cursor: 'pointer' }}
                onClick={handleClick}
                highlightedColors={['#059669', '#10b981']} // emerald-600 and emerald-500
              />
              <p className="text-center mt-4 font-bold text-earth-800 text-sm">Front</p>
            </div>
            <div className="w-[140px] sm:w-[180px] hover:scale-105 transition-transform duration-300">
              <Model
                type="posterior"
                data={data}
                style={{ width: '100%', cursor: 'pointer' }}
                onClick={handleClick}
                highlightedColors={['#059669', '#10b981']}
              />
              <p className="text-center mt-4 font-bold text-earth-800 text-sm">Back</p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs text-earth-800/60 bg-cream-50 px-4 py-2 rounded-xl">
            <Info className="w-4 h-4 text-sage-600" />
            <p>Tap any highlighted muscle group to begin.</p>
          </div>
        </div>

        {/* Right Side: Configuration & Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Equipment Selector */}
          <div className="glass-card p-6 rounded-3xl border border-white/50 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-sage-100 p-2 rounded-xl">
                <Filter className="w-5 h-5 text-sage-700" />
              </div>
              <h2 className="text-xl font-bold text-earth-900">Select Equipment</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {equipments.map(eq => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquipment(eq)}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-sm
                    ${selectedEquipment === eq 
                      ? 'bg-sage-600 text-white shadow-sage-200 shadow-lg scale-[1.02]' 
                      : 'bg-white text-earth-800 hover:bg-sage-50 border border-earth-200'}`}
                >
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          {selectedMuscle ? (
            <div className="animate-slide-up space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-earth-900 capitalize flex items-center gap-3">
                  <Activity className="w-6 h-6 text-sage-600" />
                  {selectedMuscle.replace('-', ' ')} Exercises
                </h3>
                <span className="text-sm font-bold text-sage-700 bg-sage-100 px-3 py-1 rounded-full">
                  {selectedEquipment}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getExercises(selectedMuscle, selectedEquipment).map(exercise => (
                  <div key={exercise.id} className="glass-card rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-white/50">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={exercise.image}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <a
                          href={exercise.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-sage-500 transition-colors border border-white/30"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Watch Tutorial
                        </a>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg text-earth-900 mb-2 group-hover:text-sage-600 transition-colors">
                        {exercise.name}
                      </h4>
                      <p className="text-sm text-earth-800/70 mb-4 line-clamp-2">
                        {exercise.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-black text-earth-900 bg-cream-100 px-3 py-1.5 rounded-lg border border-earth-200/50">
                          {exercise.sets}
                        </span>
                        <button className="text-sage-600 hover:text-sage-700 p-2 bg-sage-50 rounded-full transition-colors group-hover:bg-sage-100">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-white/50 border-dashed flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="bg-sage-50 p-6 rounded-full mb-6 relative">
                <div className="absolute inset-0 bg-sage-200/50 rounded-full animate-ping opacity-75"></div>
                <Activity className="w-10 h-10 text-sage-500 relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-earth-900 mb-2">No Muscle Selected</h3>
              <p className="text-earth-800/60 max-w-sm mx-auto">
                Select a highlighted muscle group on the body map to view targeted exercises and tutorials.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
