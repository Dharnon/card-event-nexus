
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
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: UserRole, adminPassword?: string) => Promise<void>;
  resendConfirmationEmail: (email: string) => Promise<void>;
  isAuthenticating: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: () => {},
  register: async () => {},
  resendConfirmationEmail: async () => {},
  isAuthenticating: false,
  authError: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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
          
          // If we're on the login or auth page, redirect to home
          if (location.pathname.includes('/login') || location.pathname.includes('/auth')) {
            setTimeout(() => {
              navigate('/');
            }, 0);
          }
        } else {
          setUser(null);
          setIsLoading(false);
          
          // List of public routes that don't require authentication
          const publicRoutes = [
            '/login', 
            '/auth', 
            '/auth/callback', 
            '/register',
            '/', 
            '/events',
            '/calendar',
            '/events/'  // Allow viewing event details without auth
          ];
          
          // Check if current path is a public route or starts with a public route pattern
          const isPublicRoute = publicRoutes.some(route => 
            location.pathname === route || 
            (route.endsWith('/') && location.pathname.startsWith(route))
          );
          
          // Don't redirect if on a public route
          if (!isPublicRoute) {
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
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      await AuthService.login(email, password);
      toast.success("Welcome back!");
    } catch (error: any) {
      const errorMessage = error.message || "Login failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loginWithGoogle = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      await AuthService.loginWithGoogle();
      // No success message here as the page will redirect to Google
    } catch (error: any) {
      const errorMessage = error.message || "Google login failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      setIsAuthenticating(false);
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
  };

  const register = async (name: string, email: string, password: string, role: UserRole, adminPassword?: string) => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      // Check if admin password is correct if role is 'admin'
      if (role === 'admin') {
        if (adminPassword !== 'mondongo') {
          throw new Error('Incorrect admin password');
        }
      }
      
      await AuthService.register(name, email, password, role);
      toast.success("Registration successful! Please check your email to confirm your account.");
      // Redirect to a confirmation page or show confirmation message
      navigate('/login?verification=pending');
    } catch (error: any) {
      const errorMessage = error.message || "Registration failed. Please try again.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const resendConfirmationEmail = async (email: string) => {
    try {
      await AuthService.resendConfirmationEmail(email);
      toast.success("Verification email has been sent again. Please check your inbox.");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to resend verification email. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      loginWithGoogle,
      logout, 
      register, 
      resendConfirmationEmail,
      isAuthenticating,
      authError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
