import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Shield, Heart, Camera, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/30">
      
      {/* Background pattern - subtle noise/grid can go here, keeping it pure black for now */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-medium mb-12 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>By Team Motion IQ</span>
        </motion.div>
        
        <motion.h1 
          className="text-6xl md:text-8xl font-display font-medium tracking-tighter mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          FitSync AI
        </motion.h1>
        
        <motion.div
          className="text-4xl md:text-5xl font-display font-light text-zinc-400 tracking-tight mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Adaptive Fitness Coaching
        </motion.div>
        
        <motion.p 
          className="text-lg md:text-xl text-zinc-500 max-w-2xl mb-12 font-light leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          Our free, privacy-first platform for adaptive fitness coaching. Experience the future of wellness with real-time AI posture coaching and intelligent routines—all locally processed.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link to="/dashboard" className="px-8 py-3.5 rounded-full bg-white text-black font-medium text-sm flex items-center gap-2 hover:scale-105 hover:bg-zinc-200 transition-all duration-300">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/animations" className="px-8 py-3.5 rounded-full bg-transparent text-white font-medium text-sm flex items-center gap-2 hover:bg-white/5 border border-white/20 transition-all duration-300">
            View Live Demo
          </Link>
        </motion.div>
      </section>

      {/* Hero Showcase */}
      <motion.section 
        className="relative max-w-5xl mx-auto px-6 pb-40 z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 aspect-video group shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2000&auto=format&fit=crop"
            alt="Platform Preview"
            className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-700 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          
          <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <Camera className="w-5 h-5 text-black" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">On-Device AI</p>
              <p className="text-zinc-400 text-xs">Zero server processing</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Minimalist */}
      <section className="py-32 px-6 relative border-t border-white/5 bg-gradient-to-b from-zinc-950 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 md:flex justify-between items-end">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-display font-medium tracking-tight mb-6">Designed for precision.<br/>Built for privacy.</h2>
              <p className="text-zinc-500 text-lg font-light leading-relaxed">No data leaves your device. Our vision algorithms run entirely in your browser using cutting-edge WebAssembly and WebGL acceleration.</p>
            </div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { 
                icon: Activity, 
                title: "Real-time Tracking", 
                desc: "33-point skeletal mapping providing instant feedback on your form and posture.",
              },
              { 
                icon: Shield, 
                title: "100% Private", 
                desc: "Your camera feed never touches a server. All AI processing happens completely offline.",
              },
              { 
                icon: Heart, 
                title: "Adaptive Routines", 
                desc: "Workouts that intelligently adapt to your performance, fatigue, and historic data.",
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
              >
                <feature.icon className="w-6 h-6 text-zinc-300 mb-6" />
                <h3 className="text-xl font-medium mb-3 tracking-tight">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Minimal */}
      <section className="py-32 px-6 text-center border-t border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-display font-medium tracking-tight mb-8">Ready to move?</h2>
          <Link to="/dashboard" className="px-8 py-4 rounded-full bg-white text-black font-medium inline-flex items-center gap-2 hover:scale-105 transition-all duration-300">
            Start Free Trial <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
