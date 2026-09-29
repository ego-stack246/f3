import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, Dumbbell, Sparkles, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleAuthModal from '../components/GoogleAuthModal';
import { parseGoogleJwt, GOOGLE_CLIENT_ID, isRealGoogleClientId } from '../lib/googleAuth';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithEmail, signupWithEmail, loginWithGoogle, isLoggedIn } = useAuth();
  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) return;

    if (
      typeof window !== 'undefined' &&
      window.google?.accounts?.id &&
      isRealGoogleClientId(GOOGLE_CLIENT_ID)
    ) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (response.credential) {
              const realGoogleUser = parseGoogleJwt(response.credential);
              if (realGoogleUser) {
                loginWithGoogle({
                  name: realGoogleUser.name,
                  email: realGoogleUser.email,
                  avatar: realGoogleUser.avatar,
                });
                navigate('/dashboard');
              }
            }
          },
        });

        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        console.warn('Google One Tap load error:', err);
      }
    }
  }, [isLoggedIn]);

  if (showWelcome) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-10 text-center space-y-6 animate-scale-in">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-earth-900">Welcome, {name || 'Fitness Enthusiast'}! 🎉</h2>
          <p className="text-earth-800/80">
            Your account has been created successfully. We're redirecting you to quickly set up your fitness profile...
          </p>
        </div>
      </div>
    );
  }

  if (isLoggedIn && !showWelcome) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-6 animate-scale-in">
          <div className="w-16 h-16 bg-sage-100 text-sage-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">You are already signed in!</h2>
          <p className="text-earth-800/70 text-sm">
            Welcome back. Access your personalized AI dashboard, routines, and posture tracking.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3"
          >
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        navigate('/dashboard');
      } else {
        if (!name) {
          setError('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await signupWithEmail(name, email, age, gender);
        setShowWelcome(true);
        setTimeout(() => {
          navigate('/onboarding');
        }, 2000);
      }
    } catch {
      setError('Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('alex@fitsync.ai');
    setPassword('password123');
    setMode('login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sage-600" /> FitSync AI Google Auth
          </div>
          <h1 className="text-3xl font-bold text-earth-900">
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h1>
          <p className="text-sm text-earth-800/70">
            {mode === 'login'
              ? 'Sign in with your Google Account to access AI routines'
              : 'Join campus fitness community and track your streak'}
          </p>
        </div>

        {/* Card Container */}
        <div className="glass-card p-8 rounded-3xl shadow-xl border border-white/60 space-y-6 relative overflow-hidden">
          {/* Mode Switch Tabs */}
          <div className="flex rounded-2xl bg-cream-200/70 p-1 border border-earth-900/5">
            <button
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-white text-earth-900 shadow-sm'
                  : 'text-earth-800/60 hover:text-earth-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white text-earth-900 shadow-sm'
                  : 'text-earth-800/60 hover:text-earth-800'
              }`}
            >
              Register
            </button>
          </div>

          {/* Official Google Button Container */}
          <div className="space-y-3">
            <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />

            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 flex items-center justify-center gap-3 text-sm font-semibold text-slate-700 transition-all group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Login with Google Account</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-earth-900/10 w-full" />
            <span className="bg-cream-100 px-3 text-[11px] font-medium uppercase tracking-wider text-earth-800/50 absolute">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-100/80 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="text-xs font-semibold text-earth-800/70 block mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-earth-800/70 block mb-1">Age</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 24"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-earth-800/70 block mb-1">Gender</label>
                    <select
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm appearance-none"
                    >
                      <option value="" disabled>Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-earth-800/70 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="alex.rivera@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-earth-800/70">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your email!')}
                    className="text-[11px] text-sage-700 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-800/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-earth-900/10 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-earth-800/40 hover:text-earth-800"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Account Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs text-sage-700 bg-sage-100 hover:bg-sage-200 px-3 py-1.5 rounded-full font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <Dumbbell className="w-3.5 h-3.5" /> Use Demo Account Credentials
            </button>
          </div>
        </div>
      </div>

      {/* Google Auth Selector Popup */}
      <GoogleAuthModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
}
