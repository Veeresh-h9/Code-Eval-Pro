import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useSession, useAuth } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface SupabaseContextType {
  isInitialized: boolean;
  syncUser: () => Promise<void>;
  createDemoTest: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const { session } = useSession();
  const { isLoaded } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('SupabaseProvider state:', { isLoaded, isSignedIn, user: user?.id, session: !!session });
  }, [isLoaded, isSignedIn, user, session]);

  // Set up Supabase auth with Clerk token
  useEffect(() => {
    const setSupabaseAuth = async () => {
      if (session && isLoaded) {
        try {
          const supabaseAccessToken = await session.getToken({
            template: 'supabase'
          });
          
          if (supabaseAccessToken) {
            await supabase.auth.setSession({
              access_token: supabaseAccessToken,
              refresh_token: 'placeholder-refresh-token'
            });
            console.log('✅ Supabase auth session set');
          }
        } catch (error) {
          console.log('Auth setup completed (no template)');
        }
      } else {
        await supabase.auth.signOut();
      }
    };

    if (isLoaded) {
      setSupabaseAuth();
    }
  }, [session, isLoaded]);

  const syncUser = async () => {
    if (!user || !isSignedIn) return;

    try {
      const email = user.emailAddresses[0]?.emailAddress;
      const name = user.fullName || user.firstName || 'User';
      const isAdmin = email === 'admin@codeeval.com' || email === 'veer@gmail.com';

      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: email!,
          name,
          role: isAdmin ? 'admin' : 'user',
          is_active: true,
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.log('User sync completed with note:', error.message);
      } else {
        console.log('✅ User synced successfully');
      }
    } catch (error) {
      console.error('Error in syncUser:', error);
    }
  };

  const createDemoTest = async () => {
    if (!user || !isSignedIn) return;

    try {
      // Check if demo test already exists for this user
      const { data: existingTest } = await supabase
        .from('tests')
        .select('*')
        .eq('name', 'Demo Coding Challenge')
        .contains('assigned_users', [user.id])
        .single();

      if (existingTest) {
        console.log('Demo test already exists');
        return;
      }

      // Use predefined demo question IDs
      const questionIds = ['demo-two-sum', 'demo-palindrome', 'demo-reverse-string'];

      // Create demo test
      const { error } = await supabase
        .from('tests')
        .insert({
          name: 'Demo Coding Challenge',
          description: 'A sample test with 3 easy programming questions to showcase the platform capabilities. Perfect for getting started!',
          questions: questionIds,
          assigned_users: [user.id],
          is_active: true,
          created_by: 'system'
        });

      if (error) {
        console.log('Demo test creation completed with note:', error.message);
      } else {
        console.log('✅ Demo test created successfully');
        toast.success('Demo test created! Check your dashboard.');
      }
    } catch (error) {
      console.error('Error creating demo test:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUser().then(() => {
        createDemoTest().then(() => {
          setIsInitialized(true);
        });
      });
    } else if (isLoaded && !isSignedIn) {
      setIsInitialized(true);
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <SupabaseContext.Provider value={{ isInitialized, syncUser, createDemoTest }}>
      {children}
    </SupabaseContext.Provider>
  );
};