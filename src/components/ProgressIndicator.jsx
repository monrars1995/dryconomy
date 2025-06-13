import React from 'react';
import { Box, LinearProgress, Typography, useTheme } from '@mui/material';

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels = [],
  showPercentage = true,
  showStepInfo = true 
}) => {
  const theme = useTheme();
  const progress = (currentStep / totalSteps) * 100;

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      {showStepInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {stepLabels[currentStep] || `Etapa ${currentStep + 1}`}
          </Typography>
          {showPercentage && (
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          )}
        </Box>
      )}
      
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          }
        }}
      />
      
      {showStepInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Etapa {currentStep + 1} de {totalSteps}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalSteps - currentStep - 1} restantes
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ProgressIndicator;