import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Box, Button, 
  CircularProgress, Snackbar, Alert,
  createTheme, ThemeProvider, useMediaQuery, IconButton
} from '@mui/material';
import { 
  LightMode, DarkMode, Home, Send 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

// Serviços
import { getCalculationVariables, getCities, saveSimulation } from './services/simulationService';

// Componente principal do Simulador
const App = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [calculationVars, setCalculationVars] = useState({});
  const [darkMode, setDarkMode] = useState(() => {
    // Verificar preferência salva ou preferência do sistema
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [simulationCompleted, setSimulationCompleted] = useState(false);
  const [budgetRequestData, setBudgetRequestData] = useState(null);
  
  // Estados para notificações
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // Estados do formulário
  const [inputs, setInputs] = useState({
    capacity: 500,
    location: 'São Paulo',
    deltaT: 6,
    waterFlow: 71.7,
    operatingHours: 24,
    operatingDays: 365
  });
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    state: ''
  });

  // Estados para resultados - com valores calculados dinamicamente
  const [results, setResults] = useState({
    drycooler: {
      moduleCapacity: 168.74,
      modules: 3,
      totalCapacity: 506.22,
      nominalWaterFlow: 24.2,
      evaporationPercentage: 0.16,
      evaporationFlow: 0.0387,
      consumption: { 
        hourly: 0.93, 
        daily: 22.32, 
        monthly: 669.6, 
        yearly: 8035.2 
      }
    },
    tower: {
      capacity: 500,
      consumption: { 
        hourly: 9.5, 
        daily: 228, 
        monthly: 6840, 
        yearly: 82080 
      }
    },
    savings: {
      water: { daily: 205.68, monthly: 6170.4, yearly: 74044.8 },
      cost: { daily: 2.16, monthly: 64.79, yearly: 777.47 },
      co2: { daily: 0.12, monthly: 3.59, yearly: 43.06 }
    },
    comparison: {
      yearlyDifference: 74044.8,
      yearlyDifferencePercentage: 90.21
    }
  });

  const [citiesData, setCitiesData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // Estados para o modal de orçamento
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);

  // Configurações de tema melhoradas - FOCO NA LEGIBILIDADE DO MODO LIGHT
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00337A',
        light: '#1976d2',
        dark: '#002357',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#fafafa', // Fundo mais suave no light
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#ffffff' : '#1a1a1a', // Texto mais escuro no light
        secondary: darkMode ? 'rgba(255,255,255,0.7)' : '#4a4a4a', // Texto secundário mais legível
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20'
      },
      // Melhorar contraste para elementos de ação
      action: {
        hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        disabled: darkMode ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
      // Melhorar divisores
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { 
        fontWeight: 700,
        color: darkMode ? '#ffffff' : '#1a1a1a'
      },
      h2: { 
        fontWeight: 600,
        color: darkMode ? '#ffffff' : '#1a1a1a'
      },
      h3: { 
        fontWeight: 600,
        color: darkMode ? '#ffffff' : '#1a1a1a'
      },
      h4: { 
        fontWeight: 600,
        color: darkMode ? '#ffffff' : '#1a1a1a'
      },
      h5: { 
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#1a1a1a'
      },
      h6: { 
        fontWeight: 500,
        color: darkMode ? '#ffffff' : '#1a1a1a'
      },
      body1: {
        color: darkMode ? 'rgba(255,255,255,0.87)' : '#2c2c2c',
        lineHeight: 1.6
      },
      body2: {
        color: darkMode ? 'rgba(255,255,255,0.7)' : '#4a4a4a',
        lineHeight: 1.5
      },
      caption: {
        color: darkMode ? 'rgba(255,255,255,0.6)' : '#6a6a6a'
      }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            padding: '10px 24px',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }
          },
          contained: {
            boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              boxShadow: darkMode ? '0 4px 16px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.15)'
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            // Melhor sombra para modo light
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0,0,0,0.3)' 
              : '0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // Melhor contraste para cards no modo light
            backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
            border: darkMode ? 'none' : '1px solid rgba(0,0,0,0.06)',
            boxShadow: darkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 1px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : '#ffffff',
              '& fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
              },
              '&:hover fieldset': {
                borderColor: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00337A',
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root': {
              color: darkMode ? 'rgba(255,255,255,0.7)' : '#4a4a4a',
              '&.Mui-focused': {
                color: '#00337A',
              }
            },
            '& .MuiOutlinedInput-input': {
              color: darkMode ? '#ffffff' : '#1a1a1a',
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            color: darkMode ? '#ffffff' : '#2c2c2c',
            '&.MuiChip-colorPrimary': {
              backgroundColor: darkMode ? 'rgba(25,118,210,0.3)' : 'rgba(0,51,122,0.1)',
              color: darkMode ? '#90caf9' : '#00337A',
            }
          }
        }
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          standardSuccess: {
            backgroundColor: darkMode ? 'rgba(46,125,50,0.2)' : 'rgba(46,125,50,0.08)',
            color: darkMode ? '#81c784' : '#2e7d32',
            border: darkMode ? '1px solid rgba(46,125,50,0.3)' : '1px solid rgba(46,125,50,0.2)',
          },
          standardInfo: {
            backgroundColor: darkMode ? 'rgba(25,118,210,0.2)' : 'rgba(25,118,210,0.08)',
            color: darkMode ? '#90caf9' : '#1976d2',
            border: darkMode ? '1px solid rgba(25,118,210,0.3)' : '1px solid rgba(25,118,210,0.2)',
          },
          standardWarning: {
            backgroundColor: darkMode ? 'rgba(237,108,2,0.2)' : 'rgba(237,108,2,0.08)',
            color: darkMode ? '#ffb74d' : '#ed6c02',
            border: darkMode ? '1px solid rgba(237,108,2,0.3)' : '1px solid rgba(237,108,2,0.2)',
          },
          standardError: {
            backgroundColor: darkMode ? 'rgba(211,47,47,0.2)' : 'rgba(211,47,47,0.08)',
            color: darkMode ? '#f48fb1' : '#d32f2f',
            border: darkMode ? '1px solid rgba(211,47,47,0.3)' : '1px solid rgba(211,47,47,0.2)',
          }
        }
      }
    },
    shape: {
      borderRadius: 8
    }
  });

  // Hooks de media query
  const isXs = useMediaQuery('(max-width:600px)');
  const isSm = useMediaQuery('(max-width:960px)');
  const isMd = useMediaQuery('(max-width:1280px)');

  // Constantes melhoradas - CORRIGIDO: 6 etapas (incluindo página de obrigado)
  const steps = [
    { label: 'Início', description: 'Bem-vindo ao simulador' },
    { label: 'Dados Pessoais', description: 'Suas informações de contato' },
    { label: 'Parâmetros', description: 'Configurações da simulação' },
    { label: 'Localização', description: 'Selecione sua cidade' },
    { label: 'Resultados', description: 'Análise de economia' },
    { label: 'Obrigado', description: 'Finalização' }
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
        
        // Carregar cidades
        const citiesData = await getCities();
        setCities(citiesData);
        
        // Carregar variáveis de cálculo
        const vars = await getCalculationVariables();
        setCalculationVars(vars);
        
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setNotification({
          open: true,
          message: 'Erro ao carregar dados iniciais. Usando valores padrão.',
          severity: 'warning'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await getCities();
        if (cities?.length > 0) {
          setCitiesData(cities);
          console.log('Cidades carregadas:', cities.length);
          
          if (inputs.location) {
            const city = cities.find(c => 
              c.name === inputs.location || 
              c.name.toLowerCase() === inputs.location.toLowerCase()
            );
            if (city) setSelectedCity(city);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar cidades:', error);
      }
    };
    
    loadCities();
  }, [inputs.location]);

  // Função para calcular resultados baseado nos inputs
  const calculateResults = () => {
    const { capacity, operatingHours, operatingDays } = inputs;
    
    // Cálculos para DryCooler
    const drycoolerHourlyConsumption = capacity * 0.00186; // L/h por kW
    const drycoolerDailyConsumption = drycoolerHourlyConsumption * operatingHours;
    const drycoolerMonthlyConsumption = drycoolerDailyConsumption * 30;
    const drycoolerYearlyConsumption = drycoolerDailyConsumption * operatingDays;
    
    // Cálculos para Torre
    const towerHourlyConsumption = capacity * 0.019; // L/h por kW
    const towerDailyConsumption = towerHourlyConsumption * operatingHours;
    const towerMonthlyConsumption = towerDailyConsumption * 30;
    const towerYearlyConsumption = towerDailyConsumption * operatingDays;
    
    // Economia
    const yearlyDifference = towerYearlyConsumption - drycoolerYearlyConsumption;
    const yearlyDifferencePercentage = (yearlyDifference / towerYearlyConsumption) * 100;
    
    const newResults = {
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
          yearly: drycoolerYearlyConsumption
        }
      },
      tower: {
        capacity: capacity,
        consumption: {
          hourly: towerHourlyConsumption,
          daily: towerDailyConsumption,
          monthly: towerMonthlyConsumption,
          yearly: towerYearlyConsumption
        }
      },
      savings: {
        water: { 
          daily: towerDailyConsumption - drycoolerDailyConsumption,
          monthly: towerMonthlyConsumption - drycoolerMonthlyConsumption,
          yearly: yearlyDifference
        },
        cost: { 
          daily: (towerDailyConsumption - drycoolerDailyConsumption) * 0.0105,
          monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * 0.0105,
          yearly: yearlyDifference * 0.0105
        },
        co2: { 
          daily: (towerDailyConsumption - drycoolerDailyConsumption) * 0.00058,
          monthly: (towerMonthlyConsumption - drycoolerMonthlyConsumption) * 0.00058,
          yearly: yearlyDifference * 0.00058
        }
      },
      comparison: {
        yearlyDifference,
        yearlyDifferencePercentage
      }
    };
    
    setResults(newResults);
  };

  // Recalcular quando inputs mudarem
  useEffect(() => {
    calculateResults();
  }, [inputs]);

  // Manipuladores de navegação melhorados
  const handleNext = () => {
    // Marcar etapa atual como completa
    if (!completedSteps.includes(activeStep)) {
      setCompletedSteps(prev => [...prev, activeStep]);
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    if (activeStep === 0) {
      navigate('/');
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleStartSimulation = () => {
    setShowSimulator(true);
    setSimulationStarted(true);
    setActiveStep(1);
  };

  const handleRestart = () => {
    setShowSimulator(false);
    setSimulationStarted(false);
    setSimulationCompleted(false);
    setActiveStep(0);
    setCompletedSteps([]);
    setBudgetRequestData(null);
    // Reset form data
    setUserData({
      name: '',
      email: '',
      company: '',
      phone: '',
      state: ''
    });
    setInputs({
      capacity: 500,
      location: 'São Paulo',
      deltaT: 6,
      waterFlow: 71.7,
      operatingHours: 24,
      operatingDays: 365
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // CORRIGIDO: Remover auto-avanço da função handleUserDataChange
  const handleUserDataChange = (newUserData) => {
    setUserData(newUserData);
    // Não fazer auto-avanço aqui - deixar o usuário clicar em "Próximo"
  };

  const handleParametersChange = (newParams) => {
    setInputs(prev => ({
      ...prev,
      ...newParams
    }));
    // Auto-avanço após configurar parâmetros
    setTimeout(() => handleNext(), 500);
  };

  const handleCityChange = (cityData) => {
    setSelectedCity(cityData);
    setInputs(prev => ({
      ...prev,
      location: cityData.name
    }));
    // Auto-avanço após selecionar cidade
    setTimeout(() => handleNext(), 500);
  };

  const handleFinishSimulation = async () => {
    // Abrir modal de orçamento em vez de salvar diretamente
    setBudgetModalOpen(true);
  };

  const handleBudgetRequest = async (budgetData) => {
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
          tower: { consumption: results.tower.consumption },
          comparison: {
            yearlyDifference: results.comparison.yearlyDifference,
            yearlyDifferencePercentage: results.comparison.yearlyDifferencePercentage
          }
        },
        budgetRequest: {
          wantsBudget: budgetData.wantsBudget,
          additionalInfo: budgetData.additionalInfo
        },
        timestamp: new Date().toISOString(),
        location: inputs.location,
        capacity: inputs.capacity
      };

      await saveSimulation(simulationData);
      
      // Marcar última etapa como completa e ir para página de obrigado
      setCompletedSteps(prev => [...prev, activeStep]);
      setBudgetRequestData(budgetData);
      setSimulationCompleted(true);
      setActiveStep(5); // Ir para a página de obrigado
      
    } catch (error) {
      console.error('Erro ao finalizar simulação:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar a simulação. Tente novamente mais tarde.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
      setBudgetModalOpen(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <WelcomePage onStartSimulation={handleStartSimulation} darkMode={darkMode} />;
      case 1:
        return <UserDataForm userData={userData} onChange={handleUserDataChange} darkMode={darkMode} />;
      case 2:
        return <SimulationParametersForm inputs={inputs} onChange={handleParametersChange} darkMode={darkMode} />;
      case 3:
        return <CitySelectionForm 
          cities={citiesData} 
          selectedCity={selectedCity} 
          onChange={handleCityChange} 
          darkMode={darkMode} 
        />;
      case 4:
        return <WaterSavingsResults results={results} inputs={inputs} darkMode={darkMode} />;
      case 5:
        return <ThankYouPage 
          userData={userData}
          simulationResults={{ inputs, comparison: results.comparison }}
          budgetRequested={budgetRequestData?.wantsBudget}
          onRestart={handleRestart}
          darkMode={darkMode}
        />;
      default:
        return (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              Etapa em desenvolvimento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta etapa será implementada em breve.
            </Typography>
          </Box>
        );
    }
  };

  // Verificar se pode prosseguir
  const canProceed = () => {
    switch (activeStep) {
      case 1:
        return userData.name && userData.email;
      case 2:
        return inputs.capacity > 0;
      case 3:
        return selectedCity !== null;
      default:
        return true;
    }
  };

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SkipToContent />
        <AccessibilityHelper />
        
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: 'background.default',
            color: 'text.primary',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 4,
            px: { xs: 2, sm: 3, md: 4 },
            pb: { xs: 10, sm: 4 } // Espaço extra no mobile para navegação fixa
          }}
        >
          {isLoading && <LoadingSpinner fullScreen overlay message="Carregando dados..." />}
          
          <Paper
            elevation={darkMode ? 24 : 3}
            sx={{
              width: '100%',
              maxWidth: '1200px',
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              background: darkMode 
                ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
            }}
          >
            {/* Cabeçalho melhorado */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: { xs: 2, sm: 3 },
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: darkMode 
                  ? 'rgba(0, 51, 122, 0.1)' 
                  : 'rgba(0, 51, 122, 0.03)'
              }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  component="img"
                  src="/images/drylogo.png"
                  alt="Dryconomy"
                  sx={{ 
                    height: { xs: 32, sm: 40 }, 
                    width: 'auto',
                    filter: darkMode ? 'brightness(1.2)' : 'none'
                  }}
                />
                {simulationStarted && (
                  <Typography variant="h6" sx={{ 
                    fontWeight: 600, 
                    color: 'primary.main',
                    display: { xs: 'none', sm: 'block' }
                  }}>
                    Simulador DryCooler
                  </Typography>
                )}
              </Box>
              
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  color="inherit"
                  aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
                  sx={{
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'rotate(180deg)'
                    }
                  }}
                >
                  {darkMode ? <LightMode /> : <DarkMode />}
                </IconButton>
                
                {simulationStarted && !isXs && (
                  <Button
                    variant="outlined"
                    startIcon={<Home />}
                    onClick={handleRestart}
                    size="small"
                  >
                    Reiniciar
                  </Button>
                )}
              </Box>
            </Box>

            {/* Conteúdo Principal */}
            <Box 
              id="main-content"
              tabIndex={-1}
              sx={{ 
                p: { xs: 2, sm: 3, md: 4 },
                outline: 'none'
              }}
            >
              {!showSimulator ? (
                <WelcomePage onStartSimulation={handleStartSimulation} darkMode={darkMode} />
              ) : (
                <>
                  {/* Progress Indicator - não mostrar na página de obrigado */}
                  {activeStep < 5 && (
                    <ProgressIndicator
                      currentStep={activeStep}
                      totalSteps={steps.length - 1} // Excluir página de obrigado do progresso
                      stepLabels={steps.slice(0, -1).map(s => s.label)} // Excluir página de obrigado
                    />
                  )}

                  {/* Stepper melhorado - não mostrar na página de obrigado */}
                  {activeStep < 5 && (
                    <ImprovedStepper
                      activeStep={activeStep}
                      steps={steps.slice(0, -1)} // Excluir página de obrigado
                      completedSteps={completedSteps}
                      orientation={isXs ? 'vertical' : 'horizontal'}
                    />
                  )}

                  {/* Conteúdo do Passo Atual */}
                  <Box sx={{ minHeight: '50vh', py: 4 }}>
                    {renderStepContent(activeStep)}
                  </Box>

                  {/* Navegação Responsiva - não mostrar na página de obrigado */}
                  {activeStep < 5 && (
                    <ResponsiveNavigation
                      activeStep={activeStep}
                      totalSteps={steps.length - 1} // Excluir página de obrigado
                      onBack={handleBack}
                      onNext={handleNext}
                      onFinish={handleFinishSimulation}
                      onHome={handleRestart}
                      isLoading={isLoading}
                      canProceed={canProceed()}
                    />
                  )}
                </>
              )}
            </Box>
          </Paper>

          <PrivacyBanner />

          {/* Modal de Orçamento */}
          <BudgetRequestModal
            open={budgetModalOpen}
            onClose={() => setBudgetModalOpen(false)}
            userData={userData}
            simulationResults={{
              inputs,
              comparison: results.comparison
            }}
            onSubmit={handleBudgetRequest}
          />

          <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={() => setNotification(prev => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ mb: { xs: 10, sm: 2 } }}
          >
            <Alert 
              onClose={() => setNotification(prev => ({ ...prev, open: false }))}
              severity={notification.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;