import { getSystemConfig } from './supabaseClient';
import { supabase } from './authService';

const WEBHOOK_URL = 'https://webhook.myc360.com/webhook/dryconomy';

/**
 * Salva os dados da simulação no Supabase e envia para o webhook existente (se habilitado)
 * @param {Object} simulationData - Dados da simulação
 * @returns {Promise} - Promessa com a resposta da operação
 */
export const saveSimulation = async (simulationData) => {
  let supabaseSuccess = false;
  let leadId = null;
  let webhookSuccess = false;
  
  console.log('Iniciando salvamento da simulação:', simulationData);
  
  // Verificar configuração do sistema
  let systemConfig;
  try {
    systemConfig = await getSystemConfig();
  } catch (error) {
    console.warn('Erro ao buscar configuração do sistema:', error);
    systemConfig = { webhook_enabled: true }; // Fallback para webhook habilitado
  }
  const webhookEnabled = systemConfig?.webhook_enabled ?? true;
  
  // Tentativa 1: Salvar no Supabase
  try {
    // 1. Primeiro, salvamos o lead na tabela 'leads'
    const { userData } = simulationData;
    
    if (!userData || !userData.name || !userData.email) {
      throw new Error('Dados do usuário incompletos para salvamento');
    }
    
    const leadData = {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone?.trim() || null,
      company: userData.company?.trim() || null,
      state: userData.state?.trim() || null,
      status: 'novo',
      created_at: new Date().toISOString()
    };
    
    console.log('Tentando salvar lead no Supabase:', leadData);
    
    // Inserir o lead no Supabase
    const { data: leadResult, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select();
    
    if (leadError) {
      console.error('Erro ao salvar lead no Supabase:', leadError);
      throw leadError;
    } else if (leadResult && leadResult.length > 0) {
      // Se conseguimos salvar o lead, tentamos salvar o resultado da simulação
      leadId = leadResult[0].id;
      console.log('Lead salvo com sucesso, ID:', leadId);
      
      const simulationResult = {
        lead_id: leadId,
        input_data: {
          location: simulationData.location,
          capacity: simulationData.capacity,
          operatingHours: simulationData.operatingHours,
          operatingDays: simulationData.operatingDays
        },
        results: simulationData.results,
        created_at: new Date().toISOString()
      };
      
      console.log('Tentando salvar resultado da simulação:', simulationResult);
      
      const { data: simulationSaveResult, error: simulationError } = await supabase
        .from('simulation_results')
        .insert(simulationResult)
        .select();
      
      if (simulationError) {
        console.error('Erro ao salvar resultado no Supabase:', simulationError);
        throw simulationError;
      } else {
        supabaseSuccess = true;
        console.log('Simulação salva com sucesso no Supabase:', simulationSaveResult);
      }
    } else {
      throw new Error('Falha ao obter ID do lead após inserção');
    }
  } catch (supabaseError) {
    console.error('Erro completo ao salvar no Supabase:', supabaseError);
    supabaseSuccess = false;
  }
  
  // Tentativa 2: Webhook (se habilitado e Supabase falhou)
  if (webhookEnabled && !supabaseSuccess) {
    try {
      console.log('Tentando salvar via webhook como fallback...');
      
      const webhookData = {
        type: 'simulation',
        timestamp: new Date().toISOString(),
        data: {
          userData: simulationData.userData,
          inputs: {
            location: simulationData.location,
            capacity: simulationData.capacity,
            operatingHours: simulationData.operatingHours,
            operatingDays: simulationData.operatingDays
          },
          results: simulationData.results,
          leadId: leadId // Pode ser null se o Supabase falhou
        }
      };
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });
      
      if (response.ok) {
        webhookSuccess = true;
        console.log('Dados enviados com sucesso para o webhook');
      } else {
        const errorText = await response.text();
        console.error('Falha ao enviar dados para o webhook:', response.status, response.statusText, errorText);
        throw new Error(`Webhook falhou: ${response.status} ${response.statusText}`);
      }
    } catch (webhookError) {
      console.error('Erro ao enviar dados para o webhook:', webhookError);
      webhookSuccess = false;
    }
  }
  
  // Salvar uma cópia local como última garantia
  try {
    const savedSimulations = JSON.parse(localStorage.getItem('savedSimulations') || '[]');
    savedSimulations.push({
      ...simulationData,
      timestamp: new Date().toISOString(),
      savedToSupabase: supabaseSuccess,
      savedToWebhook: webhookSuccess
    });
    localStorage.setItem('savedSimulations', JSON.stringify(savedSimulations));
    console.log('Cópia local salva com sucesso');
  } catch (localStorageError) {
    console.warn('Não foi possível salvar cópia local', localStorageError);
  }
  
  // Consideramos a operação um sucesso se conseguimos salvar em pelo menos um dos lugares
  if (supabaseSuccess || webhookSuccess) {
    console.log('Simulação salva com sucesso:', { supabaseSuccess, webhookSuccess, leadId });
    return {
      success: true,
      leadId,
      savedToSupabase: supabaseSuccess,
      savedToWebhook: webhookSuccess
    };
  } else {
    console.error('Falha completa no salvamento da simulação');
    throw new Error('Não foi possível salvar a simulação em nenhum dos destinos. Verifique sua conexão e tente novamente.');
  }
};

// Função para buscar cidades do Supabase
export const getCities = async () => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};

// Função para buscar cidade específica por ID
export const getCityById = async (cityId) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar cidade por ID:', error);
    return null;
  }
};

// Função para buscar cidade por nome
export const getCityByName = async (cityName) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .ilike('name', cityName)
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar cidade por nome:', error);
    return null;
  }
};

/**
 * Busca as variáveis de cálculo do Supabase
 * @returns {Promise} - Promessa com as variáveis de cálculo
 */
export const getCalculationVariables = async () => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .select('*');
    
    if (error) throw error;
    
    // Transformar o array em um objeto para facilitar o acesso
    const variables = {};
    data.forEach(variable => {
      variables[variable.name] = variable.value;
    });
    
    return variables;
  } catch (error) {
    console.error('Erro ao buscar variáveis de cálculo:', error);
    // Retornar valores padrão em caso de erro
    return {
      preco_m3_agua: 10.50,
      tarifa_esgoto_percentual: 80.00,
      economia_media_technologia: 37.00,
      vida_util_equipamento: 10.00,
      custo_implantacao_base: 5000.00,
      custo_manutencao_anual: 200.00,
      taxa_inflacao_anual: 3.5,
      taxa_juros_anual: 6.00
    };
  }
};
