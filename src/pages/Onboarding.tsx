import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Weight, ArrowUpToLine, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goals, setGoals] = useState('');

  const handleComplete = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ weight, height, goals });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in pt-24">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-earth-900">Let's Personalize Your Plan</h1>
          <p className="text-sm text-earth-800/70">
            Tell us a bit more about yourself so our AI can tailor your routines.
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/60">
          <form onSubmit={handleComplete} className="space-y-5">
            
            {/* Weight */}
            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Current Weight (kg)</label>
              <div className="relative">
                <Weight className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
              </div>
            </div>

            {/* Height */}
            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Height (cm)</label>
              <div className="relative">
                <ArrowUpToLine className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Main Fitness Goal</label>
              <div className="relative">
                <Target className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm appearance-none"
                >
                  <option value="" disabled>Select a goal...</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Improve Endurance</option>
                  <option value="flexibility">Flexibility & Posture</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg mt-4"
            >
              Complete Setup <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
