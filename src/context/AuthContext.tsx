'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    // Check localStorage for an existing session on load
    const checkSession = async () => {
      setLoading(true);
      const savedEmail = localStorage.getItem('admin_email');
      if (savedEmail) {
        setUser({ email: savedEmail });
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const emailLower = email.trim().toLowerCase();
      alert(emailLower)
      const adminRef = doc(db, 'admins', emailLower);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        alert("none")
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      const data = adminSnap.data();
      if (data.password === password) {
        // Success
        const newUser = { email: emailLower };
        setUser(newUser);
        localStorage.setItem('admin_email', emailLower);
      } else {
        // Fail
        setError('Invalid email or password.');
      }
    } catch (err: any) {
      console.error('Manual login error:', err);
      setError('An error occurred during login. Please ensure Firestore access is enabled.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('admin_email');
    } catch (err: any) {
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
