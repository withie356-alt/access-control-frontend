import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser(profile);
          setIsLoggedIn(true);
        } else if (error) {
          console.error('Error fetching profile:', error);
          setUser(null);
          setIsLoggedIn(false);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const fetchProfile = async () => {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, email, role')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
            setIsLoggedIn(true);
          } else if (error) {
            console.error('Error fetching profile on auth state change:', error);
            setUser(null);
            setIsLoggedIn(false);
          }
        };
        fetchProfile();
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Login error:', error.message);
      setUser(null);
      setIsLoggedIn(false);
      return { success: false, error: error.message };
    }

    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        setUser(profile);
        setIsLoggedIn(true);
        console.log('AuthContext user role after login:', profile.role); // 디버깅용
        return { success: true, user: profile };
      } else if (profileError) {
        console.error('Error fetching profile after login:', profileError);
        // If profile not found, log out to prevent inconsistent state
        await supabase.auth.signOut();
        setUser(null);
        setIsLoggedIn(false);
        return { success: false, error: 'User profile not found.' };
      } else {
        // This case should ideally not happen if data.user exists but profile is null without error
        await supabase.auth.signOut();
        setUser(null);
        setIsLoggedIn(false);
        return { success: false, error: 'User profile could not be retrieved.' };
      }
    }
    return { success: false, error: 'Unknown login error.' };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};