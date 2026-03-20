import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
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

  useEffect(() => {
    if (initialUser) {
      handleUserFromTelegram(initialUser);
    }
  }, [initialUser]);

  const handleUserFromTelegram = async (telegramData: any) => {
    setLoading(true);

    try {
      // Check if user exists in Supabase
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramData.id.toString())
        .single();

      if (profiles) {
        // User exists, set as current user
        setUser(profiles);
      } else {
        // New user, create profile
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            telegram_id: telegramData.id.toString(),
            username: telegramData.username || null,
            first_name: telegramData.first_name || null,
            last_name: telegramData.last_name || null,
          })
          .select()
          .single();

        if (newProfile) {
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
    } catch (error) {
      console.error('Error handling Telegram user:', error);
      // Still allow user to use app with localStorage fallback
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
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithTelegram, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
