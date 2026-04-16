import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '../data/mockData';

export interface User { id: number; name: string; email: string; role: UserRole; }

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('smarthotel_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (token: string, userData: User) => {
    localStorage.setItem('smarthotel_token', token);
    localStorage.setItem('smarthotel_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('smarthotel_token');
    localStorage.removeItem('smarthotel_user');
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};