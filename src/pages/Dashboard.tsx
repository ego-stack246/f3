import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Flame, Clock, CalendarDays, Award, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const data = [
  { name: 'Mon', minutes: 45 },
  { name: 'Tue', minutes: 30 },
  { name: 'Wed', minutes: 60 },
  { name: 'Thu', minutes: 20 },
  { name: 'Fri', minutes: 45 },
  { name: 'Sat', minutes: 90 },
  { name: 'Sun', minutes: 15 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header>
        <h1 className="text-3xl font-bold">Welcome back, Alex!</h1>
        <p className="text-earth-800/70 mt-2">Here is your wellness overview for the week.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Daily Calorie Burn", value: "450 kcal", icon: Flame, color: "text-orange-500", bg: "bg-orange-100" },
          { label: "Workout Streak", value: "5 Days", icon: CalendarDays, color: "text-sage-600", bg: "bg-sage-100" },
          { label: "Active Minutes", value: "305 min", icon: Clock, color: "text-blue-500", bg: "bg-blue-100" },
          { label: "Current Rank", value: "Silver Tier", icon: Award, color: "text-yellow-600", bg: "bg-yellow-100" },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-earth-800/70">{stat.label}</p>
              <p className="text-2xl font-bold font-display mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Weekly Consistency</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <h2 className="text-xl font-bold mb-4">Quick Routines</h2>
            <div className="space-y-3">
              {[
                { title: "Morning Mobility", duration: "10 min", type: "Flexibility" },
                { title: "Desk Reset", duration: "5 min", type: "Stretch" },
                { title: "Dorm HIIT", duration: "15 min", type: "Cardio" },
              ].map((routine, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors border border-transparent hover:border-white cursor-pointer group">
                  <div>
                    <p className="font-medium">{routine.title}</p>
                    <p className="text-xs text-earth-800/70">{routine.duration} • {routine.type}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center group-hover:bg-sage-500 group-hover:text-white transition-colors">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
            <Link to="/workouts" className="block w-full text-center mt-6 text-sm font-medium text-sage-700 hover:text-sage-800">
              View all routines →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
