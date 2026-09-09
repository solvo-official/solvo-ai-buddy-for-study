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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('solvo_token'));
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = async () => {
    const storedToken = localStorage.getItem('solvo_token');
    if (!storedToken || storedToken === 'null' || storedToken === 'undefined') {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const u = await api.getProfile();
      setUser(u);
    } catch (err) {
      console.warn('Could not fetch profile, clearing session:', err);
      localStorage.removeItem('solvo_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('solvo_token', res.token);
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
      localStorage.setItem('solvo_token', res.token);
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
      localStorage.setItem('solvo_token', res.token);
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
      localStorage.setItem('solvo_token', res.token);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('solvo_token');
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
