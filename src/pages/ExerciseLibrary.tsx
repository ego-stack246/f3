import { useState, useMemo } from 'react';
import { Search, Activity, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import exercisesData from '../data/exercises-library.json';

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const categories = useMemo(() => Array.from(new Set(exercisesData.map(e => e.category))), []);

  const filteredExercises = useMemo(() => {
    return exercisesData.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? ex.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 pt-24 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
              <Database className="w-3.5 h-3.5" /> 1,324 Exercises Loaded
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Exercise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Library</span>
            </h1>
            <p className="text-white/60 max-w-xl text-sm">
              Browse the complete offline database of 1,300+ exercises powered by the global open-source dataset.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredExercises.slice(0, 100).map((ex) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="bg-slate-900/50 border border-white/5 hover:border-blue-500/30 hover:bg-slate-900 rounded-2xl overflow-hidden cursor-pointer group transition-all"
            >
              <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center p-4">
                <img 
                  src={ex.gifUrl} 
                  alt={ex.name} 
                  className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold px-2 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white capitalize border border-white/10">
                    {ex.category}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm line-clamp-1 mb-1 capitalize group-hover:text-blue-400 transition-colors">{ex.name}</h3>
                <p className="text-white/40 text-xs capitalize">Target: {ex.target}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredExercises.length > 100 && (
          <div className="text-center text-white/40 text-sm font-medium py-8">
            Showing first 100 results. Use search to find more.
          </div>
        )}
        
        {filteredExercises.length === 0 && (
          <div className="text-center py-20">
            <Activity className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-bold mb-1">No exercises found</h3>
            <p className="text-white/50 text-sm">Try adjusting your search or filters.</p>
          </div>
        )}

      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="bg-white p-8 flex justify-center border-b border-white/5 relative">
                  <img src={selectedExercise.gifUrl} alt={selectedExercise.name} className="h-64 object-contain mx-auto" />
                </div>
                <div className="p-6 md:p-8">
                  <div className="flex gap-2 flex-wrap mb-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-blue-500/20 text-blue-300 rounded-full capitalize">{selectedExercise.category}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-full capitalize">{selectedExercise.target}</span>
                    <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full capitalize">{selectedExercise.equipment}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-6 capitalize">{selectedExercise.name}</h2>
                  
                  <div className="space-y-4">
                    <h3 className="text-white font-bold text-sm border-b border-white/10 pb-2">Instructions</h3>
                    <ul className="space-y-3">
                      {selectedExercise.instructions.map((step: string, i: number) => (
                        <li key={i} className="flex gap-3 text-white/70 text-sm leading-relaxed">
                          <span className="font-bold text-blue-400 shrink-0">{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-950 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
