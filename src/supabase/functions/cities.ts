import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Inicia o servidor
serve(async (req)=>{
  // Cria um cliente Supabase usando as variáveis de ambiente
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  // Cabeçalhos CORS específicos para seu domínio
  const headers = {
    'Access-Control-Allow-Origin': 'https://dryconomy.mecalor.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };
  // Lida com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers
    });
  }
  try {
    console.log('Buscando cidades...');
    // Busca cidades do banco de dados
    const { data, error } = await supabaseClient.from('cities').select('*').order('name');
    if (error) throw error;
    console.log(`Encontradas ${data?.length ?? 0} cidades`);
    // Retorna as cidades em formato JSON
    return new Response(JSON.stringify(data), {
      headers,
      status: 200
    });
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    // Retorna erro em formato JSON
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers,
      status: 400
    });
  }
});
