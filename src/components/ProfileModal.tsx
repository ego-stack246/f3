import React, { useState } from 'react';
import { X, User as UserIcon, Mail, Flame, Trophy, ShieldCheck, Check, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
];

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [targetCals, setTargetCals] = useState(user?.targetCalories || 2400);
  const [saved, setSaved] = useState(false);

  if (!isOpen || !user) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, targetCalories: Number(targetCals) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-cream-100 rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
        {/* Header Banner */}
        <div className="h-28 bg-gradient-to-r from-sage-600 to-emerald-700 p-6 flex justify-between items-start">
          <div className="flex items-center gap-2 text-white/90 text-xs font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            {user.provider === 'google' ? 'Verified Google Account' : 'FitSynchAI Member'}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Avatar Overlay */}
        <div className="px-6 -mt-12 mb-4 flex items-end justify-between">
          <div className="relative group">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-cream-100 shadow-xl"
            />
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-cream-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-earth-800/60 block font-medium">Rank Tier</span>
              <span className="text-sm font-bold text-sage-700 bg-sage-100 px-3 py-1 rounded-full inline-block">
                🏆 {user.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3 bg-white/60 p-4 rounded-2xl border border-earth-900/5">
            <div className="text-center">
              <p className="text-xs text-earth-800/60 font-medium flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" /> Streak
              </p>
              <p className="text-lg font-bold font-display mt-0.5">{user.streak} Days</p>
            </div>
            <div className="text-center border-x border-earth-900/10">
              <p className="text-xs text-earth-800/60 font-medium flex items-center justify-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Points
              </p>
              <p className="text-lg font-bold font-display mt-0.5">{user.points} pts</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-earth-800/60 font-medium">Posture Score</p>
              <p className="text-lg font-bold text-sage-700 font-display mt-0.5">{user.postureScore}%</p>
            </div>
          </div>

          {/* Change Avatar Preset */}
          <div>
            <label className="text-xs font-bold text-earth-800 uppercase tracking-wider block mb-2">
              Choose Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_PRESETS.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Avatar preset ${i}`}
                  onClick={() => updateProfile({ avatar: url })}
                  className={`w-10 h-10 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-110 ${
                    user.avatar === url ? 'border-sage-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-cream-200/50 text-earth-800/60 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Daily Target Calories (kcal)</label>
              <input
                type="number"
                value={targetCals}
                onChange={(e) => setTargetCals(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1 py-2.5 text-sm font-bold shadow-md">
                {saved ? '✓ Saved Successfully!' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
