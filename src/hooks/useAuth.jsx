import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../services/authService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    const getInitialSession = async () => {
      try {
        setLoading(true);
        // Verificar sessão ativa do Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        // Se tiver uma sessão ativa, buscar o perfil do usuário
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Erro ao buscar perfil do usuário:', profileError);
          }
          
          // Definir o usuário com a role
          const userWithRole = {
            ...session.user,
            role: profile?.role || 'user',
            fullName: profile?.full_name || 'Usuário'
          };
          
          setUser(userWithRole);
          
          // Atualizar o localStorage com os dados mais recentes
          localStorage.setItem('userData', JSON.stringify(userWithRole));
        } else {
          // Se não tiver sessão ativa, limpar o usuário
          setUser(null);
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for changes in auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, !!session);
        
        // Se o usuário fez logout, limpar o estado
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('userData');
          return;
        }
        
        // Se o usuário fez login ou o token foi atualizado
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Erro ao buscar perfil do usuário:', profileError);
          }
          
          // Definir o usuário com a role
          const userWithRole = {
            ...session.user,
            role: profile?.role || 'user',
            fullName: profile?.full_name || 'Usuário'
          };
          
          setUser(userWithRole);
          
          // Atualizar o localStorage com os dados mais recentes
          localStorage.setItem('userData', JSON.stringify(userWithRole));
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sign in a user
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        // Atualiza o estado do usuário com a role
        const userWithRole = {
          ...data.user,
          role: profile?.role || 'user',
          fullName: profile?.full_name || 'Usuário'
        };
        
        setUser(userWithRole);
        
        // Atualizar o localStorage com os dados mais recentes
        localStorage.setItem('userData', JSON.stringify(userWithRole));
        
        return {
          user: userWithRole,
          error: null
        };
      }

      return { user: null, error: new Error('Usuário não encontrado') };
    } catch (error) {
      console.error('Erro no login:', error);
      return { user: null, error };
    }
  };

  // Sign out the current user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      localStorage.removeItem('userData');
      return { error: null };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { error };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      return { error };
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select();

      if (error) throw error;

      // Update local user state
      const updatedUser = {
        ...user,
        ...updates
      };
      
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));

      return { data, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}