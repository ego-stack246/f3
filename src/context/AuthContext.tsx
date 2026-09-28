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
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loginWithEmail: (email: string) => Promise<boolean>;
  signupWithEmail: (name: string, email: string) => Promise<boolean>;
  loginWithGoogle: (customUser?: Partial<User>) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}



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
    } else {
      localStorage.removeItem('fitsynch_user');
    }
  }, [user]);

  const loginWithEmail = async (email: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const nameFromEmail = email.split('@')[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
    
    const newUser: User = {
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
    setUser(newUser);
    return true;
  };

  const signupWithEmail = async (name: string, email: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const newUser: User = {
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
    };
    setUser(newUser);
    return true;
  };

  const loginWithGoogle = async (customUser?: Partial<User>) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const googleUser: User = {
      id: `usr_google_${Date.now()}`,
      name: customUser?.name || 'Alex Rivera',
      email: customUser?.email || 'alex.rivera@gmail.com',
      avatar: customUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      provider: 'google',
      streak: customUser?.streak || 5,
      points: customUser?.points || 1050,
      tier: 'Silver Tier',
      joinedDate: 'September 2026',
      targetCalories: 2400,
      postureScore: 94,
    };
    setUser(googleUser);
  };

  const logout = () => {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
