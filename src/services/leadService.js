import { supabase } from './authService';

/**
 * Busca leads com suporte a paginação, busca e filtros avançados
 * @param {Object} options - Opções de busca
 * @param {number} options.page - Página atual (padrão: 1)
 * @param {number} options.perPage - Itens por página (padrão: 10)
 * @param {string} options.search - Termo de busca opcional
 * @param {string} options.status - Filtrar por status
 * @param {string} options.orderBy - Campo para ordenação
 * @param {'asc'|'desc'} options.order - Direção da ordenação
 * @param {Date} options.startDate - Data inicial para filtro
 * @param {Date} options.endDate - Data final para filtro
 * @returns {Promise<Object>} Dados paginados dos leads
 */
export const getLeads = async ({
  page = 1,
  perPage = 10,
  search = '',
  status = '',
  orderBy = 'created_at',
  order = 'desc',
  startDate,
  endDate
} = {}) => {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Aplicar filtro de busca
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    // Filtrar por status
    if (status) {
      query = query.eq('status', status);
    }

    // Filtrar por data
    if (startDate) {
      query = query.gte('created_at', startDate.toISOString());
    }
    if (endDate) {
      // Ajusta para o final do dia
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endOfDay.toISOString());
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

    return {
      data: data || [],
      total: count || 0,
      page,
      perPage,
      totalPages: Math.ceil((count || 0) / perPage)
    };
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    throw error;
  }
};

/**
 * Busca simulações de um lead específico
 * @param {string} leadId - ID do lead
 * @returns {Promise<Array>} Lista de simulações do lead
 */
export const getLeadSimulations = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar simulações do lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Cria um novo lead
 * @param {Object} leadData - Dados do lead
 * @returns {Promise<Object>} Lead criado
 */
export const createLead = async (leadData) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    throw error;
  }
};

/**
 * Remove um lead e suas simulações
 * @param {string} leadId - ID do lead a ser removido
 * @returns {Promise<void>}
 */
export const deleteLead = async (leadId) => {
  try {
    // Excluir simulações primeiro
    const { error: simError } = await supabase
      .from('simulations')
      .delete()
      .eq('lead_id', leadId);

    if (simError) throw simError;

    // Agora excluir o lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (error) throw error;
  } catch (error) {
    console.error(`Erro ao excluir lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Busca um lead por ID
 * @param {string} leadId - ID do lead
 * @returns {Promise<Object>} Lead encontrado
 */
export const getLeadById = async (leadId) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao buscar lead ${leadId}:`, error);
    throw error;
  }
};

/**
 * Atualiza um lead existente
 * @param {string} leadId - ID do lead a ser atualizado
 * @param {Object} updates - Campos para atualizar
 * @returns {Promise<Object>} Lead atualizado
 */
export const updateLead = async (leadId, updates) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', leadId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao atualizar lead ${leadId}:`, error);
    throw error;
  }
};
