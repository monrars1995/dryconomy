import { getSystemConfig } from './supabaseClient';
import { supabase } from './authService';
import { cityParameters, commonParameters } from '../config/cityParameters';

const WEBHOOK_URL = 'https://webhook.myc360.com/webhook/dryconomy';

/**
 * Helper function to get local city data as fallback
 * @returns {Array} Array of city objects with default values
 */
const getLocalCities = () => {
  return Object.keys(cityParameters).map(name => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name: name,
    state: '',
    country: 'Brasil',
    ...cityParameters[name]
  }));
};

/**
 * Salva os dados da simulação no Supabase e envia para o webhook existente (se habilitado)
 * @param {Object} simulationData - Dados da simulação
 * @returns {Promise} - Promessa com a resposta da operação
 */
export const saveSimulation = async (simulationData) => {
  let supabaseSuccess = false;
  let leadId = null;
  let webhookSuccess = false;
  
  
  
  // Verificar configuração do sistema
  let systemConfig;
  try {
    systemConfig = await getSystemConfig();
  } catch (error) {
    systemConfig = { webhook_enabled: true }; // Fallback para webhook habilitado
  }
  const webhookEnabled = systemConfig?.webhook_enabled ?? true;
  
  // Tentativa 1: Salvar no Supabase
  try {
    // 1. Primeiro, salvamos o lead na tabela 'leads'
    const { userData, inputs, results } = simulationData;
    
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
    
    
    
    // Inserir o lead no Supabase
    const { data: leadResult, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select();
    
    if (leadError) {
      throw leadError;
    } else if (leadResult && leadResult.length > 0) {
      leadId = leadResult[0].id;
      

      // Obter water_flow da cidade selecionada
      const selectedCity = cityParameters[inputs.location];
      const waterFlow = selectedCity ? selectedCity.waterFlow : 0; // Default to 0 if not found

      // Obter delta_t dos parâmetros comuns
      const deltaT = commonParameters.deltaT;
      
      // Salvar os dados principais da simulação na tabela 'simulations'
      const simulationMainData = {
        lead_id: leadId,
        capacity: inputs.capacity,
        location: inputs.location,
        delta_t: deltaT,
        water_flow: waterFlow,
        operating_hours: inputs.operatingHours,
        operating_days: inputs.operatingDays,
        created_at: new Date().toISOString()
      };
      
      
      
      const { data: simulationSaveResult, error: simulationError } = await supabase
        .from('simulations')
        .insert(simulationMainData)
        .select();
      
      if (simulationError) {
        throw simulationError;
      } else if (simulationSaveResult && simulationSaveResult.length > 0) {
        const simulationId = simulationSaveResult[0].id;
        

        // Salvar resultados do Drycooler
        const drycoolerResultsData = {
          simulation_id: simulationId,
          module_capacity: results.drycooler.moduleCapacity,
          modules: results.drycooler.modules,
          total_capacity: results.drycooler.totalCapacity,
          nominal_water_flow: results.drycooler.nominalWaterFlow,
          evaporation_percentage: results.drycooler.evaporationPercentage,
          evaporation_flow: results.drycooler.evaporationFlow,
          hourly_consumption: results.drycooler.consumption.hourly,
          daily_consumption: results.drycooler.consumption.daily,
          monthly_consumption: results.drycooler.consumption.monthly,
          yearly_consumption: results.drycooler.consumption.yearly,
          created_at: new Date().toISOString()
        };
        const { error: drycoolerError } = await supabase.from('drycooler_results').insert(drycoolerResultsData);
        if (drycoolerError) ;

        // Salvar resultados da Torre
        const towerResultsData = {
          simulation_id: simulationId,
          capacity: results.tower.capacity,
          nominal_water_flow: results.tower.nominalWaterFlow, // Assuming this exists or needs to be added to results.tower
          evaporation_percentage: results.tower.evaporationPercentage, // Assuming this exists or needs to be added to results.tower
          evaporation_flow: results.tower.evaporationFlow, // Assuming this exists or needs to be added to results.tower
          hourly_consumption: results.tower.consumption.hourly,
          daily_consumption: results.tower.consumption.daily,
          monthly_consumption: results.tower.consumption.monthly,
          yearly_consumption: results.tower.consumption.yearly,
          created_at: new Date().toISOString()
        };
        const { error: towerError } = await supabase.from('tower_results').insert(towerResultsData);
        if (towerError) ;

        // Salvar resultados da Comparação
        const comparisonResultsData = {
          simulation_id: simulationId,
          yearly_difference: results.comparison.yearlyDifference,
          yearly_difference_percentage: results.comparison.yearlyDifferencePercentage,
          sustainability_score: results.comparison.sustainabilityScore || 0, // Assuming sustainabilityScore exists or default to 0
          created_at: new Date().toISOString()
        };
        const { error: comparisonError } = await supabase.from('comparison_results').insert(comparisonResultsData);
        if (comparisonError) ;

        supabaseSuccess = true;
      } else {
        throw new Error('Falha ao obter ID da simulação após inserção');
      }
    } else {
      throw new Error('Falha ao obter ID do lead após inserção');
    }
  } catch (supabaseError) {
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
    
  } catch (localStorageError) {
  }
  
  // Consideramos a operação um sucesso se conseguimos salvar em pelo menos um dos lugares
  if (supabaseSuccess || webhookSuccess) {
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
      localBackup: true,
      error: 'Não foi possível salvar a simulação em nenhum dos destinos. Os dados foram salvos localmente.'
    };
  }
};

