import { Trophy, Medal, ArrowUp, Star, Flame } from 'lucide-react';

const LEADERBOARD_DATA = [
  { id: 1, name: "Sarah Jenkins", points: 1250, streak: 12, rank: 1, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" },
  { id: 2, name: "Michael Chen", points: 1120, streak: 8, rank: 2, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" },
  { id: 3, name: "Alex (You)", points: 1050, streak: 5, rank: 3, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop" },
  { id: 4, name: "Priya Patel", points: 980, streak: 4, rank: 4, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" },
  { id: 5, name: "James Wilson", points: 850, streak: 2, rank: 5, avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" },
  { id: 6, name: "Emma Thompson", points: 720, streak: 1, rank: 6, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=150&auto=format&fit=crop" },
];

export default function Leaderboard() {
  const top3 = LEADERBOARD_DATA.slice(0, 3);

  return (
    <div className="space-y-12 animate-fade-in pb-10 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" /> Campus Leaderboard
        </h1>
        <p className="text-earth-800/70 mt-3">
          Rankings based on weekly consistency, active minutes, and posture precision.
        </p>
      </header>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 md:gap-6 pt-8 pb-4 h-64">
        {/* 2nd Place */}
        <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative mb-4">
            <img src={top3[1].avatar} alt={top3[1].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-slate-300 shadow-lg" />
            <div className="absolute -bottom-3 -right-3 bg-slate-300 text-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white">2</div>
          </div>
          <p className="font-bold text-sm hidden md:block">{top3[1].name}</p>
          <div className="w-24 md:w-32 bg-slate-200/80 backdrop-blur rounded-t-2xl h-32 flex flex-col items-center justify-end pb-4 border border-white/40">
            <span className="font-bold text-slate-700">{top3[1].points}</span>
            <span className="text-xs text-slate-500">pts</span>
          </div>
        </div>

        {/* 1st Place */}
        <div className="flex flex-col items-center animate-slide-up z-10">
          <div className="relative mb-4">
            <img src={top3[0].avatar} alt={top3[0].name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-yellow-400 shadow-xl" />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white text-lg"><Star className="w-5 h-5 fill-yellow-900" /></div>
          </div>
          <p className="font-bold text-sm hidden md:block">{top3[0].name}</p>
          <div className="w-28 md:w-36 bg-yellow-100/90 backdrop-blur rounded-t-2xl h-44 flex flex-col items-center justify-end pb-6 border border-white/50 shadow-[0_-10px_40px_-15px_rgba(250,204,21,0.5)]">
            <span className="font-bold text-yellow-700 text-lg">{top3[0].points}</span>
            <span className="text-xs text-yellow-600/80">pts</span>
          </div>
        </div>

        {/* 3rd Place */}
        <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative mb-4">
            <img src={top3[2].avatar} alt={top3[2].name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-amber-700/50 shadow-lg" />
            <div className="absolute -bottom-3 -right-3 bg-amber-700/40 text-amber-900 w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-sm border-2 border-white">3</div>
          </div>
          <p className="font-bold text-sm hidden md:block">{top3[2].name}</p>
          <div className="w-24 md:w-32 bg-amber-900/10 backdrop-blur rounded-t-2xl h-24 flex flex-col items-center justify-end pb-4 border border-white/30">
            <span className="font-bold text-amber-900/80">{top3[2].points}</span>
            <span className="text-xs text-amber-900/60">pts</span>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-earth-900/5">
          {LEADERBOARD_DATA.map((user) => (
            <div 
              key={user.id} 
              className={`p-4 md:px-6 md:py-4 flex items-center gap-4 hover:bg-white/50 transition-colors ${
                user.name.includes('(You)') ? 'bg-sage-50/50' : ''
              }`}
            >
              <div className="w-8 font-bold text-earth-800/50 flex justify-center">
                {user.rank <= 3 ? <Medal className={`w-5 h-5 ${user.rank === 1 ? 'text-yellow-500' : user.rank === 2 ? 'text-slate-400' : 'text-amber-600'}`} /> : `#${user.rank}`}
              </div>
              
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              
              <div className="flex-1">
                <p className={`font-semibold ${user.name.includes('(You)') ? 'text-sage-700' : ''}`}>
                  {user.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-earth-800/60">
                  <Flame className="w-3 h-3 text-orange-500" /> {user.streak} day streak
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold font-display">{user.points}</p>
                <p className="text-xs text-earth-800/60">pts</p>
              </div>
              
              <div className="hidden md:flex items-center text-green-500 text-xs font-bold gap-0.5 ml-4 w-12">
                <ArrowUp className="w-3 h-3" /> 12%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
