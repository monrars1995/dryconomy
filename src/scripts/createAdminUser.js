/**
 * Script para criar um usuário administrador no Supabase
 * 
 * Este script pode ser executado para garantir que exista
 * um usuário com permissões administrativas no sistema.
 */

import { supabase } from '../services/authService';

const ADMIN_EMAIL = 'admin@dryconomy.com';
const ADMIN_PASSWORD = 'Admin@123';

async function createAdminUser() {
  console.log('Verificando se o usuário admin já existe...');
  
  // Primeiro verifica se o usuário já existe
  const { data: existingUser, error: searchError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle();
  
  if (searchError) {
    console.error('Erro ao verificar usuário:', searchError);
    return;
  }
  
  if (existingUser) {
    console.log('Usuário admin já existe. Atualizando para garantir função admin...');
    
    // Atualiza o perfil para garantir que tenha a função admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', existingUser.id);
    
    if (updateError) {
      console.error('Erro ao atualizar perfil:', updateError);
    } else {
      console.log('Perfil atualizado com sucesso. Usuário tem função admin.');
    }
    
    return;
  }
  
  // Se não existe, cria um novo usuário
  console.log('Criando usuário admin...');
  
  // 1. Criar o usuário de autenticação
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  
  if (authError) {
    console.error('Erro ao criar usuário:', authError);
    return;
  }
  
  // 2. Criar o perfil com função admin
  if (authData?.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: ADMIN_EMAIL,
          full_name: 'Administrador',
          role: 'admin',
        }
      ]);
    
    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
    } else {
      console.log('Usuário administrador criado com sucesso!');
      console.log('Email:', ADMIN_EMAIL);
      console.log('Senha:', ADMIN_PASSWORD);
    }
  }
}

// Execute a função
createAdminUser()
  .then(() => console.log('Processo concluído!'))
  .catch(err => console.error('Erro ao executar script:', err));
