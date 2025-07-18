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
  const {
    activeStep,
    isLoading,
    cities,
    showSimulator,
    simulationStarted,
    completedSteps,
    budgetRequestData,
    notification,
    inputs,
    userData,
    results,
    selectedCity,
    budgetModalOpen,
    handleNext,
    handleBack,
    handleStartSimulation,
    handleRestart,
    handleUserDataChange,
    handleParametersChange,
    handleCityChange,
    handleFinishSimulation,
    handleBudgetRequest,
    canProceed,
    setNotification,
    setBudgetModalOpen,
  } = useSimulator();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

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
        default: darkMode ? '#121212' : '#fafafa',
        paper: darkMode ? '#1e1e1e' : '#ffffff'
      },
      text: {
        primary: darkMode ? '#ffffff' : '#1a1a1a',
        secondary: darkMode ? 'rgba(255,255,255,0.7)' : '#4a4a4a',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20'
      },
      action: {
        hover: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        selected: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
        disabled: darkMode ? 'rgba(255, 255, 255, 0.26)' : 'rgba(0, 0, 0, 0.26)',
        disabledBackground: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
      },
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
            boxShadow: darkMode 
              ? '0 8px 32px rgba(0,0,0,0.3)' 
              : '0 2px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
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
      }
    },
    shape: {
      borderRadius: 8
    }
  });

  const isXs = useMediaQuery('(max-width:600px)');

  const steps = [
    { label: 'Início', description: 'Bem-vindo ao simulador' },
    { label: 'Dados Pessoais', description: 'Suas informações de contato' },
    { label: 'Parâmetros', description: 'Configurações da simulação' },
    { label: 'Localização', description: 'Selecione sua cidade' },
    { label: 'Resultados', description: 'Análise de economia' },
    { label: 'Obrigado', description: 'Finalização' }
  ];

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
          cities={cities} 
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
            pb: { xs: 10, sm: 4 }
          }}
        >
          {isLoading && (
            <LoadingSpinner 
              fullScreen 
              overlay 
              message="Carregando dados..." 
            />
          )}
          
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
                  {activeStep < 5 && (
                    <ProgressIndicator
                      currentStep={activeStep}
                      totalSteps={steps.length - 1}
                      stepLabels={steps.slice(0, -1).map(s => s.label)}
                    />
                  )}

                  {activeStep < 5 && (
                    <ImprovedStepper
                      activeStep={activeStep}
                      steps={steps.slice(0, -1)}
                      completedSteps={completedSteps}
                      orientation={isXs ? 'vertical' : 'horizontal'}
                    />
                  )}

                  <Box sx={{ minHeight: '50vh', py: 4 }}>
                    {renderStepContent(activeStep)}
                  </Box>

                  {activeStep < 5 && (
                    <ResponsiveNavigation
                      activeStep={activeStep}
                      totalSteps={steps.length - 1}
                      onBack={() => activeStep === 0 ? navigate('/') : handleBack()}
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
