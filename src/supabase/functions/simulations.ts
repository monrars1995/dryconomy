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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    // POST - Salvar simulação
    if (req.method === 'POST') {
      const simulationData = await req.json();
      console.log('Recebendo dados de simulação:', JSON.stringify(simulationData));
      // Formata os dados no formato esperado pelo banco
      const dataToInsert = {
        lead_id: simulationData.lead_id || null,
        input_data: simulationData.inputs || {},
        results_data: simulationData.results || {},
        user_data: simulationData.userData || {},
        created_at: new Date().toISOString()
      };
      console.log('Inserindo simulação:', dataToInsert);
      const { data, error } = await supabaseClient.from('simulations').insert([
        dataToInsert
      ]).select();
      if (error) throw error;
      return new Response(JSON.stringify({
        id: data[0].id,
        message: 'Simulação salva com sucesso'
      }), {
        headers,
        status: 201
      });
    }
    // GET - Listar simulações 
    if (req.method === 'GET') {
      const { data, error } = await supabaseClient.from('simulations').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers,
        status: 200
      });
    }
    return new Response(JSON.stringify({
      error: 'Método não suportado'
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
