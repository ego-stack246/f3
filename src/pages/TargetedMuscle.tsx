import { useState } from 'react';
import Model from 'react-body-highlighter';
import { Play, Activity, Filter, Info } from 'lucide-react';
import exercisesData from '../data/exercises-library.json';

const equipments = ['Bodyweight', 'Dumbbell', 'Barbell', 'Cables', 'Machine'];

const popularMuscles = [
  { id: 'trapezius', label: 'Trapezius (Traps)' },
  { id: 'chest', label: 'Chest' },
  { id: 'upper-back', label: 'Upper Back / Lats' },
  { id: 'front-deltoids', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'abs', label: 'Abs / Core' },
  { id: 'gluteal', label: 'Glutes' },
  { id: 'quadriceps', label: 'Quadriceps' },
  { id: 'hamstring', label: 'Hamstrings' },
  { id: 'calves', label: 'Calves' },
];

const formatMuscleName = (muscle: string) => {
  const m = muscle.toLowerCase();
  if (m === 'trapezius' || m.includes('trap')) return 'Trapezius (Traps)';
  if (m === 'upper-back') return 'Upper Back / Lats';
  if (m === 'lower-back') return 'Lower Back';
  if (m.includes('deltoid')) return 'Shoulders (Deltoids)';
  if (m === 'gluteal') return 'Glutes';
  return muscle.replace('-', ' ');
};

export default function TargetedMuscle() {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>('trapezius');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('Dumbbell');

  // Handle muscle click
  const handleClick = (e: any) => {
    setSelectedMuscle(e.muscle);
  };

  const data: any[] = selectedMuscle
    ? [{ name: 'Selected', muscles: [selectedMuscle] }]
    : [];

  const getExercises = (muscle: string, eq: string) => {
    const mappedEq = eq.toLowerCase().replace('bodyweight', 'body weight').replace('cables', 'cable');
    
    const filtered = exercisesData.filter((ex: any) => {
      // Equipment Match
      const eqMatch = eq === 'Machine' 
        ? (ex.equipment.includes('machine') || ex.equipment.includes('leverage')) 
        : ex.equipment === mappedEq;
        
      // Muscle Match
      const m = muscle.toLowerCase();
      let mMatch = ex.target.includes(m) || ex.bodyPart.includes(m) || ex.category.includes(m);
      
      // Handle react-body-highlighter specific names vs API names
      if (m === 'trapezius' || m.includes('trap')) {
        const name = ex.name.toLowerCase();
        const target = ex.target.toLowerCase();
        mMatch = target === 'traps' || target.includes('trap') || name.includes('shrug') || name.includes('upright row') || name.includes('scapular') || name.includes('scapula');
      }
      if (m === 'quadriceps') mMatch = ex.target === 'quads' || ex.bodyPart === 'upper legs';
      if (m === 'hamstring') mMatch = ex.target === 'hamstrings' || ex.bodyPart === 'upper legs';
      if (m === 'gluteal') mMatch = ex.target === 'glutes';
      if (m === 'abs' || m === 'obliques') mMatch = ex.target === 'abs' || ex.bodyPart === 'waist';
      if (m.includes('back')) mMatch = ex.bodyPart === 'back' || ex.category === 'back';
      if (m.includes('deltoids')) mMatch = ex.bodyPart === 'shoulders' || ex.target === 'delts';
      if (m === 'calves') mMatch = ex.target === 'calves' || ex.bodyPart === 'lower legs';
      if (m === 'forearm') mMatch = ex.target.includes('forearm') || ex.bodyPart === 'lower arms';
      if (m === 'neck') mMatch = ex.bodyPart === 'neck' || ex.target === 'traps' || ex.name.toLowerCase().includes('shrug');
      
      return eqMatch && mMatch;
    });

    // Fallback if no exact equipment match found (so UI doesn't look broken)
    if (filtered.length === 0) {
      return exercisesData.filter((ex: any) => {
        const m = muscle.toLowerCase();
        let mMatch = ex.target.includes(m) || ex.bodyPart.includes(m) || ex.category.includes(m);
        if (m === 'trapezius' || m.includes('trap')) {
          const name = ex.name.toLowerCase();
          const target = ex.target.toLowerCase();
          mMatch = target === 'traps' || target.includes('trap') || name.includes('shrug') || name.includes('upright row') || name.includes('scapular') || name.includes('scapula');
        }
        if (m === 'quadriceps') mMatch = ex.target === 'quads' || ex.bodyPart === 'upper legs';
        if (m === 'hamstring') mMatch = ex.target === 'hamstrings' || ex.bodyPart === 'upper legs';
        if (m === 'gluteal') mMatch = ex.target === 'glutes';
        if (m === 'abs' || m === 'obliques') mMatch = ex.target === 'abs' || ex.bodyPart === 'waist';
        if (m.includes('back')) mMatch = ex.bodyPart === 'back';
        if (m.includes('deltoids')) mMatch = ex.bodyPart === 'shoulders';
        if (m === 'neck') mMatch = ex.bodyPart === 'neck' || ex.target === 'traps';
        return mMatch;
      }).slice(0, 6);
    }

    return filtered.slice(0, 6);
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
            <Info className="w-4 h-4 text-sage-600 shrink-0" />
            <p>Tap any highlighted muscle on the model or pick from the targets below.</p>
          </div>

          <div className="w-full mt-6 pt-5 border-t border-earth-100">
            <p className="text-xs font-bold text-earth-800/70 uppercase tracking-wider mb-3 text-center">
              Targeted Muscles
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {popularMuscles.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMuscle(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    selectedMuscle === m.id
                      ? 'bg-sage-600 text-white shadow-md shadow-sage-200 scale-105'
                      : 'bg-white text-earth-800 hover:bg-sage-50 hover:text-sage-700 border border-earth-200/70'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
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
                  {formatMuscleName(selectedMuscle)} Exercises
                </h3>
                <span className="text-sm font-bold text-sage-700 bg-sage-100 px-3 py-1 rounded-full">
                  {selectedEquipment}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getExercises(selectedMuscle, selectedEquipment).map((exercise: any) => (
                  <div key={exercise.id} className="glass-card rounded-3xl overflow-hidden group hover:shadow-xl transition-all duration-300 border border-white/50">
                    <div className="relative h-48 overflow-hidden bg-white flex items-center justify-center p-4">
                      <img
                        src={exercise.gifUrl}
                        alt={exercise.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold px-2 py-1 bg-white/20 backdrop-blur-md rounded-full text-white capitalize border border-white/30">
                            {exercise.equipment}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-1 bg-sage-500/80 backdrop-blur-md rounded-full text-white capitalize border border-white/30">
                            {exercise.target}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col h-[200px]">
                      <h4 className="font-bold text-lg text-earth-900 mb-2 group-hover:text-sage-600 transition-colors capitalize line-clamp-1">
                        {exercise.name}
                      </h4>
                      <p className="text-sm text-earth-800/70 mb-4 line-clamp-3 flex-1">
                        {exercise.instructions ? exercise.instructions.join(' ') : 'Focus on form and controlled movement.'}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-black text-earth-900 bg-cream-100 px-3 py-1.5 rounded-lg border border-earth-200/50">
                          {exercise.category}
                        </span>
                        <a 
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name + ' form tutorial')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-white p-2.5 bg-sage-500 rounded-full shadow-lg shadow-sage-500/30 transition-all hover:bg-sage-600 hover:scale-110 flex items-center gap-2"
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </a>
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
