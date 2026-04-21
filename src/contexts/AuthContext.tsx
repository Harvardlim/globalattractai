import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getRedirectUrl } from '@/lib/redirectUrl';
import { recordActivity, isSessionExpiredByInactivity, clearActivity } from '@/lib/sessionActivity';

type MemberTier = 'normal' | 'vip' | 'vip_plus' | 'subscriber';

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  member_tier: MemberTier;
  membership_expires_at: string | null;
  source: string;
  must_change_password: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signUp: (email: string, password: string, displayName?: string, source?: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track user activity for 7-day inactivity timeout
    const handleActivity = () => recordActivity();
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);

    // IMPORTANT: Set up onAuthStateChange FIRST, then call getSession
    // Do NOT use async/await inside onAuthStateChange to avoid race conditions on native
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          recordActivity();
          // Fire-and-forget: no await, no setTimeout wrapping
          fetchProfileAndRole(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setIsOwner(false);
        }

        if (event === 'SIGNED_OUT') {
          clearActivity();
          setProfile(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
          setIsOwner(false);
        }

        if (event === 'TOKEN_REFRESHED' && !session) {
          // Token refresh failed (e.g. password changed), force sign out
          supabase.auth.signOut();
          clearActivity();
        }
        
        setLoading(false);
      }
    );

    // Restore session from storage
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // If session restoration fails (e.g. invalid refresh token after password change)
      if (error || (session?.user && isSessionExpiredByInactivity())) {
        supabase.auth.signOut();
        clearActivity();
        setLoading(false);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        recordActivity();
        fetchProfileAndRole(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(() => {
      // If getSession throws (corrupted storage on native), clean up
      supabase.auth.signOut().catch(() => {});
      clearActivity();
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  const fetchProfileAndRole = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await (supabase
        .from('profiles')
        .select('id, email, display_name, member_tier, membership_expires_at, source, must_change_password')
        .eq('id', userId)
        .maybeSingle() as any);

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      const userRole = roleData?.role;
      const userIsOwner = userRole === 'owner';
      const userIsAdmin = userRole === 'admin' || userRole === 'superadmin' || userRole === 'owner';
      const userIsSuperAdmin = userRole === 'superadmin' || userRole === 'owner';
      setIsOwner(userIsOwner);
      setIsAdmin(userIsAdmin);
      setIsSuperAdmin(userIsSuperAdmin);

      if (profileData) {
        // Admins always get subscriber tier and never expire
        if (userIsAdmin) {
          setProfile({
            ...profileData,
            member_tier: 'subscriber',
          });
        } else {
          const isExpired = profileData.membership_expires_at && 
            new Date(profileData.membership_expires_at) < new Date();
          setProfile({
            ...profileData,
            member_tier: isExpired ? 'normal' : profileData.member_tier,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile/role:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string, source?: string, referralCode?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            display_name: displayName,
            source: source || '全球发愿',
            referral_code: referralCode || undefined,
          },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // On native platforms, clear any stale session before attempting login
      // This prevents conflicts when password was changed externally
      const { data: currentSession } = await supabase.auth.getSession();
      if (currentSession.session) {
        await supabase.auth.signOut();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error };

      // Check if account is frozen
      if (data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('is_frozen')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileData?.is_frozen) {
          await supabase.auth.signOut();
          return { error: new Error('ACCOUNT_FROZEN') };
        }

        // Record last login time (fire-and-forget)
        supabase
          .from('profiles')
          .update({ last_login_at: new Date().toISOString() } as any)
          .eq('id', data.user.id)
          .then(() => {});
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileAndRole(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin,
        isSuperAdmin,
        isOwner,
        loading,
        refreshProfile,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
