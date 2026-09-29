import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'google' | 'email' | 'demo';
  streak: number;
  points: number;
  tier: string;
  joinedDate: string;
  targetCalories: number;
  postureScore: number;
  age?: string;
  gender?: string;
  height?: string;
  weight?: string;
  goals?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string, age?: string, gender?: string) => Promise<boolean>;
  loginWithGoogle: (customUser?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}



import { apiFetch } from '../api/client';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fitsynch_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('fitsynch_user', JSON.stringify(user));
      // Auto-ensure token is acquired if missing
      if (!localStorage.getItem('fitsync_token')) {
        apiFetch('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ email: user.email, name: user.name, avatar: user.avatar }),
        })
          .then((res) => {
            if (res?.access_token) {
              localStorage.setItem('fitsync_token', res.access_token);
            }
          })
          .catch(() => {});
      }
    } else {
      localStorage.removeItem('fitsynch_user');
      localStorage.removeItem('fitsync_token');
    }
  }, [user]);

  const loginWithEmail = async (email: string, password = 'password123'): Promise<boolean> => {
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.access_token) {
        localStorage.setItem('fitsync_token', res.access_token);
        const bUser = res.user;
        const newUser: User = {
          id: bUser.id,
          name: bUser.name || email.split('@')[0],
          email: bUser.email,
          avatar: bUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
          provider: 'email',
          streak: bUser.current_streak || 1,
          points: 250,
          tier: 'Bronze Tier',
          joinedDate: 'Today',
          targetCalories: 2200,
          postureScore: 85,
        };
        setUser(newUser);
        return true;
      }
    } catch (err) {
      console.warn('Backend login fallback:', err);
    }

    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    const fallbackUser: User = {
      id: `usr_email_${Date.now()}`,
      name: formattedName || 'Fitness Enthusiast',
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider: 'email',
      streak: 1,
      points: 250,
      tier: 'Bronze Tier',
      joinedDate: 'Today',
      targetCalories: 2200,
      postureScore: 85,
    };
    setUser(fallbackUser);
    return true;
  };

  const signupWithEmail = async (name: string, email: string, age?: string, gender?: string): Promise<boolean> => {
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password: 'password123',
          age: age ? parseInt(age, 10) : undefined,
        }),
      });
      if (res?.access_token) {
        localStorage.setItem('fitsync_token', res.access_token);
        const bUser = res.user;
        const newUser: User = {
          id: bUser.id,
          name: bUser.name || name,
          email: bUser.email || email,
          avatar: bUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
          provider: 'email',
          streak: 1,
          points: 100,
          tier: 'Bronze Tier',
          joinedDate: 'Today',
          targetCalories: 2000,
          postureScore: 88,
          age,
          gender,
        };
        setUser(newUser);
        return true;
      }
    } catch (err) {
      console.warn('Backend registration fallback:', err);
    }

    const fallbackUser: User = {
      id: `usr_email_${Date.now()}`,
      name: name || 'Fitness Member',
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'email',
      streak: 1,
      points: 100,
      tier: 'Bronze Tier',
      joinedDate: 'Today',
      targetCalories: 2000,
      postureScore: 88,
      age,
      gender,
    };
    setUser(fallbackUser);
    return true;
  };

  const loginWithGoogle = async (customUser?: Partial<User>) => {
    const email = customUser?.email || 'alex@fitsync.ai';
    const name = customUser?.name || 'Alex Rivera';
    const avatar =
      customUser?.avatar ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';

    try {
      const res = await apiFetch('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ email, name, avatar }),
      });
      if (res?.access_token) {
        localStorage.setItem('fitsync_token', res.access_token);
        const bUser = res.user;
        const googleUser: User = {
          id: bUser.id,
          name: bUser.name || name,
          email: bUser.email || email,
          avatar: bUser.avatar || avatar,
          provider: 'google',
          streak: bUser.current_streak || 5,
          points: 1050,
          tier: 'Silver Tier',
          joinedDate: 'September 2026',
          targetCalories: 2400,
          postureScore: 94,
        };
        setUser(googleUser);
        return;
      }
    } catch (err) {
      console.warn('Backend Google auth note:', err);
    }

    const fallbackUser: User = {
      id: `usr_google_${Date.now()}`,
      name,
      email,
      avatar,
      provider: 'google',
      streak: customUser?.streak || 5,
      points: customUser?.points || 1050,
      tier: 'Silver Tier',
      joinedDate: 'September 2026',
      targetCalories: 2400,
      postureScore: 94,
    };
    setUser(fallbackUser);
  };

  const logout = () => {
    localStorage.removeItem('fitsync_token');
    localStorage.removeItem('fitsynch_user');
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoggedIn: false,
  loginWithEmail: async () => false,
  signupWithEmail: async () => false,
  loginWithGoogle: async () => {},
  logout: () => {},
  updateProfile: () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return defaultAuthContext;
  }
  return context;
};
