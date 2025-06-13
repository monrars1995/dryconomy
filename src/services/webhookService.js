/**
 * Serviço para gerenciamento de webhooks
 * Implementa funções para criar, atualizar, excluir e testar webhooks
 */

import { supabase } from './authService';

/**
 * Busca configurações de webhook com opções de filtragem e paginação
 * @param {Object} options - Opções de filtragem e paginação
 * @param {number} options.page - Número da página
 * @param {number} options.pageSize - Tamanho da página
 * @param {string} options.eventType - Tipo de evento para filtrar
 * @returns {Promise<Object>} - Dados e erro, se houver
 */
export const getWebhookConfigs = async (options = {}) => {
  const {
    page = 1,
    pageSize = 10,
    eventType = null
  } = options;

  try {
    let query = supabase
      .from('webhook_configs')
      .select('*', { count: 'exact' });

    // Aplicar filtro por tipo de evento se especificado
    // Usar contains para consultar o array de eventos
    if (eventType) {
      query = query.contains('events', [eventType]);
    }

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    query = query
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + pageSize - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Converter os dados do formato do backend para o formato do frontend
    const formattedData = data.map(config => formatWebhookConfigFromBackend(config));

    return {
      data: formattedData,
      totalCount: count,
      page,
      pageSize,
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar configurações de webhook:', error);
    return {
      data: [],
      totalCount: 0,
      page,
      pageSize,
      error
    };
  }
};

/**
 * Busca logs de webhook por ID da configuração
 * @param {string} configId - ID da configuração de webhook
 * @param {Object} options - Opções de paginação
 * @param {number} options.page - Número da página (começando em 1)
 * @param {number} options.perPage - Número de registros por página
 * @returns {Promise<Object>} - Dados, total e erro, se houver
 */
export const getWebhookLogs = async (configId, options = {}) => {
  const {
    page = 1,
    perPage = 10
  } = options;

  try {
    if (!configId) {
      throw new Error('ID da configuração é obrigatório');
    }

    // Calcular o range para a paginação
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage - 1;

    // Buscar os logs com paginação
    const { data, error, count } = await supabase
      .from('webhook_logs')
      .select('*', { count: 'exact' })
      .eq('config_id', configId)
      .order('created_at', { ascending: false })
      .range(startIndex, endIndex);

    if (error) throw error;

    return {
      data,
      total: count,
      page: page - 1, // Ajustar para base zero (usado pelo TablePagination do MUI)
      error: null
    };
  } catch (error) {
    console.error('Erro ao buscar logs de webhook:', error);
    return {
      data: [],
      total: 0,
      page: page - 1,
      error
    };
  }
};

/**
 * Cria uma nova configuração de webhook
 * @param {Object} config - Configuração do webhook
 * @returns {Promise<Object>} - Dados e erro, se houver
 */
export const createWebhookConfig = async (config) => {
  try {
    // Converter do formato do frontend para o formato do backend
    const backendConfig = formatWebhookConfigToBackend(config);

    const { data, error } = await supabase
      .from('webhook_configs')
      .insert([backendConfig])
      .select();

    if (error) throw error;

    // Converter de volta para o formato do frontend
    const formattedData = data[0] ? formatWebhookConfigFromBackend(data[0]) : null;

    return { data: formattedData, error: null };
  } catch (error) {
    console.error('Erro ao criar configuração de webhook:', error);
    return { data: null, error };
  }
};

/**
 * Atualiza uma configuração de webhook existente
 * @param {string} id - ID da configuração
 * @param {Object} config - Novos dados da configuração
 * @returns {Promise<Object>} - Dados e erro, se houver
 */
export const updateWebhookConfig = async (id, config) => {
  try {
    // Converter do formato do frontend para o formato do backend
    const backendConfig = formatWebhookConfigToBackend(config);

    const { data, error } = await supabase
      .from('webhook_configs')
      .update(backendConfig)
      .eq('id', id)
      .select();

    if (error) throw error;

    // Converter de volta para o formato do frontend
    const formattedData = data[0] ? formatWebhookConfigFromBackend(data[0]) : null;

    return { data: formattedData, error: null };
  } catch (error) {
    console.error('Erro ao atualizar configuração de webhook:', error);
    return { data: null, error };
  }
};

/**
 * Exclui uma configuração de webhook
 * @param {string} id - ID da configuração
 * @returns {Promise<Object>} - Resultado e erro, se houver
 */
export const deleteWebhookConfig = async (id) => {
  try {
    const { error } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Erro ao excluir configuração de webhook:', error);
    return { success: false, error };
  }
};

/**
 * Testa um webhook enviando uma requisição simulada
 * @param {string} id - ID da configuração
 * @returns {Promise<Object>} - Resultado e erro, se houver
 */
export const testWebhook = async (id) => {
  try {
    // Buscar a configuração do webhook
    const { data: config, error: configError } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (configError) throw configError;

    // No ambiente de desenvolvimento, apenas simular o teste
    // Em produção, isso deveria fazer uma chamada real ao endpoint
    
    // Simular sucesso da chamada
    const testResult = {
      success: true,
      statusCode: 200,
      responseTime: Math.floor(Math.random() * 500) + 100, // Entre 100 e 600ms
      responseBody: JSON.stringify({ status: 'success', message: 'Test webhook received' }),
      timestamp: new Date().toISOString()
    };

    // Registrar o teste no log
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert([{
        config_id: id,
        event_type: config.events && config.events.length > 0 ? config.events[0] : 'test',
        request_url: config.url,
        request_method: config.method || 'POST',
        request_headers: config.headers || {},
        request_body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
        response_status: testResult.statusCode,
        response_body: testResult.responseBody,
        response_time: testResult.responseTime,
        success: testResult.success
      }]);

    if (logError) throw logError;

    return { data: testResult, error: null };
  } catch (error) {
    console.error('Erro ao testar webhook:', error);
    return { data: null, error };
  }
};

/**
 * Funções auxiliares para conversão de formato entre frontend e backend
 */

/**
 * Converte do formato do backend para o formato do frontend
 */
export const formatWebhookConfigFromBackend = (config) => {
  if (!config) return null;

  return {
    id: config.id,
    name: config.name || '',
    description: config.description || '',
    url: config.url || '',
    method: config.method || 'POST',
    events: config.events || [], // Manter como array do banco de dados
    headers: config.headers || {},
    is_active: config.is_active !== false, // Usar is_active do banco
    retryCount: config.retry_count || 0,
    createdAt: config.created_at || new Date().toISOString(),
    updatedAt: config.updated_at || new Date().toISOString()
  };
};

/**
 * Converte do formato do frontend para o formato do backend
 */
export const formatWebhookConfigToBackend = (config) => {
  if (!config) return null;

  return {
    name: config.name || '',
    description: config.description || '',
    url: config.url || '',
    method: config.method || 'POST',
    events: config.events || [], // Manter como array para o banco
    headers: config.headers || {},
    is_active: config.is_active !== false, // Usar is_active para o banco
    retry_count: config.retryCount || 0
  };
};