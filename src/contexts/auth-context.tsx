'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { signOutUser, getCurrentSession, type UserProfile, type AuthError } from '@/lib/auth';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const currentSession = await getCurrentSession();
      if (currentSession?.user) {
        // Call API to get user profile
        const response = await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supabaseUserId: currentSession.user.id }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUser(result.user);
            setSession(currentSession);
          } else {
            console.warn('Failed to get user profile:', result.error);
            setUser(null);
            setSession(null);
          }
        } else {
          console.warn('Profile API call failed');
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setSession(null);
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (session?.user) {
        try {
          // Call API to get user profile
          const response = await fetch('/api/auth/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabaseUserId: session.user.id }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setUser(result.user);
              setSession(session);
            } else {
              console.warn('Failed to get user profile on auth change:', result.error);
              setUser(null);
              setSession(null);
            }
          } else {
            console.warn('Profile API call failed on auth change');
            setUser(null);
            setSession(null);
          }
        } catch (error) {
          console.error('Error getting user profile on auth change:', error);
          setUser(null);
          setSession(null);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔑 Starting client-side login for:', email);
      
      // Do Supabase auth on client-side
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('❌ Supabase login error:', error.message);
        return { error: { message: error.message } };
      }

      if (data.user) {
        console.log('✅ Supabase login successful, updating last login time...');
        
        // Update last login time via API
        try {
          const response = await fetch('/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supabaseUserId: data.user.id }),
          });

          const result = await response.json();
          if (!result.success) {
            if (result.code === 'USER_NOT_FOUND') {
              console.error('❌ User profile incomplete:', result.error);
              // TODO: Could redirect to complete registration or show specific error
            } else {
              console.warn('Failed to update last login time:', result.error);
            }
          } else {
            console.log('✅ Last login time updated');
          }
        } catch (apiError) {
          console.warn('Failed to call last login API:', apiError);
          // Don't fail the login if this fails
        }
      }
      
      console.log('🎉 Login completed successfully');
      return { error: null };
    } catch (error: any) {
      console.log('💥 Login error:', error);
      return { error: { message: error.message || 'Login failed' } };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const result = await signOutUser();
      return { error: result.error };
    } catch (error: any) {
      return { error: { message: error.message || 'Logout failed' } };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user && !!session,
        login,
        logout,
        refreshUser,
      }}
    >
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