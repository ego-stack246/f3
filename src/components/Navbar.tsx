import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  LayoutDashboard,
  Play,
  Activity,
  Calculator,
  Trophy,
  Menu,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
  Flame,
  ShieldCheck,
  Accessibility,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

interface NavItemDef {
  to: string;
  label: string;
  lines?: string[];
  icon: LucideIcon;
  isCommunity?: boolean;
}

const NAV_LINKS: NavItemDef[] = [
  { to: '/', label: 'Home', icon: Dumbbell },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/targeted-muscle', label: 'Targeted Muscle', lines: ['Targeted', 'Muscle'], icon: Accessibility },
  { to: '/workouts', label: 'Workouts', icon: Play },
  { to: '/posture', label: 'AI Posture Coach', lines: ['AI Posture', 'Coach'], icon: Activity },
  { to: '/library', label: 'Exercise Library', lines: ['Exercise', 'Library'], icon: Activity },
  { to: '/calculator', label: 'Calorie Calc', lines: ['Calorie', 'Calc'], icon: Calculator },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/community', label: 'Community', icon: Users, isCommunity: true },
];

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

  return (
    <>
      <header className="header-wrapper w-full flex justify-center px-4 sm:px-6 lg:px-8 py-3.5 z-50 sticky top-0 pointer-events-none">
        <div className="header-container pointer-events-auto w-full max-w-[1440px] bg-white/85 backdrop-blur-xl border border-earth-900/10 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative">
          {/* 1. Logo Section */}
          <div className="logo-section">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-earth-900 rounded-full flex items-center justify-center shrink-0 group-hover:bg-earth-800 transition-colors">
                <Dumbbell className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-earth-900 leading-none flex items-center">
                FitSync <span className="text-sage-600">AI</span>
              </span>
            </Link>
          </div>

          {/* 2. Navigation Items */}
          <nav className="navbar-links hidden min-[1200px]:flex">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "nav-item text-xs 2xl:text-[13px] font-semibold transition-all duration-200 px-2.5 2xl:px-3 rounded-full shrink-0 select-none",
                      link.isCommunity && "community-button",
                      isActive
                        ? "bg-earth-900 text-white shadow-sm"
                        : "text-earth-600 hover:bg-earth-100/60 hover:text-earth-900"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-earth-500")} />
                      {link.lines ? (
                        <span className="nav-item-content">
                          {link.lines.map((line, idx) => (
                            <span key={idx}>{line}</span>
                          ))}
                        </span>
                      ) : (
                        <span className="leading-none">{link.label}</span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* 3. Vertical Separator / Line */}
          <div
            className="header-separator hidden min-[1200px]:block"
            aria-hidden="true"
          />

          {/* 4. Right-Side Elements (Streak, Profile / Sign In, Mobile Toggle) */}
          <div className="header-actions" ref={profileRef}>
            {isLoggedIn && user ? (
              <>
                {/* Streak Indicator */}
                <div className="streak flex items-center gap-1.5 h-9 px-3 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-bold shrink-0 leading-none">
                  <Flame className="w-3.5 h-3.5 fill-orange-500 shrink-0" />
                  <span>{user.streak}d</span>
                </div>

                {/* User Profile Section */}
                <div className="profile relative flex items-center">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 h-9 p-0.5 pr-2.5 rounded-full hover:bg-earth-100/60 border border-transparent hover:border-earth-200 transition-all shrink-0 focus:outline-none"
                    aria-label="User profile menu"
                  >
                    <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-earth-200 shadow-sm"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                    </div>

                    <span className="text-xs sm:text-[13px] font-semibold text-earth-900 hidden sm:inline-block max-w-[90px] truncate leading-none">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-4 space-y-3 z-50 animate-fade-in">
                      {/* User Details Header */}
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-cream-100/70 border border-earth-900/5">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-sage-500 shadow-md shrink-0"
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
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 h-9 px-5 bg-earth-900 hover:bg-earth-800 text-white rounded-full text-[13px] font-semibold shadow-sm transition-colors shrink-0 leading-none"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile Toggle Button */}
            <button
              className="min-[1200px]:hidden flex items-center justify-center w-9 h-9 text-earth-600 rounded-full hover:bg-earth-100 transition-colors shrink-0 focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Nav Drawer */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 p-3 flex flex-col gap-1 min-[1200px]:hidden bg-white/95 backdrop-blur-xl border border-earth-200 rounded-3xl shadow-xl animate-fade-in z-50">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 text-sm font-semibold p-3 rounded-2xl transition-colors",
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
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
