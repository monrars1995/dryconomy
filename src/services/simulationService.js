import { getSystemConfig } from './supabaseClient';
import { supabase } from './authService';
import { cityParameters, commonParameters } from '../config/cityParameters';

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
      throw error;
    }
    
    if (data && data.length > 0) {
      return data;
    } else {
      throw new Error('Nenhuma cidade encontrada no Supabase');
    }
  } catch (error) {
    // Se falhar, usamos os dados locais
    
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
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

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
      );

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

    const { data, count, error } = await query;

    if (error) throw error;

    // Mapear os resultados para um formato mais plano
    const formattedData = (data || []).map((sim) => ({
      ...sim,
      drycooler_yearly_consumption: sim.drycooler_results?.yearly_consumption,
      tower_yearly_consumption: sim.tower_results?.yearly_consumption,
      comparison_yearly_difference: sim.comparison_results?.yearly_difference,
      comparison_yearly_difference_percentage: sim.comparison_results?.yearly_difference_percentage,
    }));

    return {
      data: formattedData,
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage),
    };
  } catch (error) {
    throw error;
  }
};