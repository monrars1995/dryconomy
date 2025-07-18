import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery, 
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  WaterDrop as WaterDropIcon,
  LocalFireDepartment as EnergyIcon,
  Park as Co2Icon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Importar o componente WaterDropSVG do arquivo dedicado
import WaterDropSVG from './WaterDropSVG';

// Funções auxiliares para tratamento seguro de valores
const safeNumber = (value, defaultValue = 0) => {
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const safeFormatNumber = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(safeNumber(value));
};

const safeFormatValue = (value) => {
  const num = safeNumber(value);
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toFixed(2);
};

const formatPercentage = (value) => {
  const num = safeNumber(value);
  return `${num.toFixed(2)}%`;
};

const WaterSavingsResults = ({ results = null, darkMode = false, isLoading = false }) => {
  console.log('Rendering WaterSavingsResults with results:', results);
  const theme = useTheme();
  const isXs = useMediaQuery('(max-width:600px)');
  const [error, setError] = useState(null);
  
  // Check if results are empty, null, or undefined
  const hasNoResults = !results || (typeof results === 'object' && Object.keys(results).length === 0);
  
  // Handle loading state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 300,
        p: 4,
        textAlign: 'center'
      }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Carregando resultados...</Typography>
      </Box>
    );
  }
  
  // Handle error state
  if (error) {
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
        <Typography variant="body2" paragraph>
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
  
  // Handle no results state
  if (hasNoResults) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        color: darkMode ? 'text.secondary' : 'text.primary'
      }}>
        <Typography variant="h6" gutterBottom>
          Nenhum resultado disponível
        </Typography>
        <Typography variant="body1">
          Preencha o formulário para ver os resultados da simulação.
        </Typography>
      </Box>
    );
  }
  

  try {
    const isSm = useMediaQuery('(max-width:960px)');
    const isMd = useMediaQuery('(max-width:1280px)');
    
    // Ensure results has the expected structure with safe defaults
    const safeResults = results || {};
    const comparisonData = safeResults.comparison || {};
    
    // Destructure with safe defaults
    const { 
      yearly_difference: yearlyDifference = 0,
      yearly_difference_percentage: yearlyDifferencePercentage = 0,
      monthly_savings: monthlySavings = 0,
      yearly_savings: yearlySavings = 0,
      co2_savings: co2Savings = 0,
      energy_savings: energySavings = 0,
      water_savings: waterSavings = 0
    } = comparisonData;

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
  } catch (err) {
    console.error('Error in WaterSavingsResults:', err);
    // In a real app, you might want to log this to an error tracking service
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
          Erro ao processar os resultados
        </Typography>
        <Typography variant="body2">
          Ocorreu um erro ao processar os resultados da simulação. Por favor, tente novamente.
        </Typography>
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="caption" component="div" sx={{ mt: 2, fontFamily: 'monospace' }}>
            {err.message}
          </Typography>
        )}
      </Box>
    );
  }
};

export default WaterSavingsResults;
