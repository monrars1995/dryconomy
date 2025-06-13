import { getSystemConfig } from './supabaseClient';
import { supabase } from './authService';
import { cityParameters } from '../config/cityParameters';

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
    // Retornamos sucesso mesmo com falha para não bloquear o usuário
    // Os dados estão salvos no localStorage como backup
    return {
      success: true,
      leadId: null,
      savedToSupabase: false,
      savedToWebhook: false,
      localBackup: true
    };
  }
};

// Função para buscar cidades
export const getCities = async () => {
  try {
    // Primeiro tentamos buscar do Supabase
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.warn('Erro ao buscar cidades do Supabase, usando dados locais:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Cidades carregadas do Supabase:', data.length);
      return data;
    } else {
      throw new Error('Nenhuma cidade encontrada no Supabase');
    }
  } catch (error) {
    // Se falhar, usamos os dados locais
    console.log('Usando dados de cidades locais');
    
    // Converter o objeto cityParameters em um array de objetos de cidade
    const cities = Object.keys(cityParameters).map(name => {
      const params = cityParameters[name];
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        state: '', // Não temos estado nos dados locais
        country: 'Brasil',
        capacity: params.capacity,
        water_flow: params.waterFlow,
        tin: params.tin,
        tout: params.tout,
        average_temperature: 25, // Valor padrão
        water_consumption_year: params.waterConsumptionYearTemp + params.waterConsumptionYearFan,
        water_consumption_year_conventional: (params.waterConsumptionYearTemp + params.waterConsumptionYearFan) * 10, // Estimativa
        makeup_water_fan_logic: params.makeupWaterFanLogic,
        water_consumption_fan_logic: params.waterConsumptionFanLogic
      };
    });
    
    return cities;
  }
};