import { Link } from 'react-router-dom';
import { ArrowRight, Star, Heart, Activity, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col gap-24 pb-20">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center gap-12 pt-12 md:pt-20">
        <div className="flex-1 space-y-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-sm font-medium">
            <Star className="w-4 h-4 fill-sage-500 text-sage-500" />
            <span>AI Fitness & Wellness Companion</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight text-earth-900">
            Nurture your body.<br />
            <span className="text-sage-600">Elevate your mind.</span>
          </h1>
          <p className="text-lg text-earth-800/80 max-w-xl leading-relaxed">
            A holistic student fitness experience. Integrate movement, mindful posture, and balanced nutrition into your daily academic life with AI-driven guidance.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/workouts" className="btn-secondary">
              Explore Routines
            </Link>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="aspect-square max-w-md mx-auto relative z-10 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50">
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop"
              alt="Yoga session"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute top-10 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in z-20">
            <div className="bg-sage-100 p-2 rounded-full"><Heart className="text-sage-600 w-5 h-5" /></div>
            <div>
              <p className="text-sm font-bold text-earth-900">Mindful Movement</p>
              <p className="text-xs text-earth-800/70">Daily streaks updated</p>
            </div>
          </div>
          <div className="absolute bottom-10 -left-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in z-20" style={{ animationDelay: '0.2s' }}>
            <div className="bg-cream-200 p-2 rounded-full"><Activity className="text-earth-900 w-5 h-5" /></div>
            <div>
              <p className="text-sm font-bold text-earth-900">AI Posture</p>
              <p className="text-xs text-earth-800/70">Real-time coaching</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Your Wellness toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Smart Routines", desc: "Curated workouts fitting your student schedule.", icon: Activity },
            { title: "Posture Check", desc: "Use your camera to get real-time form correction.", icon: CheckCircle },
            { title: "Campus Leaderboard", desc: "Stay motivated with friendly campus competition.", icon: Star },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-8 text-left hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-sage-700" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-earth-800/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="glass-card p-12 rounded-[3rem] text-center max-w-4xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sage-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <Star className="w-8 h-8 text-sage-500 mx-auto mb-6 opacity-50" />
        <p className="text-2xl md:text-3xl font-display font-medium leading-relaxed text-earth-900 mb-8 relative z-10">
          "FitSyncAI completely changed how I approach study breaks. The AI posture coach saved my back during finals week, and the aesthetic is incredibly calming."
        </p>
        <div className="flex items-center justify-center gap-4 relative z-10">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" alt="User" className="w-12 h-12 rounded-full object-cover border-2 border-white" />
          <div className="text-left">
            <p className="font-bold">Sarah Jenkins</p>
            <p className="text-sm text-earth-800/70">Computer Science Major</p>
          </div>
        </div>
      </section>
    </div>
  );
}
