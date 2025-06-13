// src/functions/_shared/cors.ts
export const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://localhost:9001',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };