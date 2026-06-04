'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserMock {
  email: string;
}

interface AuthContextType {
  user: UserMock | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserMock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from localStorage on mount
    const savedEmail = localStorage.getItem('admin_email');
    if (savedEmail) {
      setUser({ email: savedEmail });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const emailLower = email.trim().toLowerCase();

      const { data, error: dbError } = await supabase
        .from('admins')
        .select('password')
        .eq('email', emailLower)
        .maybeSingle();

      if (dbError || !data) {
        setError('Invalid email or password.');
        return;
      }

      if (data.password === password) {
        const newUser = { email: emailLower };
        setUser(newUser);
        localStorage.setItem('admin_email', emailLower);
      } else {
        setError('Invalid email or password.');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('admin_email');
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
