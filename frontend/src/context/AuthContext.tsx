import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../data/mockData';

export interface User { id: number; name: string; email: string; role: UserRole; isActive?: boolean; avatarUrl?: string | null; }

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5130/api';
const TOKEN_STORAGE_KEY = 'smarthotel_token';
const USER_STORAGE_KEY = 'smarthotel_user';

const readStoredUser = () => {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isInitializing, setIsInitializing] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (userData: User) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      setIsInitializing(false);
      return;
    }

    let isCancelled = false;

    const validateSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session is no longer valid');
        }

        const profile = await response.json();

        if (isCancelled) {
          return;
        }

        const nextUser: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          isActive: profile.isActive,
          avatarUrl: profile.avatarUrl,
        };

        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      } catch {
        if (!isCancelled) {
          clearSession();
        }
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    };

    void validateSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, isAuthenticated: !!user, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
