import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type AuthUser = {
  _id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  role?: string;
};

type AuthResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const ACCESS_TOKEN_KEY = 'auth-access-token';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:4000';

async function handleJsonResponse<T> (res: Response): Promise<AuthResponse<T>> {
  const data = (await res.json().catch(() => ({}))) as AuthResponse<T>;
  if (!res.ok) {
    const message = (data as any)?.message || (data as any)?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const saveToken = useCallback((token: string | null) => {
    setAccessToken(token);
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, []);

  const apiRequest = useCallback(
    async <T,>({
      path,
      method = 'GET',
      body,
      token,
      includeAuthHeader = true
    }: {
      path: string;
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: Record<string, unknown>;
      token?: string | null;
      includeAuthHeader?: boolean;
    }): Promise<AuthResponse<T>> => {
      const headers: Record<string, string> = {};
      if (body) headers['Content-Type'] = 'application/json';
      if (includeAuthHeader && token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include'
      });

      return handleJsonResponse<T>(res);
    },
    []
  );

  const fetchProfile = useCallback(
    async (token: string) => {
      const response = await apiRequest<{ user: AuthUser }>({
        path: '/api/auth/me',
        method: 'GET',
        token
      });
      if (response?.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
      throw new Error('Unable to load profile');
    },
    [apiRequest]
  );

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await apiRequest<{ accessToken: string }>({
        path: '/api/auth/refresh-token',
        method: 'POST',
        includeAuthHeader: false
      });
      const token = response?.data?.accessToken;
      if (token) {
        saveToken(token);
      }
      return token || null;
    } catch {
      return null;
    }
  }, [apiRequest, saveToken]);

  const bootstrap = useCallback(async () => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (storedToken) {
      try {
        await fetchProfile(storedToken);
        setAccessToken(storedToken);
        setLoading(false);
        return;
      } catch {
        saveToken(null);
      }
    }

    const refreshed = await refreshAccessToken();
    if (refreshed) {
      await fetchProfile(refreshed).catch(() => {});
    }
    setLoading(false);
  }, [fetchProfile, refreshAccessToken, saveToken]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiRequest<{
          user: AuthUser;
          accessToken: string;
        }>({
          path: '/api/auth/login',
          method: 'POST',
          body: { email, password },
          includeAuthHeader: false
        });

        const token = response?.data?.accessToken;
        const loggedInUser = response?.data?.user;

        if (!token) {
          throw new Error('Access token missing from response');
        }

        saveToken(token);
        setUser(loggedInUser || null);

        // Ensure we have the freshest profile
        await fetchProfile(token).catch(() => {});

        toast({
          title: 'Welcome back!',
          description: 'You are now signed in.'
        });
        return true;
      } catch (error: any) {
        toast({
          title: 'Login failed',
          description: error.message || 'Unable to sign in',
          variant: 'destructive'
        });
        return false;
      }
    },
    [apiRequest, fetchProfile, saveToken, toast]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        await apiRequest({
          path: '/api/auth/register',
          method: 'POST',
          body: { email, password, name: fullName },
          includeAuthHeader: false
        });

        // Auto-login after registration
        await signIn(email, password);
        toast({
          title: 'Account created',
          description: 'Verification email sent. Please verify your email.'
        });
        return true;
      } catch (error: any) {
        toast({
          title: 'Sign up failed',
          description: error.message || 'Unable to create account',
          variant: 'destructive'
        });
        return false;
      }
    },
    [apiRequest, signIn, toast]
  );

  const signOut = useCallback(async () => {
    try {
      if (accessToken) {
        await apiRequest({
          path: '/api/auth/logout',
          method: 'POST',
          token: accessToken
        });
      }
    } catch (error: any) {
      console.warn('Sign out warning:', error);
    } finally {
      saveToken(null);
      setUser(null);
      toast({
        title: 'Signed out',
        description: 'You have been signed out.'
      });
    }
  }, [accessToken, apiRequest, saveToken, toast]);

  return {
    user,
    accessToken,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: Boolean(user)
  };
};
