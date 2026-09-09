import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile } from '../types/index.ts';
import { api } from '../api/client.ts';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  register: (data: { name: string; email: string; educationLevel?: string; preferredLanguage?: 'en' | 'ur' }) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithGoogle: (params: { email: string; name: string; googleId?: string; picture?: string; credential?: string; educationLevel?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const cached = localStorage.getItem('questrix_user') || localStorage.getItem('solvo_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('questrix_token') || localStorage.getItem('solvo_token'));
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = async () => {
    const storedToken = localStorage.getItem('questrix_token') || localStorage.getItem('solvo_token');
    if (!storedToken || storedToken === 'null' || storedToken === 'undefined') {
      setUser(null);
      localStorage.removeItem('questrix_user');
      localStorage.removeItem('solvo_user');
      return;
    }

    try {
      const u = await api.getProfile();
      if (u) {
        setUser(u);
        localStorage.setItem('questrix_user', JSON.stringify(u));
      }
    } catch (err: any) {
      console.warn('Could not refresh profile:', err);
      // Only clear session if server explicitly returns 401 Unauthorized
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        localStorage.removeItem('questrix_token');
        localStorage.removeItem('questrix_user');
        localStorage.removeItem('solvo_token');
        localStorage.removeItem('solvo_user');
        setToken(null);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('questrix_token') || localStorage.getItem('solvo_token');
    if (storedToken) {
      refreshProfile();
    }
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('questrix_token', res.token);
      localStorage.setItem('questrix_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    educationLevel?: string;
    preferredLanguage?: 'en' | 'ur';
  }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('questrix_token', res.token);
      localStorage.setItem('questrix_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setIsLoading(true);
    try {
      const res = await api.loginAsGuest();
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('questrix_token', res.token);
      localStorage.setItem('questrix_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (params: {
    email: string;
    name: string;
    googleId?: string;
    picture?: string;
    credential?: string;
    educationLevel?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.loginWithGoogle(params);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('questrix_token', res.token);
      localStorage.setItem('questrix_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('questrix_token');
    localStorage.removeItem('questrix_user');
    localStorage.removeItem('solvo_token');
    localStorage.removeItem('solvo_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const updated = await api.updateProfile(updates);
    setUser(updated);
  };

  const upgradeToPremium = async () => {
    const res = await api.upgradeToPremium();
    if (res.user) {
      setUser(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginAsGuest,
        loginWithGoogle,
        logout,
        updateProfile,
        upgradeToPremium,
        refreshProfile,
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
