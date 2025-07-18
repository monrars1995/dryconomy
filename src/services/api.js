import axios from 'axios';
import { supabase } from './authService';

// Configuração do cliente para uso com Supabase Functions
const apiClient = axios.create({
  baseURL: '/functions/v1', // Usando o proxy configurado no Vite
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
    'apikey': `${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
  },
  withCredentials: true
});

// Interceptor para logs e tratamento de erro global
apiClient.interceptors.request.use(config => {
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error);
  }
);

export const getCities = async () => {
  try {
    // Buscar dados diretamente da tabela cities
    const { data, error } = await supabase
      .from('cities') 
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cidades:', error);
      throw new Error(`Erro ao buscar cidades: ${error.message || error}`);
    }
    
    if (!data || data.length === 0) {
      console.warn('Nenhuma cidade encontrada no banco de dados');
      // Fornecer alguns dados simulados para desenvolvimento, já que não há dados no banco
      console.info('Utilizando dados simulados para cidades');
      const mockCities = [
        { id: '20af6908-5e09-4d84-88b0-35da3f39090f', name: 'Brasília', state: 'DF', country: 'Brasil', water_consumption_year: 900000, water_consumption_year_conventional: 1200000, average_temperature: 22 },
        { id: '31bf7a19-6e10-5e95-99c1-46eb4f49091g', name: 'São Paulo', state: 'SP', country: 'Brasil', water_consumption_year: 850000, water_consumption_year_conventional: 1100000, average_temperature: 20 },
        { id: '42cg8b29-7f11-6f06-00d2-57fc5f50092h', name: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', water_consumption_year: 950000, water_consumption_year_conventional: 1300000, average_temperature: 25 }
      ];
      return { data: mockCities };
    }
    
    console.log(`${data.length} cidades carregadas do banco Supabase`);
    return { data };
  } catch (error) {
    console.error('Erro fatal ao buscar cidades:', error);
    // Fornecer dados simulados para desenvolvimento em caso de erro
    console.info('Utilizando dados simulados para cidades devido a erro');
    const mockCities = [
      { id: '20af6908-5e09-4d84-88b0-35da3f39090f', name: 'Brasília', state: 'DF', country: 'Brasil', water_consumption_year: 900000, water_consumption_year_conventional: 1200000, average_temperature: 22 },
      { id: '31bf7a19-6e10-5e95-99c1-46eb4f49091g', name: 'São Paulo', state: 'SP', country: 'Brasil', water_consumption_year: 850000, water_consumption_year_conventional: 1100000, average_temperature: 20 },
      { id: '42cg8b29-7f11-6f06-00d2-57fc5f50092h', name: 'Rio de Janeiro', state: 'RJ', country: 'Brasil', water_consumption_year: 950000, water_consumption_year_conventional: 1300000, average_temperature: 25 }
    ];
    return { data: mockCities };
  }
};

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