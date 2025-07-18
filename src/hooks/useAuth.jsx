import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { supabase } from '../services/authService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to refresh the session token
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        throw refreshError;
      }
      
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      setError(error);
      return null;
    }
  }, []);

  // Function to get user profile
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, []);

  // Function to update user data
  const updateUserData = useCallback(async (session) => {
    if (!session?.user) {
      setUser(null);
      localStorage.removeItem('userData');
      return null;
    }

    try {
      const profile = await fetchUserProfile(session.user.id);
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      const userWithRole = {
        ...session.user,
        role: profile?.role || 'user',
        fullName: profile?.full_name || 'Usuário'
      };
      
      setUser(userWithRole);
      localStorage.setItem('userData', JSON.stringify(userWithRole));
      setError(null);
      return userWithRole;
    } catch (error) {
      console.error('Error updating user data:', error);
      setError(error);
      setUser(null);
      localStorage.removeItem('userData');
      return null;
    }
  }, [fetchUserProfile]);

  // Sign in a user
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) throw signInError;
      if (!data?.user) throw new Error('Authentication failed');

      const userWithRole = await updateUserData(data);
      
      return {
        user: userWithRole,
        error: null
      };
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error);
      return {
        user: null,
        error: error.message || 'Failed to sign in'
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      localStorage.removeItem('userData');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error);
      return { error: error.message || 'Failed to sign out' };
    } finally {
      setLoading(false);
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error);
      return { error: error.message || 'Failed to send password reset email' };
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user is currently signed in');
      
      setLoading(true);
      
      // Update the profile in the database
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Update local user data
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return { user: updatedUser, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error);
      return { user: null, error: error.message || 'Failed to update profile' };
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  // Initialize auth state and set up auth state listener
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if the session is expired
          const currentTime = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < currentTime) {
            // Session is expired, try to refresh it
            const refreshedSession = await refreshSession();
            if (refreshedSession) {
              await updateUserData(refreshedSession);
            }
          } else {
            // Session is still valid
            await updateUserData(session);
          }
        } else {
          setUser(null);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        setError(error);
        setUser(null);
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            localStorage.removeItem('userData');
          } else if (session) {
            await updateUserData(session);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
          setError(error);
        }
      }
    );

    // Initial session check
    getInitialSession();

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [refreshSession, updateUserData]);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: hasRole('admin'),
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasRole,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}