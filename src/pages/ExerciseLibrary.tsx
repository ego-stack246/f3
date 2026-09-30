import { useState, useMemo } from 'react';
import { Search, Activity, Database, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import exercisesData from '../data/exercises-library.json';

const ITEMS_PER_PAGE = 100;

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => Array.from(new Set(exercisesData.map(e => e.category))), []);

  const filteredExercises = useMemo(() => {
    return exercisesData.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? ex.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Reset page when search or category filter changes
  const [prevFilter, setPrevFilter] = useState({ searchTerm, selectedCategory });
  if (prevFilter.searchTerm !== searchTerm || prevFilter.selectedCategory !== selectedCategory) {
    setPrevFilter({ searchTerm, selectedCategory });
    setCurrentPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filteredExercises.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredExercises.length);

  const paginatedExercises = useMemo(() => {
    return filteredExercises.slice(startIndex, endIndex);
  }, [filteredExercises, startIndex, endIndex]);

  const handlePageChange = (newPage: number) => {
    const target = Math.max(1, Math.min(newPage, totalPages));
    setCurrentPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);
    if (safeCurrentPage > 3) {
      pages.push('ellipsis-start');
    }
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safeCurrentPage < totalPages - 2) {
      pages.push('ellipsis-end');
    }
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 pt-24 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end mb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
              <Database className="w-3.5 h-3.5" /> {exercisesData.length.toLocaleString()} Exercises Loaded
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Exercise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Library</span>
            </h1>
            <p className="text-white/60 max-w-xl text-sm">
              Browse the complete offline database of 1,300+ exercises with 100 exercises per page.
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

        {/* Top Pagination Status & Jump Bar */}
        {filteredExercises.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-slate-900/40 border border-white/5 rounded-2xl text-xs text-white/70">
            <div>
              Showing <span className="text-white font-bold">{startIndex + 1}–{endIndex}</span> of <span className="text-white font-bold">{filteredExercises.length.toLocaleString()}</span> exercises
              <span className="ml-2 text-blue-400 font-semibold">(Page {safeCurrentPage} of {totalPages})</span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-white/50">Quick Jump:</span>
                <select
                  value={safeCurrentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                  className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <option key={pg} value={pg}>
                      Page {pg} (Exercises {(pg - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pg * ITEMS_PER_PAGE, filteredExercises.length)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedExercises.map((ex) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
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
        
        {/* Bottom Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-sm">
            <div className="text-xs text-white/60 font-medium">
              Page <span className="text-white font-bold">{safeCurrentPage}</span> of <span className="text-white font-bold">{totalPages}</span> • <span className="text-blue-400 font-semibold">{ITEMS_PER_PAGE} exercises per page</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-white/5 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="First Page"
                aria-label="First Page"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-white/5 text-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold px-3"
                title="Previous Page"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page pills */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((p, idx) => {
                  if (typeof p === 'string') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-white/30 text-xs select-none">
                        …
                      </span>
                    );
                  }
                  const isActive = p === safeCurrentPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePageChange(p)}
                      className={cn(
                        "w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                          : "bg-white/5 hover:bg-white/15 text-white/70 hover:text-white"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-white/5 text-white transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1 text-xs font-semibold px-3"
                title="Next Page"
                aria-label="Next Page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-white/5 text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                title="Last Page"
                aria-label="Last Page"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Go to:</span>
              <select
                value={safeCurrentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <option key={pg} value={pg}>
                    Page {pg}
                  </option>
                ))}
              </select>
            </div>
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
