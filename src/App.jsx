import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Box, Button, 
  Snackbar, Alert,
  createTheme, ThemeProvider, useMediaQuery, IconButton
} from '@mui/material';
import { 
  LightMode, DarkMode, Home 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Hooks
import useSimulator from './hooks/useSimulator';
import { getCities } from './services/api';

// Componentes do Simulador
import WelcomePage from './components/WelcomePage';
import UserDataForm from './components/UserDataForm';
import SimulationParametersForm from './components/SimulationParametersForm';
import CitySelectionForm from './components/CitySelectionForm';
import WaterSavingsResults from './components/WaterSavingsResults';
import ThankYouPage from './components/ThankYouPage';
import PrivacyBanner from './components/PrivacyBanner';
import BudgetRequestModal from './components/BudgetRequestModal';

// Componentes de UI/UX melhorados
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import ProgressIndicator from './components/ProgressIndicator';
import AccessibilityHelper from './components/AccessibilityHelper';
import SkipToContent from './components/SkipToContent';
import ImprovedStepper from './components/ImprovedStepper';
import ResponsiveNavigation from './components/ResponsiveNavigation';

// Componente de limite de erro personalizado
const AppErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const errorHandler = (errorEvent) => {
      setHasError(true);
      setError(errorEvent.error);
      console.error('Uncaught error:', errorEvent.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error" gutterBottom>
          Ocorreu um erro inesperado
        </Typography>
        <Typography variant="body1" paragraph>
          Por favor, recarregue a página e tente novamente.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => window.location.reload()}
        >
          Recarregar Página
        </Button>
        {error && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, textAlign: 'left' }}>
            <Typography variant="caption" color="textSecondary">
              Detalhes do erro: {error.message}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }

  return children;
};

