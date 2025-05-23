
import { supabase } from "@/integrations/supabase/client";
import { User, UserRole } from "@/types";
import { toast } from "sonner";

export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const login = async (email: string, password: string) => {
  try {
    // Clean up existing state
    cleanupAuthState();
    
    // Attempt global sign out first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        throw new Error("Please check your inbox and confirm your email address before logging in.");
      }
      throw error;
    }
    
    toast.success('Logged in successfully!', {
      description: `Welcome back, ${data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User'}`
    });
    
    return data.user;
  } catch (error: any) {
    console.error("Login error:", error.message);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    // Clean up existing state
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      }
    });
    
    if (error) throw error;
    
    return data;
  } catch (error: any) {
    console.error("Google login error:", error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    // Clean up auth state
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Ignore errors
    }
    
    toast.success('Logged out successfully');
    
    // Force page reload for a clean state
    window.location.href = '/login';
  } catch (error: any) {
    console.error("Logout error:", error.message);
    toast.error("Error signing out. Please try again.");
    throw error;
  }
};

export const register = async (name: string, email: string, password: string, role: UserRole = 'user', adminPassword?: string) => {
  try {
    // For security reasons, only admins can create admin or store accounts
    // Default users will always be created as 'user' (player) role
    const userRole = 'user'; // Force to 'user' role regardless of what's passed in
    
    // Clean up existing state first
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    // Setup custom email template options
    const emailOptions = {
      emailRedirectTo: window.location.origin + '/auth/callback',
      data: {
        name,
        role: userRole,
      }
    };
    
    // Register new user with our custom email template
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: emailOptions
    });
    
    if (error) throw error;
    
    toast.success('Registration successful!', {
      description: 'Please check your email to confirm your account.'
    });
    
    return data.user;
  } catch (error: any) {
    console.error("Registration error:", error.message);
    throw error;
  }
};

export const resendConfirmationEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback'
      }
    });
    
    if (error) throw error;
    
    toast.success('Confirmation email sent', {
      description: 'Please check your email to confirm your account.'
    });
    
    return data;
  } catch (error: any) {
    console.error("Error resending confirmation email:", error.message);
    toast.error('Failed to send confirmation email', {
      description: error.message
    });
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/reset-password',
    });
    
    if (error) throw error;
    
    toast.success('Password reset email sent', {
      description: 'Check your email for the password reset link'
    });
    
    return data;
  } catch (error: any) {
    console.error("Password reset error:", error.message);
    toast.error('Failed to send password reset email', {
      description: error.message
    });
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    toast.success('Password updated successfully');
    
    return data;
  } catch (error: any) {
    console.error("Password update error:", error.message);
    toast.error('Failed to update password', {
      description: error.message
    });
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    
    const { id, email, user_metadata } = session.user;
    
    const user: User = {
      id,
      email: email || '',
      name: user_metadata?.name || email?.split('@')[0] || 'User',
      role: user_metadata?.role || 'user',
      avatarUrl: user_metadata?.avatar_url,
    };
    
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};
