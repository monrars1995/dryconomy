import { supabase } from '../config/supabase.js';
import axios from 'axios';

export const getWebhookConfigs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar configurações de webhook:', error);
    return res.status(500).json({ error: 'Erro ao buscar configurações de webhook' });
  }
};

export const createWebhookConfig = async (req, res) => {
  const { name, url, events, headers = {}, is_active = true } = req.body;
  const userId = req.user.id;

  if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
    return res.status(400).json({
      error: 'Nome, URL e eventos são obrigatórios e eventos deve ser um array não vazio'
    });
  }

  try {
    const { data, error } = await supabase
      .from('webhook_configs')
      .insert([
        {
          name,
          url,
          events,
          headers,
          is_active,
          created_by: userId,
          updated_by: userId
        }
      ])
      .select();

    if (error) throw error;

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Erro ao criar configuração de webhook:', error);
    return res.status(500).json({ error: 'Erro ao criar configuração de webhook' });
  }
};

export const updateWebhookConfig = async (req, res) => {
  const { id } = req.params;
  const { name, url, events, headers, is_active } = req.body;
  const userId = req.user.id;

  const updates = {
    updated_by: userId,
    updated_at: new Date().toISOString()
  };

  if (name) updates.name = name;
  if (url) updates.url = url;
  if (events) updates.events = events;
  if (headers) updates.headers = headers;
  if (is_active !== undefined) updates.is_active = is_active;

  try {
    const { data, error } = await supabase
      .from('webhook_configs')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Configuração de webhook não encontrada' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Erro ao atualizar configuração de webhook:', error);
    return res.status(500).json({ error: 'Erro ao atualizar configuração de webhook' });
  }
};

export const deleteWebhookConfig = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('webhook_configs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir configuração de webhook:', error);
    return res.status(500).json({ error: 'Erro ao excluir configuração de webhook' });
  }
};

export const testWebhook = async (req, res) => {
  const { id } = req.params;

  try {
    // Obter a configuração do webhook
    const { data: webhook, error: fetchError } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!webhook) {
      return res.status(404).json({ error: 'Configuração de webhook não encontrada' });
    }

    // Dados de teste
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'Este é um teste de webhook',
      config: {
        id: webhook.id,
        name: webhook.name
      }
    };

    // Enviar requisição para o webhook
    const response = await axios({
      method: 'POST',
      url: webhook.url,
      data: testPayload,
      headers: {
        'Content-Type': 'application/json',
        ...(webhook.headers || {})
      },
      timeout: 10000 // 10 segundos de timeout
    });

    // Registrar o teste
    await supabase
      .from('webhook_logs')
      .insert([
        {
          webhook_id: webhook.id,
          event_type: 'test',
          payload: testPayload,
          response_status: response.status,
          response_body: response.data || {},
          error_message: null
        }
      ]);

    return res.status(200).json({
      success: true,
      status: response.status,
      data: response.data
    });
  } catch (error) {
    console.error('Erro ao testar webhook:', error);

    // Registrar o erro
    if (id) {
      await supabase
        .from('webhook_logs')
        .insert([
          {
            webhook_id: id,
            event_type: 'test',
            payload: {},
            response_status: error.response?.status || 500,
            response_body: error.response?.data || {},
            error_message: error.message
          }
        ]);
    }

    return res.status(500).json({
      error: 'Erro ao testar webhook',
      details: error.message,
      response: error.response?.data
    });
  }
};
