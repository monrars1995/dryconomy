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
import WaterSavingsResults from './components/WaterSavingsResults';
import PrivacyBanner from './components/PrivacyBanner';

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
    waterFlow: 71.7
  });
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    state: ''
  });

  // Estados para resultados
  const [results, setResults] = useState({
    drycooler: {
      moduleCapacity: 0,
      modules: 0,
      totalCapacity: 0,
      nominalWaterFlow: 0,
      evaporationPercentage: 0,
      evaporationFlow: 0,
      consumption: { hourly: 0, daily: 0, monthly: 0, yearly: 0 }
    },
    tower: {
      capacity: 0,
      consumption: { hourly: 0, daily: 0, monthly: 0, yearly: 0 }
    },
    savings: {
      water: { daily: 0, monthly: 0, yearly: 0 },
      cost: { daily: 0, monthly: 0, yearly: 0 },
      co2: { daily: 0, monthly: 0, yearly: 0 }
    },
    comparison: {
      yearlyDifference: 0,
      yearlyDifferencePercentage: 0
    }
  });

  const [citiesData, setCitiesData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // Configurações de tema melhoradas
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
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20'
      }
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
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
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
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

  // Constantes melhoradas
  const steps = [
    { label: 'Início', description: 'Bem-vindo ao simulador' },
    { label: 'Dados Pessoais', description: 'Suas informações de contato' },
    { label: 'Parâmetros', description: 'Configurações da simulação' },
    { label: 'Localização', description: 'Selecione sua cidade' },
    { label: 'Resultados', description: 'Análise de economia' }
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
          message: 'Erro ao carregar dados iniciais. Tente novamente mais tarde.',
          severity: 'error'
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
          console.log('Cidades carregadas do Supabase:', cities.length);
          
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
    setActiveStep(0);
    setCompletedSteps([]);
    // Reset form data
    setUserData({
      name: '',
      email: '',
      company: '',
      phone: '',
      state: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserDataChange = (newUserData) => {
    setUserData(newUserData);
    // Verificar se todos os campos obrigatórios estão preenchidos
    const requiredFields = ['name', 'email'];
    const isValid = requiredFields.every(field => newUserData[field]?.trim());
    
    if (isValid) {
      // Auto-avançar se dados válidos
      setTimeout(() => handleNext(), 500);
    }
  };

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
          tower: { consumption: results.tower.consumption },
          comparison: {
            yearlyDifference: results.comparison.yearlyDifference,
            yearlyDifferencePercentage: results.comparison.yearlyDifferencePercentage
          }
        },
        timestamp: new Date().toISOString(),
        location: inputs.location,
        capacity: inputs.capacity
      };

      await saveSimulation(simulationData);
      
      setNotification({
        open: true,
        message: 'Simulação salva com sucesso! Em breve entraremos em contato.',
        severity: 'success'
      });
      
      // Marcar última etapa como completa
      setCompletedSteps(prev => [...prev, activeStep]);
      
    } catch (error) {
      console.error('Erro ao finalizar simulação:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar a simulação. Tente novamente mais tarde.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <WelcomePage onStartSimulation={handleStartSimulation} darkMode={darkMode} />;
      case 1:
        return <UserDataForm userData={userData} onChange={handleUserDataChange} darkMode={darkMode} />;
      case 4:
        return <WaterSavingsResults results={results} inputs={inputs} darkMode={darkMode} />;
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
                : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
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
                  : 'rgba(0, 51, 122, 0.05)'
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
                  {/* Progress Indicator */}
                  <ProgressIndicator
                    currentStep={activeStep}
                    totalSteps={steps.length}
                    stepLabels={steps.map(s => s.label)}
                  />

                  {/* Stepper melhorado */}
                  <ImprovedStepper
                    activeStep={activeStep}
                    steps={steps}
                    completedSteps={completedSteps}
                    orientation={isXs ? 'vertical' : 'horizontal'}
                  />

                  {/* Conteúdo do Passo Atual */}
                  <Box sx={{ minHeight: '50vh', py: 4 }}>
                    {renderStepContent(activeStep)}
                  </Box>

                  {/* Navegação Responsiva */}
                  <ResponsiveNavigation
                    activeStep={activeStep}
                    totalSteps={steps.length}
                    onBack={handleBack}
                    onNext={handleNext}
                    onFinish={handleFinishSimulation}
                    onHome={handleRestart}
                    isLoading={isLoading}
                    canProceed={canProceed()}
                  />
                </>
              )}
            </Box>
          </Paper>

          <PrivacyBanner />

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