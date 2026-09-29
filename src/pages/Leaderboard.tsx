import { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Star,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api/client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  username?: string | null;
  avatar?: string | null;
  score: number;
  workouts: number;
  accuracy: number;
  streak: number;
  repetitions: number;
  tier: string;
}

export interface LeaderboardCurrentUser {
  rank?: number | null;
  userId: string;
  name: string;
  avatar?: string | null;
  score: number;
  workouts: number;
  accuracy: number;
  streak: number;
  repetitions: number;
  tier: string;
  percentile?: number | null;
}

export interface LeaderboardResponse {
  period: string;
  period_key: string;
  entries: LeaderboardEntry[];
  currentUser?: LeaderboardCurrentUser | null;
  totalParticipants: number;
}

type Period = 'daily' | 'weekly' | 'monthly' | 'all_time';

export default function Leaderboard() {
  const [period, setPeriod] = useState<Period>('weekly');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [optInLoading, setOptInLoading] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(true);

  const fetchLeaderboard = useCallback(async (selectedPeriod: Period, showRefreshSpinner = false) => {
    if (showRefreshSpinner) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res: LeaderboardResponse = await apiFetch(`/leaderboard?period=${selectedPeriod}&limit=50`);
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch leaderboard:', err);
      setError(err?.message || 'Unable to connect to the leaderboard service.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard(period);
  }, [period, fetchLeaderboard]);

  const handleToggleOptIn = async () => {
    setOptInLoading(true);
    try {
      const nextState = !isOptedIn;
      await apiFetch('/leaderboard/opt-in', {
        method: 'POST',
        body: JSON.stringify({ opt_in: nextState }),
      });
      setIsOptedIn(nextState);
      // Refresh data
      await fetchLeaderboard(period, true);
    } catch (err: any) {
      alert(err.message || 'Failed to update leaderboard visibility');
    } finally {
      setOptInLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'diamond':
        return 'bg-cyan-500/10 text-cyan-600 border-cyan-400/30';
      case 'platinum':
        return 'bg-purple-500/10 text-purple-600 border-purple-400/30';
      case 'gold':
        return 'bg-amber-500/10 text-amber-600 border-amber-400/30';
      case 'silver':
        return 'bg-slate-400/10 text-slate-600 border-slate-300';
      default:
        return 'bg-amber-800/10 text-amber-800 border-amber-700/20';
    }
  };

  const entries = data?.entries || [];
  const top1 = entries[0];
  const top2 = entries[1];
  const top3 = entries[2];

  return (
    <div className="space-y-10 animate-fade-in pb-24 max-w-5xl mx-auto px-4">
      {/* Header */}
      <header className="text-center pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          Verified AI Posture Leaderboard
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-earth-900 tracking-tight flex items-center justify-center gap-3">
          <Trophy className="w-9 h-9 text-amber-500 drop-shadow-sm" /> Campus Standings
        </h1>
        <p className="text-earth-700/80 mt-2 max-w-xl mx-auto text-sm md:text-base">
          Rankings dynamically computed from completed workouts, computer-vision posture accuracy, difficulty scaling, and active streaks.
        </p>

        {/* Period Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <div className="bg-earth-900/5 p-1 rounded-2xl flex items-center gap-1 border border-earth-900/10">
            {(
              [
                { id: 'daily', label: 'Daily' },
                { id: 'weekly', label: 'Weekly' },
                { id: 'monthly', label: 'Monthly' },
                { id: 'all_time', label: 'All-Time' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriod(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  period === tab.id
                    ? 'bg-white text-earth-900 shadow-sm border border-earth-900/10'
                    : 'text-earth-700/70 hover:text-earth-900 hover:bg-white/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchLeaderboard(period, true)}
            disabled={isRefreshing || loading}
            title="Refresh Leaderboard"
            className="p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-earth-900/10 text-earth-700 hover:text-earth-900 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sage-600' : ''}`} />
          </button>
        </div>
      </header>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-6">
          <div className="h-64 rounded-3xl bg-earth-900/5 animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2 text-earth-800/50">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Fetching live standings...</span>
            </div>
          </div>
          <div className="glass-card p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-earth-900/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="p-8 text-center glass-card border border-red-200/50 space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-earth-900">Could not load leaderboard</h3>
          <p className="text-sm text-earth-700/80 max-w-md mx-auto">{error}</p>
          <button
            onClick={() => fetchLeaderboard(period)}
            className="px-5 py-2.5 rounded-xl bg-sage-600 text-white font-semibold text-sm hover:bg-sage-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && entries.length === 0 && (
        <div className="p-12 text-center glass-card border border-earth-900/10 space-y-4">
          <Trophy className="w-12 h-12 text-amber-500/40 mx-auto" />
          <h3 className="text-xl font-bold text-earth-900">No workouts recorded yet</h3>
          <p className="text-sm text-earth-700/70 max-w-md mx-auto">
            Be the first athlete to complete an AI-verified workout and claim Rank #1 for this timeframe!
          </p>
          <Link
            to="/workouts"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-sage-600 text-white font-bold shadow-md hover:shadow-lg transition"
          >
            <Dumbbell className="w-4 h-4" /> Start Workout Now
          </Link>
        </div>
      )}

      {/* Main Content: Podium & List */}
      {!loading && !error && entries.length > 0 && (
        <>
          {/* Podium (Top 3) */}
          <div className="flex items-end justify-center gap-2 sm:gap-6 pt-6 pb-2">
            {/* 2nd Place */}
            {top2 ? (
              <div className="flex flex-col items-center animate-slide-up flex-1 max-w-[150px]">
                <div className="relative mb-3">
                  <img
                    src={top2.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${top2.name}`}
                    alt={top2.name}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover border-4 border-slate-300 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-slate-300 text-slate-700 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-sm border-2 border-white">
                    2
                  </div>
                </div>
                <p className="font-bold text-xs sm:text-sm text-earth-900 truncate max-w-full text-center">
                  {top2.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-earth-600 mb-2 font-medium">
                  <Flame className="w-3 h-3 text-orange-500" /> {top2.streak}d
                  <span className="text-earth-300">•</span>
                  <span>{top2.accuracy.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-200/80 backdrop-blur rounded-t-2xl h-28 sm:h-36 flex flex-col items-center justify-end pb-3 border border-white/60 shadow-sm">
                  <span className="font-extrabold text-slate-700 text-base sm:text-lg">
                    {top2.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">XP</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[150px]" />
            )}

            {/* 1st Place (Center / Taller) */}
            {top1 && (
              <div className="flex flex-col items-center animate-slide-up z-10 flex-1 max-w-[170px]">
                <div className="relative mb-3">
                  <img
                    src={top1.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${top1.name}`}
                    alt={top1.name}
                    className="w-18 h-18 sm:w-22 sm:h-22 rounded-full object-cover border-4 border-amber-400 shadow-xl"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 w-8 h-8 rounded-full flex items-center justify-center font-black shadow-md border-2 border-white">
                    <Star className="w-4 h-4 fill-amber-950" />
                  </div>
                </div>
                <p className="font-extrabold text-sm sm:text-base text-earth-900 truncate max-w-full text-center">
                  {top1.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-amber-700 mb-2 font-bold">
                  <Flame className="w-3.5 h-3.5 text-orange-500" /> {top1.streak}d streak
                  <span className="text-amber-300">•</span>
                  <span>{top1.accuracy.toFixed(0)}% form</span>
                </div>
                <div className="w-full bg-gradient-to-t from-amber-200/90 to-amber-100/90 backdrop-blur rounded-t-2xl h-36 sm:h-48 flex flex-col items-center justify-end pb-4 border border-white/80 shadow-[0_-10px_30px_-10px_rgba(245,158,11,0.35)]">
                  <span className="font-black text-amber-900 text-lg sm:text-2xl">
                    {top1.score.toLocaleString()}
                  </span>
                  <span className="text-xs uppercase font-extrabold text-amber-700/80 tracking-wider">XP</span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {top3 ? (
              <div className="flex flex-col items-center animate-slide-up flex-1 max-w-[150px]">
                <div className="relative mb-3">
                  <img
                    src={top3.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${top3.name}`}
                    alt={top3.name}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-full object-cover border-4 border-amber-700/40 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-amber-800 text-amber-100 w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shadow-sm border-2 border-white">
                    3
                  </div>
                </div>
                <p className="font-bold text-xs sm:text-sm text-earth-900 truncate max-w-full text-center">
                  {top3.name}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-earth-600 mb-2 font-medium">
                  <Flame className="w-3 h-3 text-orange-500" /> {top3.streak}d
                  <span className="text-earth-300">•</span>
                  <span>{top3.accuracy.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-amber-900/10 backdrop-blur rounded-t-2xl h-24 sm:h-30 flex flex-col items-center justify-end pb-3 border border-white/40 shadow-sm">
                  <span className="font-extrabold text-amber-900 text-base sm:text-lg">
                    {top3.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-amber-900/60 tracking-wider">XP</span>
                </div>
              </div>
            ) : (
              <div className="flex-1 max-w-[150px]" />
            )}
          </div>

          {/* Full Ranked List Table */}
          <div className="glass-card overflow-hidden border border-earth-900/10 shadow-lg">
            <div className="p-4 bg-earth-900/[0.03] border-b border-earth-900/5 flex items-center justify-between text-xs font-bold text-earth-700 uppercase tracking-wider">
              <div className="flex items-center gap-4">
                <span className="w-8 text-center">Rank</span>
                <span>Athlete</span>
              </div>
              <div className="flex items-center gap-6 sm:gap-12">
                <span className="hidden sm:inline">Accuracy</span>
                <span className="hidden sm:inline">Streak</span>
                <span className="text-right w-20">Total Score</span>
              </div>
            </div>

            <div className="divide-y divide-earth-900/5">
              {entries.map((entry) => {
                const isCurrentUser = data?.currentUser?.userId === entry.userId;
                return (
                  <div
                    key={entry.userId}
                    className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
                      isCurrentUser
                        ? 'bg-sage-50/80 border-l-4 border-l-sage-600 ring-1 ring-sage-400/20'
                        : 'hover:bg-white/60'
                    }`}
                  >
                    {/* Rank & User Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-8 font-black text-sm text-earth-800/70 flex justify-center shrink-0">
                        {entry.rank === 1 ? (
                          <Medal className="w-5 h-5 text-amber-500" />
                        ) : entry.rank === 2 ? (
                          <Medal className="w-5 h-5 text-slate-400" />
                        ) : entry.rank === 3 ? (
                          <Medal className="w-5 h-5 text-amber-700" />
                        ) : (
                          `#${entry.rank}`
                        )}
                      </div>

                      <img
                        src={entry.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${entry.name}`}
                        alt={entry.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/60 shrink-0"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-bold text-sm truncate ${isCurrentUser ? 'text-sage-800' : 'text-earth-900'}`}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-[11px] font-semibold text-sage-700 bg-sage-100/80 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(entry.tier)}`}>
                            {entry.tier}
                          </span>
                        </div>
                        <p className="text-xs text-earth-600/70 truncate">
                          {entry.username ? `@${entry.username}` : `${entry.workouts} workouts`} • {entry.repetitions} reps
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                      {/* Accuracy */}
                      <div className="hidden sm:flex flex-col items-center">
                        <span className="text-xs font-bold text-earth-800">
                          {entry.accuracy.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-earth-500 font-medium">accuracy</span>
                      </div>

                      {/* Streak */}
                      <div className="hidden sm:flex items-center gap-1 text-xs font-bold text-earth-800">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{entry.streak}d</span>
                      </div>

                      {/* Score */}
                      <div className="text-right w-20">
                        <p className="font-extrabold font-mono text-base text-earth-900">
                          {entry.score.toLocaleString()}
                        </p>
                        <p className="text-[10px] uppercase font-bold text-earth-500">XP</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Floating Sticky Bottom Card for Current User */}
      {data?.currentUser && (
        <div className="fixed bottom-4 left-4 right-4 max-w-5xl mx-auto z-30">
          <div className="bg-earth-900/90 backdrop-blur-md text-white rounded-3xl p-4 sm:px-6 shadow-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-sm shadow-md">
                {data.currentUser.rank ? `#${data.currentUser.rank}` : '—'}
              </div>
              <div>
                <p className="text-xs text-earth-300 font-medium">Your Ranking ({period.replace('_', ' ')})</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-white">
                    {data.currentUser.score.toLocaleString()} XP
                  </p>
                  <span className="text-xs text-emerald-400 font-medium">
                    {data.currentUser.accuracy.toFixed(1)}% form
                  </span>
                  <span className="text-xs text-orange-400 font-medium flex items-center gap-0.5">
                    <Flame className="w-3 h-3" /> {data.currentUser.streak}d
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {data.currentUser.percentile && (
                <div className="hidden md:block text-right">
                  <p className="text-[11px] text-earth-300">Percentile</p>
                  <p className="text-xs font-bold text-emerald-300">
                    Top {data.currentUser.percentile}% of athletes
                  </p>
                </div>
              )}

              <button
                onClick={handleToggleOptIn}
                disabled={optInLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition"
                title="Toggle whether your name appears on public standings"
              >
                {isOptedIn ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                <span>{isOptedIn ? 'Public' : 'Private'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Transparency Card */}
      <div className="glass-card p-6 border border-earth-900/10 space-y-4 text-xs text-earth-700/80 leading-relaxed">
        <h4 className="font-bold text-sm text-earth-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sage-600" /> Transparent Fitness Scoring Formula
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="p-3 bg-white/50 rounded-2xl border border-white">
            <p className="font-bold text-earth-900">Workout Base</p>
            <p className="mt-1">100 XP awarded per verified session lasting at least 15 seconds.</p>
          </div>
          <div className="p-3 bg-white/50 rounded-2xl border border-white">
            <p className="font-bold text-earth-900">Valid Reps × Difficulty</p>
            <p className="mt-1">3 XP per full range-of-motion rep, scaled 1.0x to 1.5x by exercise tier.</p>
          </div>
          <div className="p-3 bg-white/50 rounded-2xl border border-white">
            <p className="font-bold text-earth-900">AI Posture Accuracy</p>
            <p className="mt-1">Up to +100 XP bonus awarded for biomechanically precise form.</p>
          </div>
          <div className="p-3 bg-white/50 rounded-2xl border border-white">
            <p className="font-bold text-earth-900">Streak Compounding</p>
            <p className="mt-1">+20 XP per consecutive day workout streak (capped at 10 days = +200 XP).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
