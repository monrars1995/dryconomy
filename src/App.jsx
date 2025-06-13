import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Box, Button, 
  Stepper, Step, StepLabel, CircularProgress, Snackbar, Alert,
  createTheme, ThemeProvider, useMediaQuery, IconButton
} from '@mui/material';
import { 
  KeyboardArrowLeft, KeyboardArrowRight, LightMode, DarkMode, 
  Home, Send 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Componentes do Simulador
import WelcomePage from './components/WelcomePage';
import UserDataForm from './components/UserDataForm';
import WaterSavingsResults from './components/WaterSavingsResults';
import PrivacyBanner from './components/PrivacyBanner';

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
  const [darkMode, setDarkMode] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulationStarted, setSimulationStarted] = useState(false);
  
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

  // Configurações de tema
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  });

  // Hooks de media query
  const isXs = useMediaQuery('(max-width:600px)');
  const isSm = useMediaQuery('(max-width:960px)');
  const isMd = useMediaQuery('(max-width:1280px)');

  // Constantes
  const steps = ['Início', 'Dados Pessoais', 'Capacidade Térmica', 'Localização', 'Resultados'];

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

  // Manipuladores de navegação
  const handleNext = () => {
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
    if (Object.values(newUserData).every(value => value.trim() !== '')) {
      handleNext();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await saveSimulation({
        ...inputs,
        userData,
        results
      });
      
      setNotification({
        open: true,
        message: 'Simulação salva com sucesso!',
        severity: 'success'
      });
      
      handleNext();
      
    } catch (error) {
      console.error('Erro ao salvar simulação:', error);
      setNotification({
        open: true,
        message: 'Erro ao salvar simulação. Tente novamente.',
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
        return <UserDataForm userData={userData} onChange={handleUserDataChange} />;
      case 4:
        return <WaterSavingsResults results={results} inputs={inputs} />;
      default:
        return <div>Conteúdo não disponível</div>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: 'background.default',
          color: 'text.primary',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 4,
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Paper
          elevation={darkMode ? 24 : 3}
          sx={{
            width: '100%',
            maxWidth: '1200px',
            borderRadius: 2,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Cabeçalho */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Box
              component="img"
              src="/images/drylogo.png"
              alt="Dryconomy"
              sx={{ height: 40, width: 'auto' }}
            />
            <Box>
              <IconButton
                onClick={() => setDarkMode(!darkMode)}
                color="inherit"
                aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
              >
                {darkMode ? <LightMode /> : <DarkMode />}
              </IconButton>
              {simulationStarted && (
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={handleRestart}
                  sx={{ ml: 1 }}
                >
                  Início
                </Button>
              )}
            </Box>
          </Box>

          {/* Conteúdo Principal */}
          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {!showSimulator ? (
              <WelcomePage onStartSimulation={handleStartSimulation} darkMode={darkMode} />
            ) : (
              <>
                {/* Stepper */}
                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel 
                  sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Conteúdo do Passo Atual */}
                <Box sx={{ minHeight: '50vh', py: 4 }}>
                  {renderStepContent(activeStep)}
                </Box>

                {/* Navegação */}
                <Box 
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    mt: 'auto'
                  }}
                >
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0 || isLoading}
                    startIcon={<KeyboardArrowLeft />}
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="contained"
                    onClick={activeStep === steps.length - 1 ? handleFinishSimulation : handleNext}
                    disabled={isLoading}
                    endIcon={activeStep === steps.length - 1 ? <Send /> : <KeyboardArrowRight />}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : activeStep === steps.length - 1 ? (
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

        <PrivacyBanner />

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ mb: 8 }}
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
  );
};

export default App;