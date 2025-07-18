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

// Componente principal do Simulador
const App = () => {
  const navigate = useNavigate();
  
  // Estados principais
  const [activeStep, setActiveStep] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
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
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
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
        
        // Carregar cidades
        const citiesResponse = await fetch('/api/cities');
        if (!citiesResponse.ok) throw new Error('Falha ao carregar cidades');
        const citiesData = await citiesResponse.json();
        setCities(citiesData);
        
        // Carregar dados adicionais se necessário
        // ...
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setSnackbar({
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

  // Carregar dados da cidade selecionada
  useEffect(() => {
    const loadCities = async () => {
      if (!inputs.location || !initialDataLoaded) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/cities/${encodeURIComponent(inputs.location)}`);
        if (!response.ok) throw new Error('Falha ao carregar dados da cidade');
        const cityData = await response.json();
        
        setCitiesData(prev => {
          const exists = prev.some(city => city.name === cityData.name);
          return exists ? prev : [...prev, cityData];
        });
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
      // Lógica de cálculo dos resultados
      // ...
      
      // Exemplo de resultado calculado
      const calculatedResults = {
        waterSavings: 0.5, // Exemplo: 50% de economia
        annualSavings: 10000, // Exemplo: R$ 10.000,00
        co2Reduction: 5000, // Exemplo: 5.000 kg de CO2
      };
      
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

  const handleCityChange = (cityData) => {
    setInputs(prev => ({
      ...prev,
      location: cityData.name,
      coordinates: cityData.coordinates
    }));
  };

  const handleFinishSimulation = () => {
    handleNext(); // Vai para a tela de agradecimento
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
            onStart={handleStartSimulation} 
            darkMode={darkMode} 
            onToggleDarkMode={() => setDarkMode(!darkMode)} 
          />
        );
      case 1:
        return (
          <UserDataForm 
            data={userData} 
            onChange={handleUserDataChange} 
            onNext={handleNext} 
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
            onNext={handleNext} 
            onBack={handleBack} 
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
          <ResponsiveNavigation 
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onHomeClick={() => {
              setActiveStep(0);
              navigate('/');
            }}
          />
          
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

export default App;
