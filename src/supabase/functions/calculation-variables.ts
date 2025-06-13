import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
serve(async (req)=>{
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  // CORS headers específicos para seu domínio
  const headers = {
    'Access-Control-Allow-Origin': 'https://dryconomy.mecalor.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };
  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers
    });
  }
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get('category');
    const path = url.pathname.split('/').filter(Boolean);
    const id = path.length > 1 ? path[1] : null;
    console.log('Request:', {
      method: req.method,
      category,
      id,
      path
    });
    // GET - Listar todas as variáveis ou filtrar por categoria
    if (req.method === 'GET') {
      let query = supabaseClient.from('calculation_variables').select('*');
      if (category) {
        query = query.eq('category', category);
      }
      if (id) {
        query = query.eq('id', id).single();
      }
      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers,
        status: 200
      });
    }
    // POST - Criar nova variável
    if (req.method === 'POST') {
      const body = await req.json();
      const dataToInsert = {
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      console.log('Inserindo variável:', dataToInsert);
      const { data, error } = await supabaseClient.from('calculation_variables').insert([
        dataToInsert
      ]).select();
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers,
        status: 201
      });
    }
    // PUT - Atualizar variável existente
    if (req.method === 'PUT' && id) {
      const body = await req.json();
      const { data, error } = await supabaseClient.from('calculation_variables').update({
        ...body,
        updated_at: new Date().toISOString()
      }).eq('id', id).select();
      if (error) throw error;
      return new Response(JSON.stringify(data[0]), {
        headers,
        status: 200
      });
    }
    // DELETE - Remover variável
    if (req.method === 'DELETE' && id) {
      const { error } = await supabaseClient.from('calculation_variables').delete().eq('id', id);
      if (error) throw error;
      return new Response(JSON.stringify({
        message: 'Variável removida com sucesso'
      }), {
        headers,
        status: 200
      });
    }
    return new Response(JSON.stringify({
      error: 'Método não suportado ou rota inválida'
    }), {
      headers,
      status: 405
    });
  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers,
      status: 400
    });
  }
});
