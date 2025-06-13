import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  PlayArrow as PlayArrowIcon
} from '@mui/icons-material';

const ImprovedStepper = ({ 
  activeStep, 
  steps, 
  orientation = 'horizontal',
  showProgress = true,
  completedSteps = []
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const actualOrientation = isMobile ? 'vertical' : orientation;

  const getStepIcon = (index) => {
    if (completedSteps.includes(index)) {
      return <CheckCircleIcon color="success" />;
    } else if (index === activeStep) {
      return <PlayArrowIcon color="primary" />;
    } else {
      return <RadioButtonUncheckedIcon color="disabled" />;
    }
  };

  const getStepStatus = (index) => {
    if (completedSteps.includes(index)) return 'completed';
    if (index === activeStep) return 'active';
    if (index < activeStep) return 'completed';
    return 'pending';
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {showProgress && (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Progresso: {activeStep + 1} de {steps.length}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 4,
              backgroundColor: theme.palette.grey[200],
              borderRadius: 2,
              mt: 1,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: `${((activeStep + 1) / steps.length) * 100}%`,
                height: '100%',
                backgroundColor: theme.palette.primary.main,
                transition: 'width 0.3s ease',
                borderRadius: 2
              }}
            />
          </Box>
        </Box>
      )}

      <Stepper 
        activeStep={activeStep} 
        orientation={actualOrientation}
        sx={{
          '& .MuiStepLabel-root': {
            cursor: 'pointer',
          },
          '& .MuiStepLabel-label': {
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontWeight: 500,
          },
          '& .MuiStepLabel-label.Mui-active': {
            color: theme.palette.primary.main,
            fontWeight: 600,
          },
          '& .MuiStepLabel-label.Mui-completed': {
            color: theme.palette.success.main,
          }
        }}
      >
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          
          return (
            <Step key={step.label || step} completed={status === 'completed'}>
              <StepLabel
                icon={getStepIcon(index)}
                optional={
                  step.optional && (
                    <Chip 
                      label="Opcional" 
                      size="small" 
                      variant="outlined" 
                      color="default"
                    />
                  )
                }
              >
                <Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: status === 'active' ? 600 : 400,
                      color: status === 'active' ? 'primary.main' : 
                             status === 'completed' ? 'success.main' : 'text.secondary'
                    }}
                  >
                    {step.label || step}
                  </Typography>
                  {step.description && (
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
              
              {actualOrientation === 'vertical' && step.content && (
                <StepContent>
                  <Box sx={{ pb: 2 }}>
                    {step.content}
                  </Box>
                </StepContent>
              )}
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
};

export default ImprovedStepper;