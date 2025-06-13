// Importar o cliente Supabase já configurado
import { supabase } from './authService';

// Função para obter a configuração global do sistema
export const getSystemConfig = async () => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*')
      .single();
    
    if (error) throw error;
    return data || { webhook_enabled: false };
  } catch (error) {
    console.error('Erro ao buscar configuração do sistema:', error);
    return { webhook_enabled: false };
  }
};

// Função para atualizar a configuração global do sistema
export const updateSystemConfig = async (config) => {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .update(config)
      .eq('id', 1) // Assumindo que há apenas uma linha de configuração
      .select();
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao atualizar configuração do sistema:', error);
    return { success: false, error: error.message };
  }
};
