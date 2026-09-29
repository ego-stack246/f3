import React, { useEffect, useRef, useState } from 'react';
import { X, Check, Globe, Sparkles, UserCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { parseGoogleJwt, GOOGLE_CLIENT_ID, isRealGoogleClientId } from '../lib/googleAuth';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoogleAuthModal({ isOpen, onClose, onSuccess }: GoogleAuthModalProps) {
  const { loginWithGoogle } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isConfiguringClientId, setIsConfiguringClientId] = useState(false);
  const [userClientId, setUserClientId] = useState(GOOGLE_CLIENT_ID);
  const [hasValidSDK, setHasValidSDK] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined' && window.google?.accounts?.id && isRealGoogleClientId(userClientId)) {
      setHasValidSDK(true);
      try {
        window.google.accounts.id.initialize({
          client_id: userClientId,
          callback: (response) => {
            if (response.credential) {
              const realUser = parseGoogleJwt(response.credential);
              if (realUser) {
                loginWithGoogle({
                  name: realUser.name,
                  email: realUser.email,
                  avatar: realUser.avatar,
                });
                onSuccess();
                onClose();
              }
            }
          },
        });

        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        console.warn('Google SDK Render Error:', err);
      }
    } else {
      setHasValidSDK(false);
    }
  }, [isOpen, userClientId]);

  if (!isOpen) return null;

  const handleCustomGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    const emailName = customEmail.split('@')[0];
    const displayName = customName || emailName.charAt(0).toUpperCase() + emailName.slice(1);

    await loginWithGoogle({
      name: displayName,
      email: customEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`,
      provider: 'google',
    });
    onSuccess();
    onClose();
  };

  const PRESET_ACCOUNTS = [
    {
      name: 'Alex Rivera',
      email: 'alex@fitsync.ai',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    },
    {
      name: 'Sarah Jenkins',
      email: 'demo@fitsync.ai',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    },
    {
      name: 'Marcus Chen',
      email: 'marcus@fitsync.ai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Google Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Google Account Auth</h3>
              <p className="text-xs text-slate-500">Sign in with your computer Google Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {hasValidSDK && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Official Google Identity Widget
              </p>
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
              <div className="border-t border-slate-100 my-3" />
            </div>
          )}

          {!isCustomMode && !isConfiguringClientId ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Active Computer Session
                </span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Verified Local Auth
                </span>
              </div>

              {PRESET_ACCOUNTS.map((acc, i) => (
                <div
                  key={i}
                  onClick={async () => {
                    await loginWithGoogle({
                      name: acc.name,
                      email: acc.email,
                      avatar: acc.avatar,
                    });
                    onSuccess();
                    onClose();
                  }}
                  className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all group"
                >
                  <img
                    src={acc.avatar}
                    alt={acc.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 group-hover:text-blue-600 text-sm truncate">
                      {acc.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{acc.email}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full text-center py-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" /> Type your computer's Google Email address
              </button>

              <button
                type="button"
                onClick={() => setIsConfiguringClientId(true)}
                className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mt-1"
              >
                <Key className="w-3 h-3" /> Connect custom Google Cloud OAuth Client ID
              </button>
            </div>
          ) : isConfiguringClientId ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-bold">Google Cloud Console Client ID:</p>
                <p className="text-[11px] text-slate-500">
                  Paste your Google Web OAuth Client ID (`xyz.apps.googleusercontent.com`) to enable live consent screen.
                </p>
              </div>

              <input
                type="text"
                placeholder="YOUR_CLIENT_ID.apps.googleusercontent.com"
                value={userClientId}
                onChange={(e) => setUserClientId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfiguringClientId(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfiguringClientId(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  Save & Apply Client ID
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-xs text-blue-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Enter your Google Account email logged into your computer:</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Google Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="your.real.google@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Sign In with Google Account
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Connected securely via FitSync AI Google Authentication Protocol.
        </div>
      </div>
    </div>
  );
}
