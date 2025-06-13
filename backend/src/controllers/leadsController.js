import { supabase } from '../config/supabase.js';

export const getLeads = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Aplicar filtro de busca se fornecido
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`
      );
    }

    // Ordenar por data de criação (mais recentes primeiro)
    query = query.order('created_at', { ascending: false });

    // Paginação
    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return res.status(200).json({
      data,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar leads:', error);
    return res.status(500).json({ error: 'Erro ao buscar leads' });
  }
};

export const getLeadSimulations = async (req, res) => {
  const { leadId } = req.params;

  try {
    const { data, error } = await supabase
      .from('simulations')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar simulações do lead:', error);
    return res.status(500).json({ error: 'Erro ao buscar simulações do lead' });
  }
};

export const createLead = async (req, res) => {
  const { name, email, phone, company, state } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });
  }

  try {
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          company: company || null,
          state: state || null
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar lead:', error);
    return res.status(500).json({ error: 'Erro ao criar lead' });
  }
};

export const deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    // Excluir simulações relacionadas primeiro
    const { error: simError } = await supabase
      .from('simulations')
      .delete()
      .eq('lead_id', id);

    if (simError) throw simError;

    // Agora excluir o lead
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir lead:', error);
    return res.status(500).json({ error: 'Erro ao excluir lead' });
  }
};
