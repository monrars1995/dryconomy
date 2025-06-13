import { supabase } from './authService';

/**
 * Busca todas as variáveis de cálculo
 * @returns {Promise<Array>} Lista de variáveis de cálculo
 */
export const getCalculationVariables = async () => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .select('*')
      .order('category')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar variáveis de cálculo:', error);
    throw error;
  }
};

/**
 * Atualiza uma variável de cálculo
 * @param {string} id - ID da variável
 * @param {Object} updates - Campos para atualizar
 * @param {string} userId - ID do usuário que está realizando a atualização
 * @returns {Promise<Object>} Variável atualizada
 */
export const updateCalculationVariable = async (id, updates, userId) => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .update({
        ...updates,
        updated_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar variável de cálculo:', error);
    throw error;
  }
};

/**
 * Cria uma nova variável de cálculo
 * @param {Object} variableData - Dados da nova variável
 * @param {string} userId - ID do usuário que está criando
 * @returns {Promise<Object>} Nova variável criada
 */
export const createCalculationVariable = async (variableData, userId) => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .insert([
        {
          ...variableData,
          created_by: userId,
          updated_by: userId
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao criar variável de cálculo:', error);
    throw error;
  }
};

/**
 * Remove uma variável de cálculo
 * @param {string} id - ID da variável a ser removida
 * @returns {Promise<void>}
 */
export const deleteCalculationVariable = async (id) => {
  try {
    const { error } = await supabase
      .from('calculation_variables')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao excluir variável de cálculo:', error);
    throw error;
  }
};

/**
 * Busca variáveis de cálculo por categoria
 * @param {string} category - Categoria para filtrar
 * @returns {Promise<Array>} Lista de variáveis da categoria
 */
export const getVariablesByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Erro ao buscar variáveis da categoria ${category}:`, error);
    throw error;
  }
};

/**
 * Busca uma variável de cálculo por ID
 * @param {string} id - ID da variável
 * @returns {Promise<Object>} Variável encontrada
 */
export const getCalculationVariableById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Erro ao buscar variável com ID ${id}:`, error);
    throw error;
  }
};
