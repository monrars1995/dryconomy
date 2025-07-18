import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';

// Funções auxiliares para tratamento seguro de valores
const safeNumber = (value, defaultValue = 0) => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

const safeFormatNumber = (value) => {
  const num = safeNumber(value, 0);
  return new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(num);
};

const safeFormatValue = (value) => {
  const safeValue = safeNumber(value, 0);
  const millions = safeValue / 1000000;
  
  return millions >= 1 
    ? `${safeNumber(millions, 0).toFixed(2)} milhões` 
    : new Intl.NumberFormat('pt-BR').format(safeNumber(safeValue, 0).toFixed(1));
};

const formatPercentage = (value) => {
  const num = safeNumber(value, 0);
  return `${num.toFixed(2)}%`;
};

const WaterSavingsResults = ({ results = {}, darkMode = false }) => {
  console.log('Rendering WaterSavingsResults with results:', results);
  
  try {
    const theme = useTheme();
    const isXs = useMediaQuery('(max-width:600px)');
    const isSm = useMediaQuery('(max-width:960px)');
    const isMd = useMediaQuery('(max-width:1280px)');
    
    // Ensure results has the expected structure with safe defaults
    const safeResults = {
      comparison: {
        yearlyDifference: 0,
        yearlyDifferencePercentage: 0,
        ...(results.comparison || {})
      },
      ...results
    };

    const { 
      yearlyDifference = 0, 
      yearlyDifferencePercentage = 0 
    } = safeResults.comparison || {};

    // Safe values
    const safeYearlyDifference = safeNumber(yearlyDifference, 0);
    const safeYearlyPercentage = safeNumber(yearlyDifferencePercentage, 0);
    
    console.log('Safe values:', { safeYearlyDifference, safeYearlyPercentage });

    return (
      <Box sx={{ p: isXs ? 2 : 3 }}>
        <Typography variant="h4" gutterBottom>
          Resultados da Simulação
        </Typography>
        
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: isXs ? '1fr' : 'repeat(2, 1fr)',
          gap: 3,
          mt: 3
        }}>
          {/* Card de Economia Anual */}
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: darkMode ? 'rgba(0, 51, 122, 0.2)' : 'rgba(0, 51, 122, 0.05)',
            border: `1px solid ${darkMode ? 'rgba(0, 51, 122, 0.3)' : 'rgba(0, 51, 122, 0.1)'}`
          }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Economia Anual de Água
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', my: 2 }}>
              {safeFormatValue(safeYearlyDifference)} litros
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: safeYearlyPercentage >= 0 ? 'success.main' : 'error.main',
                fontWeight: 'medium'
              }}
            >
              {safeYearlyPercentage >= 0 ? 'Redução de ' : 'Aumento de '}
              {formatPercentage(Math.abs(safeYearlyPercentage))}
            </Typography>
          </Box>

          {/* Card de Equivalência */}
          <Box sx={{ 
            p: 3, 
            borderRadius: 2, 
            bgcolor: darkMode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)',
            border: `1px solid ${darkMode ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.1)'}`
          }}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Equivalência
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              Isso equivale a aproximadamente:
            </Typography>
            <ul style={{ paddingLeft: 20, margin: '10px 0' }}>
              <li>
                <Typography variant="body1">
                  {safeFormatNumber(safeYearlyDifference / 1000)} m³ de água
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  {safeFormatNumber(safeYearlyDifference / 5000)} caminhões-pipa
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  {safeFormatNumber(safeYearlyDifference / 1000000)} piscinas olímpicas
                </Typography>
              </li>
            </ul>
          </Box>
        </Box>
      </Box>
    );
  } catch (error) {
    console.error('Error in WaterSavingsResults:', error);
    
    return (
      <Box sx={{ 
        p: 3, 
        borderRadius: 2, 
        bgcolor: 'error.light',
        color: 'error.contrastText',
        textAlign: 'center',
        my: 3
      }}>
        <Typography variant="h6" gutterBottom>
          Ocorreu um erro ao carregar os resultados
        </Typography>
        <Typography variant="body2">
          Por favor, tente novamente ou entre em contato com o suporte.
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="caption" component="div" sx={{ mt: 2, fontFamily: 'monospace' }}>
            {error.message}
          </Typography>
        )}
      </Box>
    );
  }
};

export default WaterSavingsResults;
