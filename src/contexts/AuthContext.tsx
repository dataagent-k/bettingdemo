'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateBalance: (newBalance: number) => Promise<boolean>;
  resetBalance: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/user/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser();
      setIsLoading(false);
    };
    
    initAuth();
  }, [refreshUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const signUp = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful signup, sign in the user
        const signInResult = await signIn(email, password);
        return signInResult;
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, [signIn]);

  const signOut = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  const updateBalance = useCallback(async (newBalance: number) => {
    try {
      const response = await fetch('/api/user/balance', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, balance: data.balance } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating balance:', error);
      return false;
    }
  }, []);

  const resetBalance = useCallback(async () => {
    try {
      const response = await fetch('/api/user/balance', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(prev => prev ? { ...prev, balance: data.balance } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resetting balance:', error);
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      updateBalance,
      resetBalance,
      refreshUser,
    }}>
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
