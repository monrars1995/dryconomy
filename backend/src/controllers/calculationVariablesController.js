import { supabase } from '../config/supabase.js';

export const getVariables = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .select('*')
      .order('category')
      .order('name');

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar variáveis:', error);
    return res.status(500).json({ error: 'Erro ao buscar variáveis de cálculo' });
  }
};

export const updateVariable = async (req, res) => {
  const { id } = req.params;
  const { value, updated_by } = req.body;

  if (value === undefined || !updated_by) {
    return res.status(400).json({ error: 'Valor e ID do usuário são obrigatórios' });
  }

  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .update({
        value,
        updated_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Variável não encontrada' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar variável:', error);
    return res.status(500).json({ error: 'Erro ao atualizar variável de cálculo' });
  }
};

export const createVariable = async (req, res) => {
  const { name, description, value, unit, category, created_by } = req.body;

  if (!name || value === undefined || !unit || !category || !created_by) {
    return res.status(400).json({ 
      error: 'Nome, valor, unidade, categoria e ID do criador são obrigatórios' 
    });
  }

  try {
    const { data, error } = await supabase
      .from('calculation_variables')
      .insert([
        {
          name,
          description,
          value,
          unit,
          category,
          created_by,
          updated_by: created_by
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar variável:', error);
    return res.status(500).json({ error: 'Erro ao criar variável de cálculo' });
  }
};

export const deleteVariable = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('calculation_variables')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir variável:', error);
    return res.status(500).json({ error: 'Erro ao excluir variável de cálculo' });
  }
};
