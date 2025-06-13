/**
 * Serviço de autenticação para o Simulador Dryconomy
 * 
 * Este arquivo contém funções para autenticação de usuários e gerenciamento de sessão
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do cliente Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Função para realizar login de usuário
 * 
 * @param {string} email Email do usuário
 * @param {string} password Senha do usuário
 * @returns {Promise} Promessa com os dados do usuário e sessão
 */
export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    
    // Obter perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;
    
    // Armazenar dados do usuário no localStorage para acesso rápido
    localStorage.setItem('userData', JSON.stringify({
      ...data.user,
      role: profile?.role || 'user',
      fullName: profile?.full_name || 'Usuário'
    }));
    
    return { user: { ...data.user, role: profile?.role || 'user', fullName: profile?.full_name || 'Usuário' } };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

/**
 * Função para realizar logout do usuário
 */
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
  
  localStorage.removeItem('userData');
  window.location.href = '/login';
};

/**
 * Função para verificar se o usuário está autenticado
 * 
 * @returns {Promise<boolean>} Promessa que resolve para verdadeiro se o usuário estiver autenticado
 */
export const isAuthenticated = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

/**
 * Função para obter o token de autenticação
 * 
 * @returns {Promise<string|null>} Token de autenticação ou null se não estiver autenticado
 */
export const getAuthToken = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || null;
  } catch (error) {
    console.error('Erro ao obter token de autenticação:', error);
    return null;
  }
};

/**
 * Função para obter os dados do usuário logado
 * 
 * @returns {Object|null} Dados do usuário ou null se não estiver autenticado
 */
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

/**
 * Função para verificar se o usuário tem permissão de administrador
 * 
 * @returns {boolean} Verdadeiro se o usuário for administrador
 */
export const isAdmin = () => {
  const userData = getUserData();
  return userData && userData.role === 'admin';
};

/**
 * Função para obter cabeçalhos de autenticação para requisições à API
 * 
 * @returns {Promise<Object>} Cabeçalhos HTTP com token de autenticação
 */
export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Função para registrar um novo usuário
 * 
 * @param {string} email Email do usuário
 * @param {string} password Senha do usuário
 * @param {Object} userData Dados adicionais do usuário
 * @returns {Promise} Promessa com os dados do usuário registrado
 */
export const signUp = async (email, password, userData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.fullName,
          // Outros dados do usuário
        }
      }
    });

    if (error) throw error;
    
    // Criar perfil do usuário
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            full_name: userData.fullName,
            role: 'user' // Papel padrão
          }
        ]);

      if (profileError) throw profileError;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

/**
 * Função para redefinir a senha do usuário
 * 
 * @param {string} email Email do usuário
 * @returns {Promise} Promessa com o resultado da operação
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    throw error;
  }
};

/**
 * Função para atualizar o perfil do usuário
 * 
 * @param {string} userId ID do usuário
 * @param {Object} updates Campos para atualizar
 * @returns {Promise} Promessa com os dados atualizados
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    
    // Atualizar dados no localStorage
    const userData = getUserData();
    if (userData) {
      localStorage.setItem('userData', JSON.stringify({
        ...userData,
        ...updates
      }));
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};