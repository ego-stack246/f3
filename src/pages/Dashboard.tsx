import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { CalendarDays, Award, Play, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';

const weeklyData = [
  { name: 'Mon', minutes: 45 },
  { name: 'Tue', minutes: 30 },
  { name: 'Wed', minutes: 60 },
  { name: 'Thu', minutes: 20 },
  { name: 'Fri', minutes: 45 },
  { name: 'Sat', minutes: 90 },
  { name: 'Sun', minutes: 15 },
];

interface UserStats {
  allTimeScore: number;
  allTimeRank?: number | null;
  currentStreak: number;
  averageAccuracy: number;
  tier: string;
  totalWorkouts: number;
  totalRepetitions: number;
  percentile?: number | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const data = await apiFetch('/leaderboard/me');
        if (isMounted && data) {
          setStats(data);
        }
      } catch (err) {
        // Silently use defaults or cached values for offline
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const userName = user?.name || 'Athlete';
  const scoreDisplay = stats?.allTimeScore ? `${stats.allTimeScore.toLocaleString()} XP` : '0 XP';
  const rankDisplay = stats?.allTimeRank ? `#${stats.allTimeRank}` : 'Unranked';
  const streakDisplay = stats ? `${stats.currentStreak} Days` : `${user?.streak || 0} Days`;
  const accuracyDisplay = stats?.averageAccuracy ? `${stats.averageAccuracy.toFixed(1)}%` : '92.5%';
  const tierDisplay = stats?.tier ? `${stats.tier} Tier` : (user?.tier || 'Bronze Tier');

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-earth-900 tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-earth-700/80 mt-1">Here is your verified fitness & posture overview.</p>
        </div>
        <Link
          to="/leaderboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs font-bold hover:bg-amber-500/20 transition self-start sm:self-auto"
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Leaderboard Rank: {rankDisplay}</span>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Verified Performance", value: scoreDisplay, icon: Sparkles, color: "text-amber-500", bg: "bg-amber-100/60" },
          { label: "Workout Streak", value: streakDisplay, icon: CalendarDays, color: "text-sage-600", bg: "bg-sage-100" },
          { label: "AI Posture Accuracy", value: accuracyDisplay, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-100/70" },
          { label: "Current Tier", value: tierDisplay, icon: Award, color: "text-purple-600", bg: "bg-purple-100/70" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-earth-800/70">{stat.label}</p>
              <p className="text-2xl font-bold font-display mt-1 text-earth-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-earth-900">Weekly Activity</h2>
            <span className="text-xs font-semibold text-earth-500 uppercase tracking-wider">Minutes Logged</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ebe5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4a4238' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4a4238' }} />
                <Tooltip 
                  cursor={{ fill: '#f4f6f4' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="minutes" fill="#8a9a86" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4 text-earth-900">AI Workout Coach</h2>
            <div className="space-y-3">
              {[
                { title: "Squat Precision Form", duration: "5 min", type: "Legs & Core" },
                { title: "Push-Up Range of Motion", duration: "8 min", type: "Chest & Triceps" },
                { title: "Plank Stability Test", duration: "3 min", type: "Core & Posture" },
              ].map((routine, i) => (
                <Link
                  to="/workouts"
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/60 transition-colors border border-transparent hover:border-white/80 cursor-pointer group"
                >
                  <div>
                    <p className="font-semibold text-sm text-earth-900">{routine.title}</p>
                    <p className="text-xs text-earth-700/70">{routine.duration} • {routine.type}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center group-hover:bg-sage-600 group-hover:text-white transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/workouts" className="block w-full text-center mt-6 text-sm font-bold text-sage-700 hover:text-sage-800">
              Browse All Posture Routines →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
