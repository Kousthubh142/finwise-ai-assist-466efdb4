
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../models/user';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // We need to fetch the user profile data
          // Use setTimeout to avoid potential auth deadlocks
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        // Check if user needs onboarding
        const needsOnboarding = !data.monthly_income || !data.risk_tolerance || !data.financial_goals?.length;
        
        // Ensure we correctly convert the risk_tolerance to the expected union type
        const riskTolerance = data.risk_tolerance as 'low' | 'medium' | 'high';
        
        const userData: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          monthlyIncome: data.monthly_income || 0,
          riskTolerance: riskTolerance,
          financialGoals: data.financial_goals || [],
          avatarUrl: data.avatar_url,
          createdAt: new Date(data.created_at),
          needsOnboarding: needsOnboarding
        };
        setUser(userData);

        // If user needs onboarding, redirect to onboarding page
        if (needsOnboarding) {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Login failed:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Unable to login',
        variant: 'destructive'
      });
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // Make sure we have required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw new Error('Email, password, and name are required');
      }
      
      console.log('Attempting to register with:', { email: userData.email, name: userData.name });
      
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          }
        }
      });

      if (error) throw error;
      
      toast({
        title: 'Registration Successful',
        description: 'Please check your email to confirm your registration.',
      });
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast({
        title: 'Registration Failed',
        description: error.message || 'Unable to register',
        variant: 'destructive'
      });
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive'
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !user.needsOnboarding,
        isLoading,
        login,
        register,
        logout
      }}
    >
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
