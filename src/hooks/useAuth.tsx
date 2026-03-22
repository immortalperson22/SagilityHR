import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'applicant' | 'admin' | 'hr';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    console.log("🕵️ Fetching role for:", userId, "Result:", { data: roleData, error: roleError });
    
    if (roleError) {
      console.error("❌ Role fetch error:", roleError);
      setRole(null);
    } else if (roleData) {
      setRole(roleData.role as AppRole);
    } else {
      console.warn("⚠️ No role record found for this user.");
      setRole(null);
    }
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data && !error) {
      setProfile(data as Profile);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Real-time listener for role changes
    const roleChannel = supabase
      .channel('public:user_roles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: user ? `user_id=eq.${user.id}` : undefined
        },
        (payload) => {
          if (payload.new && (payload.new as any).role) {
            setRole((payload.new as any).role as AppRole);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(roleChannel);
    };
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/verify`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone || null
        }
      }
    });

    if (error) return { error };

    // For testing: auto-confirm email to avoid rate limiting
    // In production, remove this block and require email verification
    if (data.user && !data.session) {
      // Email confirmation required - this triggers the rate limit
      // For testing, we can skip this
      console.log('Signup successful - check email to confirm');
    }

    // Note: Profile creation is now handled by a database trigger 
    // to ensure it works even if email confirmation is required.

    if (data.user) {
      // Assign default role as applicant using RPC (bypasses RLS)
      const { error: roleError } = await supabase.rpc('assign_default_role' as any, {
        p_user_uuid: data.user.id
      });

      if (roleError) {
        console.error('❌ Role (RPC) Error:', roleError);
      } else {
        console.log('✅ Default role assigned via RPC');
      }
    }

    return { error: null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('SignOut error:', error);
    }
    
    // Clear all state
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
    
    // Clear localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Force full page reload and redirect
    window.location.replace('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, signIn, signUp, signOut }}>
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
