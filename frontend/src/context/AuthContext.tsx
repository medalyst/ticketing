
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { decodeJWT } from '../utils/jwt';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(() => {
    const t = localStorage.getItem('token');
    return t ? decodeJWT(t)?.user || decodeJWT(t) : null;
  });

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    const decoded = decodeJWT(newToken);
    setUser(decoded?.user || decoded || null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  const isLoggedIn = !!token;

  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      setUser(decoded?.user || decoded || null);
    } else {
      setUser(null);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
