import { supabase } from './authService';

/**
 * Busca a lista de cidades com paginação e filtro opcional
 * @param {number} page - Página atual (começando em 0)
 * @param {number} pageSize - Número de itens por página
 * @param {string} searchTerm - Termo para filtrar pelo nome da cidade
 * @returns {Promise<{data: Array, count: number, error: Object}>}
 */
export const fetchCities = async (page = 0, pageSize = 10, searchTerm = '') => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('cities')
      .select('*', { count: 'exact' });

    // Aplicar filtro de busca se fornecido
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`);
    }

    // Ordenar por nome da cidade
    query = query.order('name', { ascending: true });

    // Aplicar paginação
    query = query.range(from, to);

    const { data, count, error } = await query;

    return { data, count, error };
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return { data: [], count: 0, error };
  }
};

/**
 * Busca uma cidade específica pelo ID
 * @param {string} cityId - ID da cidade a ser buscada
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const getCityById = async (cityId) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', cityId)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Erro ao buscar cidade por ID:', error);
    return { data: null, error };
  }
};

/**
 * Adiciona uma nova cidade
 * @param {Object} cityData - Dados da cidade a ser adicionada
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const addCity = async (cityData) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .insert([cityData])
      .select();

    return { data: data?.[0], error };
  } catch (error) {
    console.error('Erro ao adicionar cidade:', error);
    return { data: null, error };
  }
};

/**
 * Atualiza os dados de uma cidade existente
 * @param {string} cityId - ID da cidade a ser atualizada
 * @param {Object} cityData - Novos dados da cidade
 * @returns {Promise<{data: Object, error: Object}>}
 */
export const updateCity = async (cityId, cityData) => {
  try {
    // Adiciona o timestamp de atualização
    const updatedData = {
      ...cityData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('cities')
      .update(updatedData)
      .eq('id', cityId)
      .select();

    return { data: data?.[0], error };
  } catch (error) {
    console.error('Erro ao atualizar cidade:', error);
    return { data: null, error };
  }
};

/**
 * Remove uma cidade pelo ID
 * @param {string} cityId - ID da cidade a ser removida
 * @returns {Promise<{error: Object}>}
 */
export const deleteCity = async (cityId) => {
  try {
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', cityId);

    return { error };
  } catch (error) {
    console.error('Erro ao remover cidade:', error);
    return { error };
  }
};

/**
 * Busca todas as cidades disponíveis
 * @returns {Promise<Array>} Lista de cidades
 */
export const getAllCities = async () => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar todas as cidades:', error);
    return [];
  }
};