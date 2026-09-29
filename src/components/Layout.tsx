import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import FitBot from './FitBot';
import { motion } from 'framer-motion';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-cream-50">
      {/* Premium Texture Overlay */}
      <div className="fixed inset-0 z-50 bg-noise pointer-events-none mix-blend-overlay" />
      
      {/* Animated Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-sage-200/50 to-sage-300/30 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -40, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-cream-300/50 to-orange-100/30 blur-[130px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-200/20 blur-[100px]" 
        />
      </div>

      <div className="z-10 relative flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in relative">
          <Outlet />
        </main>
      </div>

      <FitBot />
    </div>
  );
}
