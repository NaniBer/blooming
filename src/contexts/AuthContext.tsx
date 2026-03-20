import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithTelegram: (telegramData: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  initialUser: any;
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    // Check if Supabase credentials are configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
      console.warn('Supabase not configured. Using localStorage fallback.');
      setIsSupabaseReady(false);

      // Fallback: Use localStorage without Supabase
      if (initialUser) {
        setUser(initialUser as any);
      }
      setLoading(false);
      return;
    }

    setIsSupabaseReady(true);

    if (initialUser) {
      handleUserFromTelegram(initialUser);
    }
  }, [initialUser]);

  const handleUserFromTelegram = async (telegramData: any) => {
    if (!isSupabaseReady) {
      console.warn('Supabase not ready, using localStorage fallback');
      setUser(telegramData as any);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Looking up Telegram user:', telegramData.id);

      // Check if user exists in Supabase
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramData.id.toString())
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      if (profiles) {
        // User exists, set as current user
        console.log('User found:', profiles);
        setUser(profiles);
      } else {
        // New user, create profile
        console.log('Creating new user...');

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            telegram_id: telegramData.id.toString(),
            username: telegramData.username || null,
            first_name: telegramData.first_name || null,
            last_name: telegramData.last_name || null,
            theme_preference: localStorage.getItem('theme') || null,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }

        if (newProfile) {
          console.log('New user created:', newProfile);
          setUser(newProfile);
        }
      }

      // Also migrate local theme preference
      const localTheme = localStorage.getItem('theme');
      if (localTheme && profiles) {
        await supabase
          .from('profiles')
          .update({ theme_preference: localTheme })
          .eq('id', profiles.id);
      }
    } catch (error: any) {
      console.error('Error handling Telegram user:', error);

      let errorMessage = 'Failed to sign in. ';

      if (error.code === '42P01') {
        errorMessage += 'Database table does not exist. Please run the SQL schema.';
      } else if (error.code === 'PGRST116') {
        errorMessage += 'Database connection failed.';
      } else {
        errorMessage += error.message || 'Unknown error.';
      }

      setError(errorMessage);
      alert(errorMessage);

      // Fallback: Still allow user to use app with localStorage
      console.log('Using localStorage fallback due to error');
      setUser(telegramData as any);
    } finally {
      setLoading(false);
    }
  };

  const signInWithTelegram = async (telegramData: any) => {
    await handleUserFromTelegram(telegramData);
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('telegram_id', user.user_metadata?.telegram_id || user.id)
          .single();

        setUser(profile || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithTelegram, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
