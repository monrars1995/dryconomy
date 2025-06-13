import axios from 'axios';

// Configuração do cliente para uso com Supabase Functions
const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`,
  headers: {
    'Content-Type': 'application/json',
    // Adicionamos o token de autorização do Supabase para todas as requisições
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'apikey': `${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  }
});

// Interceptor para logs e tratamento de erro global
apiClient.interceptors.request.use(config => {
  console.log(`[API] Requisição para: ${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

export const getCities = () => apiClient.get('/cities');

export const getCalculationVariables = (category) => {
  if (category) {
    return apiClient.get(`/calculation-variables?category=${category}`);
  }
  return apiClient.get('/calculation-variables');
};

export const getCalculationVariableById = (id) => apiClient.get(`/calculation-variables/${id}`);

export const createCalculationVariable = (variableData) => apiClient.post('/calculation-variables', variableData);

export const updateCalculationVariable = (id, variableData) => apiClient.put(`/calculation-variables/${id}`, variableData);

export const deleteCalculationVariable = (id) => apiClient.delete(`/calculation-variables/${id}`);

export const saveSimulation = (data) => {
  // Ajustar o payload para o formato esperado pelo backend PHP
  const simulationPayload = {
    inputs: {
      capacity: data.capacidadeTotal, // Ajuste conforme os nomes dos campos no frontend
      location: data.cidade, // Ajuste conforme os nomes dos campos no frontend
      deltaT: data.deltaT, // Ajuste conforme os nomes dos campos no frontend
      waterFlow: data.vazaoAgua, // Ajuste conforme os nomes dos campos no frontend
    },
    results: {
      drycooler: data.resultadosDrycooler, // Ajuste conforme a estrutura de dados do frontend
      tower: data.resultadosTorre, // Ajuste conforme a estrutura de dados do frontend
      comparison: data.comparativo, // Ajuste conforme a estrutura de dados do frontend
    },
    lead_id: data.lead_id || null, // Opcional, se houver um lead associado
  };
  return apiClient.post('/simulations', simulationPayload);
};