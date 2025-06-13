import React from 'react';
import {
  Box,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Fab
} from '@mui/material';
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Send,
  Home,
  NavigateBefore,
  NavigateNext
} from '@mui/icons-material';

const ResponsiveNavigation = ({
  activeStep,
  totalSteps,
  onBack,
  onNext,
  onFinish,
  onHome,
  isLoading = false,
  canProceed = true,
  backLabel = 'Voltar',
  nextLabel = 'Próximo',
  finishLabel = 'Finalizar'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isLastStep = activeStep === totalSteps - 1;

  if (isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: theme.shadows[8]
        }}
      >
        {/* Botão Voltar */}
        <Tooltip title={backLabel}>
          <IconButton
            onClick={onBack}
            disabled={activeStep === 0 || isLoading}
            color="primary"
            size="large"
          >
            <NavigateBefore />
          </IconButton>
        </Tooltip>

        {/* Botão Home (centro) */}
        <Tooltip title="Ir para início">
          <Fab
            size="small"
            onClick={onHome}
            color="default"
            sx={{ 
              backgroundColor: 'background.default',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
          >
            <Home />
          </Fab>
        </Tooltip>

        {/* Botão Próximo/Finalizar */}
        <Tooltip title={isLastStep ? finishLabel : nextLabel}>
          <IconButton
            onClick={isLastStep ? onFinish : onNext}
            disabled={isLoading || !canProceed}
            color="primary"
            size="large"
            sx={{
              backgroundColor: isLastStep ? 'success.main' : 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: isLastStep ? 'success.dark' : 'primary.dark',
              },
              '&:disabled': {
                backgroundColor: 'action.disabled',
                color: 'action.disabled'
              }
            }}
          >
            {isLastStep ? <Send /> : <NavigateNext />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  // Desktop Navigation
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pt: 3,
        borderTop: `1px solid ${theme.palette.divider}`,
        mt: 'auto'
      }}
    >
      <Button
        onClick={onBack}
        disabled={activeStep === 0 || isLoading}
        startIcon={<KeyboardArrowLeft />}
        variant="outlined"
        size="large"
      >
        {backLabel}
      </Button>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={onHome}
          startIcon={<Home />}
          variant="text"
          color="inherit"
        >
          Início
        </Button>

        <Button
          variant="contained"
          onClick={isLastStep ? onFinish : onNext}
          disabled={isLoading || !canProceed}
          endIcon={isLastStep ? <Send /> : <KeyboardArrowRight />}
          size="large"
          color={isLastStep ? 'success' : 'primary'}
          sx={{
            minWidth: 120,
            '&:disabled': {
              backgroundColor: 'action.disabled'
            }
          }}
        >
          {isLoading ? 'Processando...' : (isLastStep ? finishLabel : nextLabel)}
        </Button>
      </Box>
    </Box>
  );
};

export default ResponsiveNavigation;