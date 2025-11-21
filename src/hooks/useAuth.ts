import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

interface Session {
  user: User;
  access_token: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('auth-session');
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      setSession(parsedSession);
      setUser(parsedSession.user);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Mock sign up - in a real app, this would call your backend API
      const mockUser: User = {
        id: crypto.randomUUID(),
        email,
        user_metadata: {
          full_name: fullName
        }
      };

      const mockSession: Session = {
        user: mockUser,
        access_token: 'mock-token-' + crypto.randomUUID()
      };

      // Store in localStorage
      localStorage.setItem('auth-session', JSON.stringify(mockSession));
      setUser(mockUser);
      setSession(mockSession);

      toast({
        title: "Account created!",
        description: "Mock authentication - replace with your backend API.",
      });

      return { data: { user: mockUser, session: mockSession }, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Mock sign in - in a real app, this would call your backend API
      const mockUser: User = {
        id: crypto.randomUUID(),
        email,
        user_metadata: {}
      };

      const mockSession: Session = {
        user: mockUser,
        access_token: 'mock-token-' + crypto.randomUUID()
      };

      // Store in localStorage
      localStorage.setItem('auth-session', JSON.stringify(mockSession));
      setUser(mockUser);
      setSession(mockSession);

      toast({
        title: "Welcome back!",
        description: "Mock authentication - replace with your backend API.",
      });

      return { data: { user: mockUser, session: mockSession }, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state
      setUser(null);
      setSession(null);

      // Clear localStorage
      localStorage.removeItem('auth-session');
      sessionStorage.clear();

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error: any) {
      // Still clear local state even on error
      setUser(null);
      setSession(null);
      console.error('Sign out error:', error);
      toast({
        title: "Signed out",
        description: "You have been signed out locally.",
      });
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
};