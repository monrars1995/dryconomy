import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from './services/api'; // Para chamadas ao backend via Supabase Functions
import { 
  Container, Paper, Typography, Grid, TextField, FormControl, InputLabel, 
  Select, MenuItem, Box, Card, CardContent, Switch, FormControlLabel, 
  useTheme, ThemeProvider, createTheme, Button, Fade, Stepper, 
  Step, StepLabel, MobileStepper, CircularProgress, useMediaQuery,
  IconButton, Snackbar, Alert, InputAdornment
} from '@mui/material';
import { 
  ThermostatAuto, LocationOn, KeyboardArrowLeft, 
  KeyboardArrowRight, Park, DarkMode, LightMode, Send, Home
} from '@mui/icons-material';

// Componentes SVG personalizados
const AccessTimeSVG = (props) => (
  <Box component="svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    {...props}
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
    <path d="m12.5 7-1 0 0 6 5.25 3.15.75-1.23-4.5-2.67z"/>
  </Box>
);

const WaterBottleSVG = ({ sx = {} }) => (
  <img 
    src="/images/water-bottle_10928189.svg" 
    alt="Water" 
    style={{ width: 24, height: 24, ...sx }}
  />
);

const ShowerSVG = ({ sx = {} }) => (
  <img 
    src="/images/shower_2054405.svg" 
    alt="Shower" 
    style={{ width: 24, height: 24, ...sx }}
  />
);

const PoolSVG = ({ sx = {} }) => (
  <img 
    src="/images/swimming-pool_939917.svg" 
    alt="Pool" 
    style={{ width: 24, height: 24, ...sx }}
  />
);
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import ContentSection from './components/ContentSection';
import PrivacyBanner from './components/PrivacyBanner';
import WelcomePage from './components/WelcomePage';
import UserDataForm from './components/UserDataForm';
import WaterSavingsResults from './components/WaterSavingsResults';
import ConfirmationDialog from './components/ConfirmationDialog';
import { cityParameters } from './config/cityParameters';
import { saveSimulation, getCalculationVariables, getCities, getCityByName } from './services/simulationService';