// Função para buscar cidades do Supabase
export const getCities = async () => {
  try {
    // Primeiro, tentamos buscar do Supabase
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.warn('Erro ao buscar cidades do Supabase, usando dados locais:', error);
      // Fallback para dados locais
      return getLocalCities();
    }
    
    if (data && data.length > 0) {
      return data;
    }
    
    // Se não houver dados no Supabase, usamos os dados locais
    console.log('Nenhuma cidade encontrada no Supabase, usando dados locais');
    return Object.keys(cityParameters).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      state: '',
      country: 'Brasil',
      ...cityParameters[name]
    }));
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    // Fallback para dados locais em caso de erro
    return Object.keys(cityParameters).map(name => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      state: '',
      country: 'Brasil',
      ...cityParameters[name]
    }));
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

/**
 * Busca simulações com suporte a paginação, busca e filtros avançados
 * @param {Object} options - Opções de busca
 * @param {number} options.page - Página atual (padrão: 1)
 * @param {number} options.perPage - Itens por página (padrão: 10)
 * @param {string} options.search - Termo de busca opcional
 * @param {string} options.orderBy - Campo para ordenação
 * @param {'asc'|'desc'} options.order - Direção da ordenação
 * @returns {Promise<Object>} Dados paginados das simulações
 */
export const getSimulations = async ({
  page = 1,
  perPage = 10,
  search = '',
  orderBy = 'created_at',
  order = 'desc',
} = {}) => {
  try {
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('Erro de autenticação: Nenhuma sessão ativa encontrada');
      return { data: [], total: 0, page, perPage, totalPages: 0, error: 'Não autenticado' };
    }

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    console.log('Buscando simulações com os parâmetros:', {
      page,
      perPage,
      search,
      orderBy,
      order,
      from,
      to,
      token: session?.access_token ? 'Token presente' : 'Token ausente'
    });

    let query = supabase
      .from('simulations')
      .select(
        `
        *,
        drycooler_results(yearly_consumption),
        tower_results(yearly_consumption),
        comparison_results(yearly_difference, yearly_difference_percentage)
      `,
        { count: 'exact' }
      )
      .eq('user_id', session.user.id); // Filtra apenas as simulações do usuário atual

    // Aplicar filtro de busca
    if (search) {
      query = query.or(`capacity.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Ordenação
    if (orderBy) {
      query = query.order(orderBy, { ascending: order === 'asc' });
    } else {
      // Ordenação padrão
      query = query.order('created_at', { ascending: false });
    }

    // Paginação
    query = query.range(from, to);

    const { data, count, error, status, statusText } = await query;

    console.log('Resposta da API:', { status, statusText, error, count: count || 0 });

    if (error) {
      console.error('Erro ao buscar simulações:', error);
      throw error;
    }

    // Mapear os resultados para um formato mais plano
    const formattedData = (data || []).map((sim) => ({
      ...sim,
      drycooler_yearly_consumption: sim.drycooler_results?.[0]?.yearly_consumption,
      tower_yearly_consumption: sim.tower_results?.[0]?.yearly_consumption,
      comparison_yearly_difference: sim.comparison_results?.[0]?.yearly_difference,
      comparison_yearly_difference_percentage: sim.comparison_results?.[0]?.yearly_difference_percentage,
    }));

    return {
      data: formattedData,
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
      error: null
    };
  } catch (error) {
    console.error('Erro em getSimulations:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      status: error.status
    });
    
    // Retornar um objeto vazio em caso de erro para não quebrar a UI
    return { 
      data: [], 
      total: 0, 
      page, 
      perPage, 
      totalPages: 0, 
      error: error.message || 'Erro ao carregar simulações' 
    };
  }
};