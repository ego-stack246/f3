import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Play, Activity, Calculator, Trophy, Menu, X, LogIn, LogOut, User as UserIcon, Flame, ChevronDown, ShieldCheck, Accessibility } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { to: '/', label: 'Home', icon: Dumbbell },
    ...(isLoggedIn ? [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/targeted-muscle', label: 'Targeted Muscle', icon: Accessibility },
      { to: '/workouts', label: 'Workouts', icon: Play },
      { to: '/posture', label: 'AI Posture Coach', icon: Activity },
      { to: '/calculator', label: 'Calorie Calc', icon: Calculator },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    ] : [])
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card mx-4 mt-4 px-6 py-3.5 flex items-center justify-between shadow-sm">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-sage-100 p-2 rounded-xl group-hover:bg-sage-200 transition-colors">
            <Dumbbell className="text-sage-700 w-6 h-6" />
          </div>
          <span className="font-display font-semibold text-xl tracking-wide text-earth-900">
            FitSynch<span className="text-sage-600 font-bold">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-sage-600 py-1",
                  isActive ? "text-sage-700 font-semibold" : "text-earth-800/70"
                )
              }
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right Corner: User Profile or Sign In */}
        <div className="flex items-center gap-3" ref={profileRef}>
          {isLoggedIn && user ? (
            <div className="relative">
              {/* Profile Badge in Top Right Corner */}
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full bg-white/70 hover:bg-white border border-earth-900/10 hover:border-sage-400 transition-all shadow-sm group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{user.streak}d</span>
                </div>

                <span className="text-xs font-bold text-earth-900 hidden sm:inline-block max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>

                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-sage-500 group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-earth-800/60 group-hover:text-earth-800 transition-transform" />
              </button>

              {/* User Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-4 space-y-3 z-50 animate-fade-in">
                  {/* User Details Header */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-100/70 border border-earth-900/5">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-sage-500 shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-earth-900 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-earth-800/60 truncate">{user.email}</p>
                      <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-sage-700 bg-sage-100 px-2 py-0.5 rounded-full mt-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {user.provider === 'google' ? 'Google Account' : 'Standard Account'}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sage-100/60 text-xs font-semibold text-earth-800 transition-colors text-left"
                    >
                      <UserIcon className="w-4 h-4 text-sage-600" /> View & Edit Profile
                    </button>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sage-100/60 text-xs font-semibold text-earth-800 transition-colors text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-sage-600" /> My AI Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="btn-primary flex items-center gap-2 py-2 px-4 text-xs font-bold shadow-sm"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}

          {/* Mobile Toggle Button */}
          <button
            className="lg:hidden text-earth-800 p-2 rounded-xl hover:bg-white/50"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-card p-4 flex flex-col gap-2 lg:hidden shadow-xl animate-slide-up z-50">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 text-sm font-medium p-3 rounded-xl transition-colors",
                    isActive ? "bg-sage-100 text-sage-800 font-bold" : "text-earth-800 hover:bg-cream-100"
                  )
                }
              >
                <link.icon className="w-5 h-5 text-sage-600" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