// Função de debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const App = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  
  const [inputs, setInputs] = useState({
    capacity: 500,
    selectedCityId: '', // Armazenará o ID da cidade selecionada
    deltaT: 6,
    waterFlow: 71.7,
    operatingHours: 24, // Horas de operação por dia (padrão: 24h)
    operatingDays: 7, // Dias de operação por semana (padrão: 7 dias)
    temperaturaAmbiente: 25, // Temperatura ambiente padrão (°C) - não editável pelo usuário
    vazaoAgua: 71.7, // Vazão de água padrão (L/min) - não editável pelo usuário
    custoAgua: 10.50, // Custo da água padrão (R$/m³) - não editável pelo usuário
    custoEnergia: 0.65 // Custo da energia padrão (R$/kWh) - não editável pelo usuário
  });
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    state: ''
  });
  
  // Estado para armazenar as variáveis de cálculo do Supabase
  const [calculationVars, setCalculationVars] = useState({
    preco_m3_agua: 10.50,
    tarifa_esgoto_percentual: 80.00,
    economia_media_technologia: 37.00,
    vida_util_equipamento: 10.00,
    custo_implantacao_base: 5000.00,
    custo_manutencao_anual: 200.00,
    taxa_inflacao_anual: 3.5,
    taxa_juros_anual: 6.00
  });
  
  // Estado para armazenar as cidades carregadas do Supabase
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  const [results, setResults] = useState({
    drycooler: {
      moduleCapacity: 0,
      modules: 0,
      totalCapacity: 0,
      nominalWaterFlow: 0,
      evaporationPercentage: 0,
      evaporationFlow: 0,
      consumption: {
        hourly: 0,
        daily: 0,
        monthly: 0,
        yearly: 0
      }
    },
    tower: {
      capacity: 0,
      nominalWaterFlow: 0,
      evaporationPercentage: 0,
      evaporationFlow: 0,
      consumption: {
        hourly: 0,
        daily: 0,
        monthly: 0,
        yearly: 0
      }
    },
    comparison: {
      yearlyDifference: 0,
      yearlyDifferencePercentage: 0
    }
  });

  const isXs = useMediaQuery('(max-width:600px)');
  const isSm = useMediaQuery('(max-width:960px)');
  const isMd = useMediaQuery('(max-width:1280px)');

  const steps = [
    'Bem-vindo',
    'Dados da Empresa',
    'Capacidade Térmica',
    'Localização',
    'Resultados'
  ];

  const locations = [
    'São Paulo', 'Rio de Janeiro', 'Manaus', 'Brasília',
    'Recife', 'Fortaleza', 'Florianópolis', 'Belo Horizonte',
    'Porto Alegre', 'Salvador', 'Campinas'
  ];

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [confirmationModal, setConfirmationModal] = useState({
    open: false,
    title: '',
    message: ''
  });
  

  
  // Efeito para carregar as variáveis de cálculo
  useEffect(() => {
    const loadCalculationVariables = async () => {
      try {
        // Tentativa 1: Usar Supabase Functions via API
        try {
          console.log('Tentando buscar variáveis de cálculo via Supabase Functions...');
          const response = await api.getCalculationVariables();
          const variables = response.data || [];
          console.log('Variáveis de cálculo recebidas via Functions:', variables);
          
          if (variables && Array.isArray(variables) && variables.length > 0) {
            // Formatar os dados para uso fácil em cálculos
            const formattedVars = {};
            variables.forEach(variable => {
              formattedVars[variable.name] = variable.value;
            });
            setCalculationVars(formattedVars);
            console.log('Variáveis de cálculo formatadas:', formattedVars);
          } else {
            console.warn('Nenhuma variável de cálculo encontrada via Functions, tentando cliente direto');
            throw new Error('Dados de variáveis ausentes ou inválidos');
          }
        } catch (apiError) {
          console.error('Erro ao buscar variáveis via Functions, tentando acesso direto:', apiError);
          
          // Tentativa 2: Usar acesso direto ao Supabase
          const { supabase } = await import('./services/authService');
          const { data: variables, error: supabaseError } = await supabase
            .from('calculation_variables')
            .select('*');
            
          if (supabaseError) throw supabaseError;
          
          console.log('Variáveis de cálculo recebidas via cliente direto:', variables);
          
          if (variables && Array.isArray(variables) && variables.length > 0) {
            // Formatar os dados para uso fácil em cálculos
            const formattedVars = {};
            variables.forEach(variable => {
              formattedVars[variable.name] = variable.value;
            });
            setCalculationVars(formattedVars);
            console.log('Variáveis de cálculo formatadas:', formattedVars);
          } else {
            console.warn('Nenhuma variável de cálculo encontrada, usando valores padrão');
          }
        }
      } catch (error) {
        console.error('Erro em ambas tentativas de buscar variáveis de cálculo:', error);
        console.warn('Usando valores padrão devido ao erro');
        // Mantém os valores padrão definidos no estado inicial
        // Define valores padrão explicitamente
        setCalculationVars({
          economia_media_technologia: 37,
          preco_m3_agua: 10.5,
          tarifa_esgoto_percentual: 80,
          taxa_inflacao_anual: 6,
          taxa_juros_anual: 9.5,
          custo_implantacao_base: 5000,
          custo_manutencao_anual: 200,
          vida_util_equipamento: 10
        });
      }
    };
    
    loadCalculationVariables();
  }, []);
  
  // Efeito para carregar cidades do banco de dados
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        console.log('Buscando cidades...');
        
        // Tentativa 1: Usar Supabase Functions via API
        try {
          console.log('Tentando buscar cidades via Supabase Functions...');
          const response = await api.getCities();
          const cityList = response.data || [];
          console.log(`Cidades carregadas via Functions: ${cityList.length}`, cityList);
          setCities(cityList);
          
          // Definir uma cidade padrão se houver cidades disponíveis e nenhuma cidade selecionada
          if (cityList.length > 0 && !inputs.selectedCityId) {
            const defaultCity = cityList[0];
            console.log('Definindo cidade padrão:', defaultCity.name);
            setSelectedCity(defaultCity);
            setInputs((prev) => ({ ...prev, selectedCityId: defaultCity.id }));
          }
          
          setIsLoading(false);
        } catch (error) {
          console.error('Erro ao buscar cidades via Functions, tentando cliente direto:', error);
          
          // Tentativa 2: Usar cliente Supabase direto como fallback
          console.log('Tentando buscar cidades via cliente Supabase direto...');
          const { fetchCities } = await import('./services/cityService');
          const { data: cityList } = await fetchCities(0, 100);
          
          console.log(`Cidades carregadas via cliente direto: ${cityList?.length || 0}`, cityList);
          setCities(cityList || []);
          
          // Definir uma cidade padrão se houver cidades disponíveis e nenhuma cidade selecionada
          if (cityList && cityList.length > 0 && !inputs.selectedCityId) {
            const defaultCity = cityList[0];
            console.log('Definindo cidade padrão:', defaultCity.name);
            setSelectedCity(defaultCity);
            setInputs((prev) => ({ ...prev, selectedCityId: defaultCity.id }));
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Erro em ambas tentativas de buscar cidades:', error);
        setCities([]);
        setIsLoading(false);
        // Feedback ao usuário
        setNotification({
          open: true,
          message: 'Falha ao carregar cidades. Usando valores padrão.',
          severity: 'error'
        });
      }
    };

    fetchCities();
  }, []); // Executa apenas uma vez ao montar
  
  // Efeito para sincronizar selectedCity quando selectedCityId mudar
  useEffect(() => {
    if (inputs.selectedCityId && cities.length > 0) {
      const cityById = cities.find(city => city.id === inputs.selectedCityId);
      if (cityById) {
        setSelectedCity(cityById);
        console.log('SelectedCity synchronized/updated from inputs.selectedCityId:', cityById);
      }
    }
  }, [inputs.selectedCityId, cities]);

  const handleFinishSimulation = async () => {
    try {
      setIsLoading(true);
      
      const simulationData = {
        userData,
        inputs,
        results: {
          drycooler: {
            consumption: results.drycooler.consumption,
            modules: results.drycooler.modules,
            totalCapacity: results.drycooler.totalCapacity
          },
          tower: {
            consumption: results.tower.consumption
          },
          comparison: {
            yearlyDifference: results.comparison.yearlyDifference,
            yearlyDifferencePercentage: results.comparison.yearlyDifferencePercentage
          }
        },
        timestamp: new Date().toISOString(),
        location: inputs.location,
        capacity: inputs.capacity,
        operatingHours: inputs.operatingHours,
        operatingDays: inputs.operatingDays
      };

      await api.saveSimulation(simulationData); // Modificado para usar API do backend
      
      setNotification({
        open: true,
        message: 'Simulação salva com sucesso! Em breve entraremos em contato.',
        severity: 'success'
      });
      
      // Redirecionar para o passo de solicitar orçamento
      setActiveStep(5);
    } catch (error) {
      console.error('Erro ao finalizar simulação:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar simulação. Tente novamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função auxiliar para validar os campos em cada etapa
  const validateCurrentStep = () => {
    // Step 0: Bem-vindo (sem validação)
    if (activeStep === 0) {
      return true;
    }
    
    // Step 1: Dados do usuário
    if (activeStep === 1) {
      const { name, email } = userData;
      
      // Validação básica de email usando regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailValid = emailRegex.test(email);
      
      if (!name.trim()) {
        setNotification({
          open: true,
          message: 'Por favor, informe seu nome para continuar.',
          severity: 'warning'
        });
        return false;
      }
      
      if (!email.trim() || !isEmailValid) {
        setNotification({
          open: true,
          message: 'Por favor, informe um email válido para continuar.',
          severity: 'warning'
        });
        return false;
      }
      
      // Nome e email são obrigatórios, os outros campos são opcionais
      return true;
    }
    
    // Step 1: Capacidade do sistema (capacity, operatingHours e operatingDays são obrigatórios)
    if (activeStep === 1) {
      const { capacity, operatingHours, operatingDays } = inputs;
      
      if (!capacity || capacity <= 0) {
        setNotification({
          open: true,
          message: 'Por favor, informe uma capacidade válida para o sistema.',
          severity: 'warning'
        });
        return false;
      }
      
      if (!operatingHours || operatingHours < 1 || operatingHours > 24) {
        setNotification({
          open: true,
          message: 'Por favor, informe um número válido de horas de operação (1 a 24 horas).',
          severity: 'warning'
        });
        return false;
      }
      
      if (!operatingDays || operatingDays < 1 || operatingDays > 7) {
        setNotification({
          open: true,
          message: 'Por favor, informe um número válido de dias de operação (1 a 7 dias).',
          severity: 'warning'
        });
        return false;
      }
      
      return true;
    }
    
    // Step 2: Localização (cidade é obrigatória)
    if (activeStep === 2) {
      if (!selectedCity) {
        setNotification({
          open: true,
          message: 'Por favor, selecione uma cidade.',
          severity: 'warning'
        });
        return false;
      }
      
      return true;
    }
    
    return true; // Outros steps não requerem validação específica
  };

  const handleNext = () => {
    // Validar campos antes de avançar
    if (!validateCurrentStep()) {
      return;
    }
    
    if (activeStep === steps.length - 1) {
      handleFinishSimulation();
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setActiveStep((prevStep) => prevStep + 1);
      if (activeStep >= 2) {
        calculateResults();
      }
      setIsLoading(false);
    }, 500);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Estado para armazenar os valores em edição
  const [editingValues, setEditingValues] = useState({
    capacity: '500',
    operatingHours: '24',
    operatingDays: '7'
  });

  // Atualiza o valor em edição
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    
    if (name === 'selectedCityId') {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
      // Atualizar selectedCity quando a cidade for alterada no select
      const cityData = cities.find(city => city.id === value);
      if (cityData) {
        setSelectedCity(cityData);
        console.log('Selected city updated by handleInputChange:', cityData);
      } else {
        console.warn(`City ID ${value} not found in loaded cities.`);
      }
    } else if (['capacity', 'operatingHours', 'operatingDays'].includes(name)) {
      const numericValue = value.replace(/[^0-9,.]/g, '');
      setEditingValues(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setInputs(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Atualiza o estado principal quando o campo perde o foco
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (!value) return;
    
    // Converte para número, tratando vírgula como ponto decimal
    const numValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    
    if (isNaN(numValue)) {
      // Se não for um número válido, mantém o valor anterior
      const defaultValues = { capacity: '500', operatingHours: '24', operatingDays: '7' };
      setEditingValues(prev => ({
        ...prev,
        [name]: (inputs[name] !== undefined && inputs[name] !== null) ? inputs[name].toString() : defaultValues[name]
      }));
      return;
    }
    
    // Atualiza o estado principal
    setInputs(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Sincroniza os valores de edição quando os inputs mudam externamente
  useEffect(() => {
    setEditingValues({
      capacity: (inputs.capacity !== undefined && inputs.capacity !== null) ? inputs.capacity.toString() : '500',
      operatingHours: (inputs.operatingHours !== undefined && inputs.operatingHours !== null) ? inputs.operatingHours.toString() : '24',
      operatingDays: (inputs.operatingDays !== undefined && inputs.operatingDays !== null) ? inputs.operatingDays.toString() : '7'
    });
  }, [inputs.capacity, inputs.operatingHours, inputs.operatingDays]);

  // Efeito para carregar cidades (removido duplicação de variáveis)
  useEffect(() => {
    const loadCitiesData = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
        console.log('Cidades carregadas:', citiesData?.length || 0);
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
        setNotification({
          open: true,
          message: 'Erro ao carregar dados das cidades. Por favor, tente novamente.',
          severity: 'error'
        });
      }
    };
    
    loadCitiesData();
  }, []);

  // Efeito para sincronizar selectedCity com inputs.selectedCityId ou definir um padrão
  useEffect(() => {
    if (cities && cities.length > 0) {
      if (inputs.selectedCityId) {
        const cityFromId = cities.find(c => c.id === inputs.selectedCityId);
        if (cityFromId) {
          if (!selectedCity || selectedCity.id !== cityFromId.id) {
            setSelectedCity(cityFromId);
            console.log('SelectedCity synchronized/updated from inputs.selectedCityId:', cityFromId);
          }
        } else {
          // ID selecionado não é válido, define para a primeira cidade como padrão
          setSelectedCity(cities[0]);
          setInputs(prev => ({ ...prev, selectedCityId: cities[0].id }));
          console.warn('Invalid inputs.selectedCityId, defaulted to first city:', cities[0]);
        }
      } else if (!selectedCity) {
        // Nenhum ID selecionado e nenhuma cidade selecionada, define a primeira como padrão
        setSelectedCity(cities[0]);
        setInputs(prev => ({ ...prev, selectedCityId: cities[0].id }));
        console.log('No selectedCityId, defaulted to first city:', cities[0]);
      }
    }
  }, [inputs.selectedCityId, cities, selectedCity]); // Adicionado selectedCity para evitar loops desnecessários se ele for alterado externamente e já estiver correto.

  const calculateResults = useCallback(debounce(() => {
    try {
      setIsLoading(true);
      console.log('Calculando resultados...');
      
      // Usar selectedCity como a fonte da verdade para os dados da cidade
      let currentSelectedCity = selectedCity;

      // Fallback se selectedCity estiver nulo mas um ID válido existir em inputs
      if (!currentSelectedCity && inputs.selectedCityId && cities.length > 0) {
        const cityById = cities.find(c => c.id === inputs.selectedCityId);
        if (cityById) {
          currentSelectedCity = cityById;
          setSelectedCity(cityById); // Sincroniza o estado selectedCity para consistência
          console.log('Fallback: Usando cidade encontrada pelo selectedCityId para cálculo:', cityById.name);
        }
      }
      
      if (!currentSelectedCity || !currentSelectedCity.id) { // Verifica se a cidade e seu ID são válidos
        console.warn(`Cidade com ID '${inputs.selectedCityId || 'nenhum'}' não encontrada ou inválida. Cálculo não realizado.`);
        setNotification({
          open: true,
          message: `Cidade selecionada é inválida ou não foi encontrada. Por favor, selecione uma cidade válida.`,
          severity: 'warning'
        });
        setIsLoading(false);
        setResults(initialResultsState); // Reseta os resultados para evitar mostrar dados antigos/incorretos
        return;
      }

      console.log('Usando parâmetros da cidade (currentSelectedCity):', currentSelectedCity.name);
      // Prioriza os dados do Supabase. Valores padrão são usados se algum campo específico estiver faltando.
      const cityDataFromSupabase = {
        water_consumption_year: currentSelectedCity.water_consumption_year,
        water_consumption_year_conventional: currentSelectedCity.water_consumption_year_conventional,
        average_temperature: currentSelectedCity.average_temperature,
        water_flow: currentSelectedCity.water_flow, 
        makeup_water_fan_logic: currentSelectedCity.makeup_water_fan_logic,
        water_consumption_fan_logic: currentSelectedCity.water_consumption_fan_logic,
        // Adicione outros campos relevantes do Supabase aqui, se houver
      };

      // Parâmetros para cálculo, combinando Supabase com inputs do usuário e defaults
      const cityParams = {
        waterConsumptionYear: cityDataFromSupabase.water_consumption_year || 950000,
        waterConsumptionYearConventional: cityDataFromSupabase.water_consumption_year_conventional || 2500000,
        averageTemperature: cityDataFromSupabase.average_temperature || 25,
        waterFlow: cityDataFromSupabase.water_flow || 71.7, // Vazão de água da cidade do Supabase
        makeupWaterFanLogic: cityDataFromSupabase.makeup_water_fan_logic || 3, 
        waterConsumptionFanLogic: cityDataFromSupabase.water_consumption_fan_logic || 1.90,
        // Manter os inputs do usuário para os demais campos, com defaults
        deltaT: parseFloat(inputs.deltaT) || 6,
        operatingHours: parseInt(inputs.operatingHours) || 24,
        operatingDays: parseInt(inputs.operatingDays) || 7,
        temperaturaAmbiente: cityDataFromSupabase.average_temperature || parseFloat(inputs.temperaturaAmbiente) || 25,
        custoAgua: parseFloat(inputs.custoAgua) || 10,
        custoEnergia: parseFloat(inputs.custoEnergia) || 0.6,
        // O 'capacity' para os cálculos internos do módulo vem do cityParameters estático como fallback, 
        // ou idealmente deveria vir do Supabase se for específico por cidade/módulo.
        // Por ora, usaremos um default. Idealmente, isso viria de currentSelectedCity.module_capacity ou algo similar.
        moduleCapacity: currentSelectedCity.module_capacity || 500, // Assumindo que a cidade pode ter uma capacidade de módulo padrão
      };
      
      // A capacidade total do sistema é definida pelo usuário
      const capacity = parseInt(inputs.capacity) || 0;

      // Atualiza o estado de inputs com a vazão da cidade, para consistência da UI
      if (inputs.waterFlow !== cityParams.waterFlow) {
        setInputs(prev => ({ ...prev, waterFlow: cityParams.waterFlow }));
      }

      // Cálculos para o DryCooler
      // A capacidade do módulo (cityParams.moduleCapacity) é usada para determinar quantos módulos são necessários.
      const capacityRatio = capacity / cityParams.moduleCapacity; 
      const economiaPorcentagem = (calculationVars?.economia_media_technologia || 37) / 100;
      const precoM3Agua = calculationVars?.preco_m3_agua || 10.5;
      const percentualEsgoto = (calculationVars?.tarifa_esgoto_percentual || 80) / 100;
      
      // Fator de operação baseado em horas e dias
      const operatingHours = cityParams.operatingHours;
      const operatingDays = cityParams.operatingDays;
      const operatingFactor = (operatingHours / 24) * (operatingDays / 7);
      
      // Cálculos para o DryCooler
      const drycooler = {
        capacityRatio, 
        moduleCapacity: cityParams.moduleCapacity,
        modules: Math.ceil(capacityRatio),
        totalCapacity: Math.ceil(capacityRatio) * cityParams.moduleCapacity,
        nominalWaterFlow: cityParams.waterFlow * capacityRatio, // waterFlow da cidade * proporção da capacidade total
        evaporationPercentage: cityParams.makeupWaterFanLogic,
        evaporationFlow: (cityParams.waterFlow * capacityRatio * cityParams.makeupWaterFanLogic) / 100,
        consumption: {
          // waterConsumptionYearFan agora deve ser cityParams.waterConsumptionYear (que vem do Supabase)
          yearly: (cityParams.waterConsumptionYear * capacityRatio * operatingFactor), // Já deve estar em litros ou m³ conforme Supabase

          monthly: (cityParams.waterConsumptionYearFan * capacityRatio * operatingFactor * 1000) / 12,
          daily: (cityParams.waterConsumptionYearFan * capacityRatio * operatingFactor * 1000) / 365,
          hourly: (cityParams.waterConsumptionYearFan * capacityRatio * operatingFactor * 1000) / 8760
        },
        custoAnual: 0 // Será calculado abaixo
      };

      // Verificar se os valores de consumo são válidos
      if (isNaN(drycooler.consumption.yearly) || !isFinite(drycooler.consumption.yearly)) {
        drycooler.consumption.yearly = 0;
      }
      
      // Calculamos o custo anual do DryCooler
      drycooler.custoAnual = (drycooler.consumption.yearly / 1000) * precoM3Agua * (1 + percentualEsgoto);

      // Cálculos para a Torre de Resfriamento (convertido para milhões de litros)
      const tower = {
        capacity: capacity,
        nominalWaterFlow: cityParams.waterFlow * capacityRatio,
        evaporationPercentage: cityParams.makeupWaterFanLogic,
        evaporationFlow: (cityParams.waterFlow * capacityRatio * cityParams.makeupWaterFanLogic) / 100,
        consumption: {
          yearly: (cityParams.waterConsumptionYearConventional * capacityRatio * operatingFactor) * 1000, // Convertendo m³ para litros
          monthly: (cityParams.waterConsumptionYearConventional * capacityRatio * operatingFactor * 1000) / 12,
          daily: (cityParams.waterConsumptionYearConventional * capacityRatio * operatingFactor * 1000) / 365,
          hourly: (cityParams.waterConsumptionYearConventional * capacityRatio * operatingFactor * 1000) / 8760
        },
        custoAnual: 0 // Será calculado abaixo
      };
        
      // Calculamos o custo anual da torre
      tower.custoAnual = (tower.consumption.yearly / 1000) * precoM3Agua * (1 + percentualEsgoto);

      // Cálculos comparativos
      const yearlyDifference = tower.consumption.yearly - drycooler.consumption.yearly;
      let yearlyDifferencePercentage = tower.consumption.yearly > 0 ?
        (yearlyDifference / tower.consumption.yearly) * 100 : 0;
        
      // Garantir que o percentual seja válido
      if (isNaN(yearlyDifferencePercentage) || !isFinite(yearlyDifferencePercentage)) {
        yearlyDifferencePercentage = 0;
      }
      
      // Cálculos financeiros
      const economiaAnual = tower.custoAnual - drycooler.custoAnual;
      
      // Uso de valores do banco de dados ou padrões para cálculos financeiros
      const custoImplantacaoBase = parseFloat(calculationVars?.custo_implantacao_base) || 5000;
      const custoManutencao = parseFloat(calculationVars?.custo_manutencao_anual) || 200;
      const vidaUtil = parseFloat(calculationVars?.vida_util_equipamento) || 10;
      
      console.log('Valores financeiros utilizados:', {
        custoImplantacaoBase,
        custoManutencao,
        vidaUtil,
        calculationVars
      });
      
      // Cálculo dos custos com proteção contra valores inválidos
      const modulosValidos = isNaN(drycooler.modules) || drycooler.modules <= 0 ? 1 : drycooler.modules;
      const custoImplantacao = custoImplantacaoBase * modulosValidos;
      const custoManutencaoAnual = custoManutencao * modulosValidos;
      
      // Cálculo do tempo de retorno de investimento
      let tempoRetornoInvestimento = 0;
      const economiaLiquida = economiaAnual - custoManutencaoAnual;
      if (economiaLiquida > 0) {
        tempoRetornoInvestimento = custoImplantacao / economiaLiquida;
      } else {
        // Se não há economia líquida positiva, definir um valor alto para o tempo de retorno
        tempoRetornoInvestimento = vidaUtil * 2; // Valor arbitrário alto
      }
      
      // ROI - Retorno sobre o investimento ao longo da vida útil
      let economiaTotal = economiaLiquida * vidaUtil;
      
      // Calcular ROI com proteção contra divisão por zero
      let roi = 0;
      if (custoImplantacao > 0) {
        roi = (economiaTotal / custoImplantacao) * 100;
      }
      
      // Garantir que todos os valores financeiros sejam válidos
      if (isNaN(roi) || !isFinite(roi)) roi = 0;
      if (isNaN(economiaTotal) || !isFinite(economiaTotal)) economiaTotal = 0;
      if (isNaN(tempoRetornoInvestimento) || !isFinite(tempoRetornoInvestimento)) tempoRetornoInvestimento = 0;

      setResults({
        drycooler,
        tower,
        comparison: {
          yearlyDifference,
          yearlyDifferencePercentage,
          economiaAnual, 
          custoImplantacao,
          custoManutencaoAnual,
          tempoRetornoInvestimento,
          vidaUtilEquipamento: vidaUtil, // Usando a nova variável vidaUtil
          economiaTotal,
          roi
        },
        financeiro: {
          precoAgua: precoM3Agua,
          tarifaEsgoto: calculationVars?.tarifa_esgoto_percentual || 0,
          taxaInflacao: calculationVars?.taxa_inflacao_anual || 0,
          taxaJuros: calculationVars?.taxa_juros_anual || 0
        }
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      setNotification({
        open: true,
        message: 'Ocorreu um erro ao calcular os resultados. Por favor, tente novamente.',
        severity: 'error'
      });
      setIsLoading(false);
    }
  }, 500), [inputs, calculationVars, cityParameters, cities]);


  // Função auxiliar para formatar números em milhões
  const formatMillions = (value) => {
    // Verificar se o valor é válido
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return "0";
    }
    const inMillions = value / 1000000;
    return `${inMillions.toFixed(2)} milhões`;
  };

  const getConsumptionChartData = () => [
    {
      name: 'Por hora',
      Drycooler: results.drycooler.consumption.hourly,
      Torre: results.tower.consumption.hourly
    },
    {
      name: 'Por dia',
      Drycooler: results.drycooler.consumption.daily,
      Torre: results.tower.consumption.daily
    },
    {
      name: 'Por mês',
      Drycooler: results.drycooler.consumption.monthly,
      Torre: results.tower.consumption.monthly
    },
    {
      name: 'Por ano',
      Drycooler: results.drycooler.consumption.yearly,
      Torre: results.tower.consumption.yearly
    }
  ];

  // Criar tema com useMemo para otimizar performance
  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00337A',
        light: '#335A9D',
        dark: '#002357',
      },
      secondary: {
        main: '#00337A',
        light: '#335A9D',
        dark: '#002357',
      },
      success: {
        main: '#4caf50',
        light: '#81c784',
        dark: '#388e3c',
      },
      background: {
        default: darkMode ? '#121212' : '#F4F4F4',
        paper: darkMode ? '#1E1E1E' : '#FFFFFF'
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    components: {
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: '16px',
            paddingRight: '16px',
            '@media (max-width: 600px)': {
              paddingLeft: '8px',
              paddingRight: '8px',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              margin: '8px',
              borderRadius: '12px',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '@media (max-width: 600px)': {
                fontSize: '14px',
              },
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            '@media (max-width: 600px)': {
              fontSize: '14px',
              padding: '8px 16px',
            },
          },
        },
      },
    },
  }), [darkMode]);

  const handleRestart = () => {
    setActiveStep(0);
    setShowSimulator(false);
    setInputs({
      capacity: 500,
      selectedCityId: cities.find(c => c.name === 'São Paulo')?.id || '', // Tenta definir o ID de São Paulo ou vazio
      deltaT: 6,
      waterFlow: 71.7,
      operatingHours: 24,
      // Manter outros campos de inputs que não foram listados aqui
      operatingDays: inputs.operatingDays, // Preservar se já existir
      temperaturaAmbiente: inputs.temperaturaAmbiente,
      vazaoAgua: inputs.vazaoAgua,
      custoAgua: inputs.custoAgua,
      custoEnergia: inputs.custoEnergia
    });
    setUserData({
      name: '',
      email: '',
      company: '',
      phone: '',
      state: '',
    });
  };

  const renderStepContent = (step) => {
    if (!showSimulator) {
      return null;
    }
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      );
    }
    switch (step) {
      case 0:
        return <WelcomePage onStartSimulation={handleStartSimulation} darkMode={darkMode} />;
      case 1:
        return <UserDataForm userData={userData} onUserDataChange={handleUserDataChange} darkMode={darkMode} />;
      case 2:
        return (
          <Fade in={true}>
            <Box sx={{ p: isXs ? 2 : 3, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{
                color: 'primary.main',
                mb: isXs ? 2 : 4,
                fontWeight: 700,
                textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                fontSize: isXs ? '1.5rem' : undefined
              }}>
                Insira a capacidade térmica necessária
              </Typography>
              <Card sx={{
                maxWidth: 500,
                mx: 'auto',
                p: isXs ? 2 : 3,
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              }}>
                <CardContent>
                  <TextField
                    fullWidth
                    label="Capacidade Térmica (kW)"
                    name="capacity"
                    value={editingValues.capacity}
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                    variant="outlined"
                    size={isXs ? "small" : "medium"}
                    sx={{ mt: 2 }}
                    inputProps={{
                      inputMode: 'decimal',
                      pattern: '[0-9]*(,[0-9]+)?',
                      step: '0.1',
                      min: '0'
                    }}
                    InputProps={{
                      startAdornment: <ThermostatAuto sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Horas de Funcionamento/Dia"
                    name="operatingHours"
                    value={editingValues.operatingHours}
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                    variant="outlined"
                    size={isXs ? "small" : "medium"}
                    sx={{ mt: 3 }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 1,
                      max: 24
                    }}
                    InputProps={{
                      startAdornment: <AccessTimeSVG sx={{ mr: 1, color: 'primary.main' }} />
                    }}
                    helperText="Número de horas por dia que o sistema fica em operação (máximo 24h)"
                  />
                  <TextField
                    fullWidth
                    label="Dias de Funcionamento/Mês"
                    name="operatingDays"
                    value={editingValues.operatingDays}
                    onBlur={handleBlur}
                    onChange={handleInputChange}
                    variant="outlined"
                    size={isXs ? "small" : "medium"}
                    sx={{ mt: 3 }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                      min: 1,
                      max: 7
                    }}
                    InputProps={{
                       startAdornment: <AccessTimeSVG sx={{ mr: 1, color: 'primary.main' }} />
                     }}
                     helperText="Número de dias por semana que o sistema opera (mínimo 1, máximo 7 dias)"
                  />
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    Insira a capacidade térmica total do seu sistema de resfriamento
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        );
      case 3:
        return (
          <Fade in={true}>
            <Box sx={{ p: isXs ? 2 : 3, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{
                color: 'primary.main',
                mb: isXs ? 2 : 4,
                fontWeight: 700,
                textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}>
                Selecione a cidade da instalação
              </Typography>
              <Card sx={{
                maxWidth: 500,
                mx: 'auto',
                p: isXs ? 2 : 3,
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              }}>
                <CardContent>
                  <FormControl fullWidth size={isXs ? "small" : "medium"}>
                    <InputLabel>Localização</InputLabel>
                    <Select
                      name="selectedCityId"
                      value={inputs.selectedCityId || ''}
                      onChange={(e) => {
                        const cityId = e.target.value;
                        setInputs(prevInputs => ({ ...prevInputs, selectedCityId: cityId }));
                        const city = cities.find(c => c.id === cityId);
                        if (city) {
                          setSelectedCity(city); // Aqui city é o objeto completo, mas estamos passando o ID para o Select
                          console.log("Selected city updated by ID in Select:", city);
                        } else {
                          setSelectedCity(null);
                          console.log("City not found for ID in Select, selectedCity cleared");
                        }
                      }}
                      label="Localização"
                      startAdornment={<LocationOn sx={{ mr: 1, color: 'primary.main' }} />}
                    >
                      {/* Mostrar cidades do Supabase se disponíveis, senão mostrar a lista estática */}
                      {cities && cities.length > 0 ?
                        cities.map(city => (
                          <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
                        )) :
                        locations.map(loc => (
                          <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                        ))
                      }
                    </Select>
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      Selecione a cidade onde o sistema está ou será instalado
                    </Typography>
                  </FormControl>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        );
      case 4: // Results step
        return (
          <Fade in={true}>
            <Box>
              <WaterSavingsResults results={results} darkMode={darkMode} />
            </Box>
          </Fade>
        );
      case 5: // Solicitar Orçamento Personalizado step
        return (
          <Fade in={true}>
            <Box sx={{ p: isXs ? 2 : 3, textAlign: 'center' }}>
              <Typography variant="h4" gutterBottom sx={{
                color: 'primary.main',
                mb: isXs ? 2 : 4,
                fontWeight: 700,
                textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                fontSize: isXs ? '1.5rem' : undefined
              }}>
                Solicitar Orçamento Personalizado
              </Typography>
              <Card sx={{
                maxWidth: 600,
                mx: 'auto',
                p: isXs ? 2 : 4,
                background: darkMode 
                  ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                  : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
                    Gostou dos resultados da simulação?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                    Com base nos dados já informados durante a simulação, nossa equipe técnica pode 
                    desenvolver um orçamento personalizado e detalhado para o seu projeto.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                    O orçamento personalizado inclui:
                  </Typography>
                  <Box sx={{ textAlign: 'left', mb: 4 }}>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>• Análise técnica completa do seu processo</Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>• Dimensionamento preciso do equipamento</Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>• Proposta comercial detalhada</Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>• Cronograma de implementação</Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>• Suporte técnico especializado</Typography>
                  </Box>
                  <Box sx={{ 
                    background: darkMode ? 'rgba(0, 51, 122, 0.1)' : 'rgba(0, 51, 122, 0.05)',
                    borderRadius: 2,
                    p: 2,
                    mb: 4
                  }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      💡 Seus dados já foram salvos durante a simulação. Nossa equipe utilizará 
                      essas informações para criar uma proposta personalizada.
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        borderRadius: '50px',
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        background: 'linear-gradient(45deg, #00337A 30%, #335A9D 90%)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 25px rgba(0, 51, 122, 0.4)'
                        }
                      }}
                      onClick={() => {
                        setConfirmationModal({
                          open: true,
                          title: 'Confirmar Solicitação de Orçamento',
                          message: 'Deseja realmente solicitar um orçamento personalizado? Nossa equipe técnica entrará em contato em breve para apresentar uma proposta detalhada baseada nos dados da sua simulação.'
                        });
                      }}
                    >
                      Solicitar Orçamento
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Home />}
                      onClick={handleRestart}
                      sx={{
                        borderRadius: '50px',
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 3, sm: 4 },
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 25px rgba(0, 51, 122, 0.25)'
                        }
                      }}
                    >
                      Nova Simulação
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  const handleStartSimulation = () => {
    setShowSimulator(true);
    setActiveStep(0); // Vai para o step 0 (Informações Básicas)
  };

  const handleUserDataChange = (newUserData) => {
    setUserData(newUserData);
    if (Object.values(newUserData).every(value => value.trim() !== '')) {
      handleNext();
    }
  };

  // O tema já está definido anteriormente no componente

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease'
      }}>
        <Container 
          maxWidth={false}
          disableGutters={isXs}
          sx={{ 
            py: { xs: 1, sm: 2, md: 3, lg: 4 },
            px: { xs: 0, sm: 1, md: 2, lg: 3 },
            maxWidth: { xs: '100%', sm: '100%', md: '1200px', lg: '1400px' },
            mx: 'auto',
            minHeight: '100vh',
            display: 'flex',
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'center'
          }}
        >
          <Paper
            elevation={darkMode ? 24 : 3}
            sx={{
              borderRadius: { xs: 0, sm: 2, md: 3 },
              minHeight: { xs: '100vh', sm: 'auto', md: 'auto' },
              width: '100%',
              maxWidth: { xs: '100%', sm: '600px', md: '900px', lg: '1200px' },
              background: darkMode 
                ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)',
              mx: 'auto',
              boxShadow: darkMode 
                ? '0 8px 30px rgba(0, 0, 0, 0.5)'
                : '0 8px 30px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
          >
            {/* Barra de Navegação Superior */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              px: { xs: 1, sm: 2, md: 3, lg: 4 },
              py: { xs: 1, sm: 1.5, md: 2 },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 2 },
              borderBottom: '1px solid',
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 },
                flex: { xs: '1 1 auto', sm: '0 0 auto' }
              }}>
                <Box 
                  component="img" 
                  src="/images/drylogo.png" 
                  alt="Aludry" 
                  sx={{ 
                    height: { xs: '28px', sm: '36px', md: '40px' },
                    width: 'auto'
                  }} 
                />
                <Typography 
                  variant={isXs ? "subtitle1" : "h6"} 
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.main',
                    textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none',
                    fontSize: { xs: '1rem', sm: '1.25rem' },
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Simulador de Economia
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: { xs: 1, sm: 2 },
                flex: '0 0 auto'
              }}>
                <IconButton 
                  onClick={() => setDarkMode(!darkMode)}
                  aria-label="toggle dark mode"
                  color="inherit"
                  sx={{
                    bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    '&:hover': {
                      bgcolor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
                
                {simulationStarted && (
                  <Button 
                    variant="outlined" 
                    startIcon={!isXs ? <Home /> : undefined}
                    onClick={handleRestart}
                    size={isXs ? "small" : "medium"}
                    sx={{ 
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: { xs: 'auto', sm: '120px' },
                      px: { xs: 1, sm: 2 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    {isXs ? 'Nova' : 'Recomeçar'}
                  </Button>
                )}
              </Box>
            </Box>
            
            {/* Corpo principal */}
            <Box sx={{ 
              p: { xs: 1, sm: 2, md: 3, lg: 4 }, 
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              {!showSimulator ? (
                <WelcomePage 
                  onStartSimulation={handleStartSimulation}
                  darkMode={darkMode}
                />
              ) : (
                <>
                  {/* Stepper */}
                  <Stepper 
                    activeStep={activeStep} 
                    orientation={isXs ? "vertical" : "horizontal"}
                    sx={{ 
                      mb: { xs: 1, sm: 2, md: 3 },
                      '& .MuiStepLabel-root .Mui-completed': {
                        color: 'primary.main',
                      },
                      '& .MuiStepLabel-root .Mui-active': {
                        color: 'primary.main',
                      },
                      '& .MuiStepLabel-label': {
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        fontWeight: 500
                      },
                      '& .MuiStepIcon-root': {
                        fontSize: { xs: '1.2rem', sm: '1.5rem' }
                      }
                    }}
                  >
                    {steps.map((label, index) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  {/* Conteúdo dos passos */}
                  <Box sx={{ mb: 3 }}>
                    {activeStep === 0 && (
                      <ContentSection 
                        title="Informações Básicas"
                        subtitle="Vamos começar com algumas informações sobre seu projeto"
                        darkMode={darkMode}
                      >
                        <UserDataForm 
                          userData={userData}
                          onUserDataChange={handleUserDataChange}
                          darkMode={darkMode}
                        />
                      </ContentSection>
                    )}

                    {activeStep === 1 && (
                      <ContentSection 
                        title="Configuração do Sistema"
                        subtitle="Defina os parâmetros do seu sistema de resfriamento"
                        darkMode={darkMode}
                      >
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Potência do Equipamento (kW)"
                              type="number"
                              value={inputs.potencia}
                              onChange={(e) => setInputs({...inputs, potencia: e.target.value})}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Horas de Funcionamento/Dia"
                              type="number"
                              value={inputs.horasFuncionamento}
                              onChange={(e) => setInputs({...inputs, horasFuncionamento: e.target.value})}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">h/dia</InputAdornment>,
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Dias de Funcionamento/Mês"
                              type="number"
                              value={inputs.diasFuncionamento}
                              onChange={(e) => setInputs({...inputs, diasFuncionamento: e.target.value})}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">dias/mês</InputAdornment>,
                              }}
                            />
                          </Grid>

                        </Grid>
                      </ContentSection>
                    )}



                    {activeStep === 2 && (
                      <ContentSection 
                        title="Localização"
                        subtitle="Selecione sua cidade para cálculos precisos"
                        darkMode={darkMode}
                      >
                        <Box sx={{ mb: 3 }}>
                          <FormControl fullWidth>
                            <InputLabel>Cidade</InputLabel>
                            <Select
                              value={selectedCity?.id || ''}
                              label="Cidade"
                              onChange={(e) => {
                                const cityId = e.target.value;
                                const city = cities.find(c => c.id === cityId);
                                setSelectedCity(city || null);
                              }}
                            >
                              {cities.map((city) => (
                                <MenuItem key={city.id} value={city.id}>
                                  {city.name} - {city.state}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                      </ContentSection>
                    )}

                    {activeStep === 3 && (
                      <ContentSection 
                        title="Resultados da Simulação"
                        subtitle="Veja os benefícios do sistema Dryconomy"
                        darkMode={darkMode}
                      >
                        <WaterSavingsResults 
                          results={results}
                          darkMode={darkMode}
                        />
                      </ContentSection>
                    )}

                    {activeStep === 4 && (
                      <ContentSection 
                        title="Solicitar Orçamento Personalizado"
                        subtitle="Gostou dos resultados da simulação?"
                        darkMode={darkMode}
                      >
                        <Box sx={{ 
                          textAlign: 'center',
                          py: 4,
                          px: 2
                        }}>
                          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                            Com base nos dados já informados durante a simulação, nossa equipe técnica pode desenvolver um orçamento personalizado e detalhado para o seu projeto.
                          </Typography>
                          
                          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                            O orçamento personalizado inclui:
                          </Typography>
                          
                          <Box sx={{ 
                            textAlign: 'left', 
                            maxWidth: 600, 
                            mx: 'auto',
                            mb: 4
                          }}>
                            <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                              • Análise técnica completa do seu processo
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                              • Dimensionamento preciso do equipamento
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                              • Proposta comercial detalhada
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                              • Cronograma de implementação
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                              • Suporte técnico especializado
                            </Typography>
                          </Box>
                          
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mb: 4, 
                              maxWidth: 600, 
                              mx: 'auto',
                              textAlign: 'left'
                            }}
                          >
                            💡 Seus dados já foram salvos durante a simulação. Nossa equipe utilizará essas informações para criar uma proposta personalizada.
                          </Alert>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            gap: 2, 
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <Button
                              variant="contained"
                              size="large"
                              onClick={() => {
                                setConfirmationModal({
                                  open: true,
                                  title: 'Solicitar Orçamento Personalizado',
                                  message: 'Confirma que deseja solicitar um orçamento personalizado? Nossa equipe entrará em contato em breve com uma proposta detalhada baseada nos dados da sua simulação.'
                                });
                              }}
                              sx={{
                                borderRadius: '25px',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                                '&:hover': {
                                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 10px 2px rgba(25, 118, 210, .3)',
                                }
                              }}
                            >
                              SOLICITAR ORÇAMENTO
                            </Button>
                            
                            <Button
                              variant="outlined"
                              size="large"
                              startIcon={<Home />}
                              onClick={() => {
                                setActiveStep(0);
                                setShowSimulator(false);
                                setSimulationStarted(false);
                              }}
                              sx={{
                                borderRadius: '25px',
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem'
                              }}
                            >
                              NOVA SIMULAÇÃO
                            </Button>
                          </Box>
                        </Box>
                      </ContentSection>
                    )}
                  </Box>

                  {/* Botões de navegação */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: { xs: 2, sm: 3 },
                    pt: { xs: 1.5, sm: 2 },
                    borderTop: '1px solid',
                    borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    gap: { xs: 1, sm: 2 },
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0 || isLoading}
                      startIcon={!isXs ? <KeyboardArrowLeft /> : undefined}
                      size={isXs ? "small" : "medium"}
                      sx={{ 
                        visibility: activeStep === 0 ? 'hidden' : 'visible',
                        display: 'flex',
                        minWidth: { xs: '80px', sm: '100px' },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      Voltar
                    </Button>
                    
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      endIcon={!isXs && (activeStep === 4 ? <Send /> : <KeyboardArrowRight />)}
                      disabled={isLoading}
                      size={isXs ? "small" : "medium"}
                      sx={{
                        display: 'flex',
                        flex: { xs: '1 1 auto', sm: '1 1 0' },
                        maxWidth: { xs: 'none', sm: '200px' },
                        ml: { xs: 1, sm: 2 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}
                    >
                      {isLoading ? (
                        <CircularProgress size={isXs ? 20 : 24} color="inherit" />
                      ) : activeStep === 4 ? (
                        'Finalizar'
                      ) : (
                        'Próximo'
                      )}
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </Container>
        {/* LeadCaptureForm removido conforme solicitado */}
        <PrivacyBanner />
        <Snackbar 
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          <Alert 
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
        
        <ConfirmationDialog
          open={confirmationModal.open}
          onClose={() => setConfirmationModal({ ...confirmationModal, open: false })}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={() => {
            // Fechar o modal
            setConfirmationModal({ ...confirmationModal, open: false });
            // Mostrar notificação de sucesso
            setNotification({
              open: true,
              message: 'Solicitação de orçamento enviada! Nossa equipe entrará em contato em breve.',
              severity: 'success'
            });
          }}
          confirmText="Confirmar Solicitação"
        />
      </Box>
      </ThemeProvider>
  );
};

export default App;
