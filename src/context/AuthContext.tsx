
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { supabase } from "@/integrations/supabase/client";
import * as AuthService from "@/services/AuthService";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  register: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state and set up listener
  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Set user from session
          const { user: supabaseUser } = session;
          const currentUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
            role: supabaseUser.user_metadata?.role || 'user',
            avatarUrl: supabaseUser.user_metadata?.avatar_url
          };
          setUser(currentUser);
          setIsLoading(false);
          
          // If we're on the login page, redirect to home
          if (location.pathname === '/login') {
            setTimeout(() => {
              navigate('/');
            }, 0);
          }
        } else {
          setUser(null);
          setIsLoading(false);
          
          // If we're on a protected page, redirect to login
          const publicRoutes = ['/login', '/register'];
          if (!publicRoutes.includes(location.pathname)) {
            // Don't redirect immediately to prevent loops
            setTimeout(() => {
              navigate('/login');
            }, 0);
          }
        }
      }
    );

    // Check for existing session
    AuthService.getCurrentUser().then(user => {
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await AuthService.login(email, password);
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
  };

  const register = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      await AuthService.register(name, email, password, role);
      toast.success("Registration successful!");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
