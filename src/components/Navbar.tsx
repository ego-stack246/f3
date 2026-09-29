import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Dumbbell, LayoutDashboard, Play, Activity, Calculator, Trophy, Menu, X, LogIn, LogOut, User as UserIcon, Flame, ShieldCheck, Accessibility, Users } from 'lucide-react';
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
      { to: '/library', label: 'Exercise Library', icon: Activity },
      { to: '/calculator', label: 'Calorie Calc', icon: Calculator },
      { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      { to: '/community', label: 'Community', icon: Users },
    ] : [])
  ];

  return (
    <>
      <div className="w-full flex justify-center px-4 pt-6 pb-2 z-50 sticky top-0 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-6xl bg-white/80 backdrop-blur-xl border border-earth-900/10 rounded-full px-5 py-3 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="bg-earth-900 p-2 rounded-full group-hover:bg-earth-800 transition-colors">
            <Dumbbell className="text-white w-4 h-4" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-earth-900">
            FitSynch<span className="text-sage-600">AI</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1.5">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 text-[13px] font-semibold transition-all duration-200 py-2 px-3.5 rounded-full",
                  isActive 
                    ? "bg-earth-900 text-white shadow-sm" 
                    : "text-earth-600 hover:bg-earth-100/50 hover:text-earth-900"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-earth-500")} />
                  {link.label}
                </>
              )}
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
                className="flex items-center gap-2.5 p-1 pl-3 rounded-full hover:bg-earth-100/50 border border-transparent hover:border-earth-200 transition-all group"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600">
                  <Flame className="w-3.5 h-3.5 fill-orange-500" />
                  <span>{user.streak}d</span>
                </div>

                <div className="w-px h-4 bg-earth-200 mx-1 hidden sm:block" />

                <span className="text-[13px] font-semibold text-earth-900 hidden sm:inline-block max-w-[100px] truncate">
                  {user.name.split(' ')[0]}
                </span>

                <div className="relative ml-1">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-earth-200 shadow-sm"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                </div>
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
              className="flex items-center gap-2 py-2 px-5 bg-earth-900 hover:bg-earth-800 text-white rounded-full text-[13px] font-semibold shadow-sm transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
          )}

          {/* Mobile Toggle Button */}
          <button
            className="lg:hidden text-earth-600 p-2 rounded-full hover:bg-earth-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 p-2 flex flex-col gap-1 lg:hidden bg-white/95 backdrop-blur-xl border border-earth-200 rounded-3xl shadow-xl animate-fade-in z-50">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 text-sm font-semibold p-3.5 rounded-2xl transition-colors",
                    isActive 
                      ? "bg-earth-900 text-white" 
                      : "text-earth-700 hover:bg-earth-50"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-earth-400")} />
                    {link.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