// Componente principal do Simulador
const App = () => {
  console.log('App component mounting...');
  const navigate = useNavigate();
  
  // Estados principais
  const [activeStep, setActiveStep] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    } catch (error) {
      console.error('Error reading darkMode from localStorage:', error);
      return false;
    }
  });
  
  // Estados para controle de UI
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Estados para dados da aplicação
  const [cities, setCities] = useState([]);
  const [citiesData, setCitiesData] = useState([]);
  const [results, setResults] = useState(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  
  // Estados para formulários
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    state: '',
  });
  
  const [inputs, setInputs] = useState({
    capacity: 100,
    location: '',
    operatingHours: 24,
    operatingDays: 365,
  });
  
  // Tema da aplicação
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00337A',
      },
      secondary: {
        main: '#00A3E0',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1E1E1E' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#333333',
        secondary: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#333333',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#333333',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#333333',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#333333',
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#333333',
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#333333',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            padding: '8px 16px',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          rounded: {
            borderRadius: 12,
          },
          elevation1: {
            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.1), 0px 1px 1px 0px rgba(0,0,0,0.07), 0px 1px 3px 0px rgba(0,0,0,0.06)',
          },
          elevation2: {
            boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.1), 0px 2px 2px 0px rgba(0,0,0,0.07), 0px 1px 5px 0px rgba(0,0,0,0.06)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            overflow: 'hidden',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: 'outlined',
          fullWidth: true,
          margin: 'normal',
        },
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              color: darkMode ? '#ffffff' : '#000000', // Garantindo contraste adequado
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
            },
          },
        },
      },
      MuiFormControl: {
        defaultProps: {
          fullWidth: true,
          margin: 'normal',
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: darkMode ? '#ffffff' : '#333333',
            '&.MuiTypography-h3': {
              color: darkMode ? '#ffffff' : '#333333', // Força a cor específica para h3
            },
          },
          colorTextSecondary: {
            color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
          },
        },
      },
    },
  });

  const isXs = useMediaQuery('(max-width:600px)');

  // Passos do stepper
  const steps = [
    'Bem-vindo',
    'Seus Dados',
    'Parâmetros',
    'Localização',
    'Resultados',
    'Obrigado'
  ];

  // Salvar preferência de tema
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar cidades usando o serviço de API
        const response = await getCities();
        if (response && response.data) {
          // Garantir que cada cidade tenha um ID único
          const citiesWithIds = response.data.map((city, index) => ({
            ...city,
            id: city.id || `city-${index}` // Usar ID existente ou gerar um
          }));
          setCities(citiesWithIds);
        } else {
          throw new Error('Dados de cidades não encontrados');
        }
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar cidades. Verifique sua conexão e tente novamente.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Carregar dados da cidade selecionada
  useEffect(() => {
    const loadCities = async () => {
      if (!inputs.location || !initialDataLoaded) return;
      
      try {
        setIsLoading(true);
        
        // Usar o serviço getCities em vez de fetch direto
        const { data: allCities } = await getCities();
        
        // Verificar se inputs.location é um objeto ou string
        let cityData;
        if (typeof inputs.location === 'object' && inputs.location !== null) {
          // Se for um objeto, usamos diretamente (provavelmente já é um objeto de cidade)
          console.log('inputs.location é um objeto:', inputs.location);
          
          // Se tiver uma propriedade city, usá-la (compatível com a nova estrutura do CitySelectionForm)
          if (inputs.location.city) {
            cityData = inputs.location.city;
          } else {
            // Caso contrário, assumir que o próprio objeto é a cidade
            cityData = inputs.location;
          }
          
          // Atualizar inputs.location para ser apenas o nome da cidade (para futuras chamadas)
          const cityName = cityData.state ? `${cityData.name}, ${cityData.state}` : cityData.name;
          setInputs(prev => ({
            ...prev,
            location: cityName
          }));
        } else {
          // Se for uma string, buscar a cidade correspondente
          const locationStr = String(inputs.location || '').toLowerCase();
          cityData = allCities.find(city => {
            const cityNameLower = city.name.toLowerCase();
            const cityWithStateLower = (city.name + ", " + city.state).toLowerCase();
            return cityNameLower === locationStr || cityWithStateLower === locationStr;
          });
          
          if (!cityData) throw new Error(`Cidade '${inputs.location}' não encontrada`);
        }
        
        setCitiesData(prev => {
          // Usar o ID como identificador principal para comparação, sendo mais preciso
          const exists = prev.some(city => city.id === cityData.id);
          
          // Se a cidade já existe na lista, não precisamos adicioná-la novamente
          if (exists) return prev;
          
          // Caso contrário, adicionamos a nova cidade aos dados
          console.log('Adicionando nova cidade aos dados:', cityData);
          return [...prev, cityData];
        });
        
        console.log('City changed in App:', cityData);
      } catch (error) {
        console.error('Erro ao carregar dados da cidade:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados da cidade. Tente novamente.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCities();
  }, [inputs.location, initialDataLoaded]);

  // Função para calcular resultados
  const calculateResults = () => {
    if (!inputs.location || !inputs.capacity) return;
    
    try {
      // Obter a cidade selecionada dos dados
      const selectedCityData = citiesData.find(city => {
        // Verifica se inputs.location é um objeto com city ou uma string
        if (typeof inputs.location === 'object' && inputs.location !== null) {
          return inputs.location.city?.id === city.id || 
                 inputs.location.locationName === (city.state ? `${city.name}, ${city.state}` : city.name);
        } else {
          // Se for string, compara com o nome formatado da cidade
          const cityStr = String(inputs.location || '').toLowerCase();
          return city.name.toLowerCase() === cityStr || 
                 (city.state ? `${city.name}, ${city.state}`.toLowerCase() === cityStr : false);
        }
      });

      if (!selectedCityData) {
        console.warn('Cidade não encontrada nos dados:', inputs.location);
        return;
      }

      console.log('Calculando com a cidade:', selectedCityData);
      
      // Lógica de cálculo dos resultados baseada no useSimulator.js
      const { capacity, operatingHours, operatingDays } = inputs;
      
      const drycoolerHourlyConsumption = capacity * 0.00186;
      const drycoolerDailyConsumption = drycoolerHourlyConsumption * operatingHours;
      const drycoolerMonthlyConsumption = drycoolerDailyConsumption * 30;
      const drycoolerYearlyConsumption = drycoolerDailyConsumption * operatingDays;
      
      const towerHourlyConsumption = capacity * 0.019;
      const towerDailyConsumption = towerHourlyConsumption * operatingHours;
      const towerMonthlyConsumption = towerDailyConsumption * 30;
      const towerYearlyConsumption = towerDailyConsumption * operatingDays;
      
      const yearlyDifference = towerYearlyConsumption - drycoolerYearlyConsumption;
      const yearlyDifferencePercentage = (yearlyDifference / towerYearlyConsumption) * 100;

      // Usar os dados da cidade para ajustar os cálculos
      const waterConsumptionFactor = selectedCityData.water_consumption_year 
        ? selectedCityData.water_consumption_year / 880000 // Fator normalizado considerando 880000 como base
        : 1.0; // Valor padrão se não houver dados

      // Calcular as economias anuais, mensais, etc. para uso posterior
      const yearlyWaterSavings = yearlyDifference * waterConsumptionFactor;
      const monthlySavings = (yearlyWaterSavings / 12); // Simplificação
      const yearlyCostSavings = yearlyDifference * 0.0105 * waterConsumptionFactor;
      const yearlyCo2Savings = yearlyDifference * 0.00058 * waterConsumptionFactor;

      // Calcular o valor da cidade para temperatura média
      const averageTemperature = selectedCityData.average_temperature || 25; // Valor padrão caso não exista

      // Resultados calculados com base nos dados reais - estrutura completa compatível com WaterSavingsResults.jsx
      const calculatedResults = {
        drycooler: {
          moduleCapacity: 168.74,
          modules: Math.ceil(capacity / 168.74),
          totalCapacity: Math.ceil(capacity / 168.74) * 168.74,
          nominalWaterFlow: 24.2,
          evaporationPercentage: 0.16,
          evaporationFlow: 0.0387,
          consumption: {
            hourly: drycoolerHourlyConsumption,
            daily: drycoolerDailyConsumption,
            monthly: drycoolerMonthlyConsumption,
            yearly: drycoolerYearlyConsumption * waterConsumptionFactor,
          },
        },
        tower: {
          capacity: capacity,
          consumption: {
            hourly: towerHourlyConsumption,
            daily: towerDailyConsumption,
            monthly: towerMonthlyConsumption,
            yearly: towerYearlyConsumption * waterConsumptionFactor,
          },
        },
        savings: {
          water: {
            daily: (towerDailyConsumption - drycoolerDailyConsumption) * waterConsumptionFactor,
            monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * waterConsumptionFactor,
            yearly: yearlyWaterSavings,
          },
          cost: {
            daily: (towerDailyConsumption - drycoolerDailyConsumption) * 0.0105 * waterConsumptionFactor,
            monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * 0.0105 * waterConsumptionFactor,
            yearly: yearlyCostSavings,
          },
          co2: {
            daily: (towerDailyConsumption - drycoolerDailyConsumption) * 0.00058 * waterConsumptionFactor,
            monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * 0.00058 * waterConsumptionFactor,
            yearly: yearlyCo2Savings,
          },
        },
        // Os campos esperados pelo WaterSavingsResults.jsx
        comparison: {
          yearly_difference: yearlyWaterSavings,
          yearly_difference_percentage: yearlyDifferencePercentage,
          monthly_savings: monthlySavings,          // Campo adicional necessário
          yearly_savings: yearlyCostSavings,       // Campo adicional necessário (corrigido)
          co2_savings: yearlyCo2Savings,           // Campo adicional necessário
          energy_savings: yearlyCostSavings * 0.2, // Estimativa de economia energética
          water_savings: yearlyWaterSavings,       // Campo adicional necessário
        },
        city: {
          name: selectedCityData.name,
          state: selectedCityData.state || 'Brasil',
          average_temperature: averageTemperature,
        }
      };
      
      console.log('Resultados calculados:', calculatedResults);
      setResults(calculatedResults);
    } catch (error) {
      console.error('Erro ao calcular resultados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao calcular resultados. Verifique os dados e tente novamente.',
        severity: 'error'
      });
    }
  };

  // Recalcular quando os inputs mudarem
  useEffect(() => {
    if (initialDataLoaded) {
      calculateResults();
    }
  }, [inputs, initialDataLoaded]);

  // Navegação entre passos
  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prevActiveStep => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prevActiveStep => prevActiveStep - 1);
    }
  };

  const handleStartSimulation = () => {
    setShowSimulator(true);
    handleNext();
  };

  const handleRestart = () => {
    setActiveStep(0);
    setResults(null);
    setInputs({
      capacity: 100,
      location: '',
      operatingHours: 24,
      operatingDays: 365,
    });
    setUserData({
      name: '',
      email: '',
      phone: '',
      company: '',
      state: '',
    });
  };

  // Manipuladores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserDataChange = (newUserData) => {
    setUserData(newUserData);
  };

  const handleParametersChange = (newParams) => {
    setInputs(prev => ({
      ...prev,
      ...newParams
    }));
  };

  const handleCityChange = (city) => {
    console.log('City changed in App:', city);
    if (city) {
      setInputs(prev => ({
        ...prev,
        location: city,
        coordinates: city.coordinates || { lat: 0, lng: 0 }
      }));
      
      // Após selecionar a cidade, avance para a tela de resultados (etapa 4)
      // Adicionamos um pequeno delay para garantir que os cálculos sejam feitos
      setTimeout(() => {
        console.log('Avançando para tela de resultados após seleção de cidade');
        setActiveStep(4);
      }, 500);
    } else {
      setInputs(prev => ({
        ...prev,
        location: null,
        coordinates: { lat: 0, lng: 0 }
      }));
    }
  };

  const handleFinishSimulation = () => {
    setBudgetModalOpen(true);
  };

  const handleBudgetRequest = async (budgetData) => {
    try {
      setIsLoading(true);
      
      // Enviar dados para a API
      const response = await fetch('/api/budget-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...budgetData,
          simulationData: {
            inputs,
            results,
            userData
          }
        }),
      });
      
      if (!response.ok) throw new Error('Falha ao enviar solicitação');
      
      setSnackbar({
        open: true,
        message: 'Solicitação de orçamento enviada com sucesso!',
        severity: 'success'
      });
      
      setBudgetModalOpen(false);
      handleNext();
    } catch (error) {
      console.error('Erro ao enviar solicitação de orçamento:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao enviar solicitação. Tente novamente mais tarde.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar conteúdo do passo atual
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <WelcomePage 
            onStartSimulation={handleStartSimulation} 
            darkMode={darkMode} 
            onToggleDarkMode={() => setDarkMode(!darkMode)} 
          />
        );
      case 1:
        return (
          <UserDataForm 
            userData={userData} 
            onChange={handleUserDataChange} 
            darkMode={darkMode}
          />
        );
      case 2:
        return (
          <SimulationParametersForm 
            inputs={inputs} 
            onChange={handleParametersChange} 
            onNext={handleNext} 
            onBack={handleBack} 
          />
        );
      case 3:
        return (
          <CitySelectionForm 
            cities={cities} 
            selectedCity={inputs.location}
            onSelectCity={handleCityChange}
            darkMode={darkMode}
          />
        );
      case 4:
        return (
          <WaterSavingsResults 
            results={results} 
            inputs={inputs} 
            onFinish={handleFinishSimulation} 
            onBack={handleBack} 
            onRequestBudget={() => setBudgetModalOpen(true)} 
          />
        );
      case 5:
        return (
          <ThankYouPage 
            onRestart={handleRestart} 
            userData={userData} 
          />
        );
      default:
        return <div>Passo não encontrado</div>;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SkipToContent />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary'
        }}>
          {/* Cabeçalho */}
          <Box 
            component="header"
            sx={{
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'background.paper',
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="h6" component="h1">
              Simulador de Economia de Água
            </Typography>
            <IconButton 
              onClick={() => setDarkMode(!darkMode)}
              color="inherit"
              aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Box>
          
          {/* Conteúdo principal */}
          <Box 
            component="main" 
            id="main-content"
            sx={{
              flexGrow: 1,
              py: 4,
              px: { xs: 2, sm: 3, md: 4 },
              maxWidth: 1200,
              width: '100%',
              mx: 'auto',
              position: 'relative'
            }}
          >
            {showSimulator && (
              <>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                  <ImprovedStepper 
                    activeStep={activeStep - 1} 
                    steps={steps.filter((_, i) => i > 0 && i < steps.length - 1)} 
                    totalSteps={steps.length - 2}
                    onBack={() => activeStep === 1 ? navigate('/') : handleBack()}
                  />
                </Box>
                
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: { xs: 2, sm: 3, md: 4 },
                    mb: 4,
                    position: 'relative',
                    minHeight: 400
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                      <LoadingSpinner size={60} />
                    </Box>
                  ) : (
                    renderStepContent(activeStep)
                  )}
                </Paper>
                
                <AccessibilityHelper />
                
                {/* Navegação responsiva */}
                <ResponsiveNavigation
                  activeStep={activeStep}
                  totalSteps={steps.length}
                  onBack={handleBack}
                  onNext={handleNext}
                  onFinish={handleFinishSimulation}
                  onHome={() => {
                    setActiveStep(0);
                    navigate('/');
                  }}
                  isLoading={isLoading}
                  canProceed={true}
                  backLabel="Voltar"
                  nextLabel="Próximo"
                  finishLabel="Solicitar Orçamento"
                />
              </>
            )}
            
            {!showSimulator && activeStep === 0 && renderStepContent(0)}
          </Box>
          
          {/* Rodapé */}
          <Box 
            component="footer" 
            sx={{
              py: 3,
              px: 2,
              mt: 'auto',
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
              textAlign: 'center',
              borderTop: `1px solid ${theme.palette.divider}`
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Dryconomy - Todos os direitos reservados
            </Typography>
          </Box>
          
          {/* Banner de privacidade */}
          <PrivacyBanner />
          
          {/* Modal de orçamento */}
          <BudgetRequestModal 
            open={budgetModalOpen}
            onClose={() => setBudgetModalOpen(false)}
            onSubmit={handleBudgetRequest}
            userData={userData}
            simulationData={{
              inputs,
              results
            }}
          />
          
          {/* Snackbar para feedback */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

// Envolve o App com o ErrorBoundary
export default function AppWithErrorBoundary() {
  return (
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  );
}
