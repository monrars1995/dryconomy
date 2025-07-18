import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Funções auxiliares para tratamento seguro de valores
const safeNumber = (value) => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? 0 : num;
};

const safeFormatNumber = (value) => {
  const num = safeNumber(value);
  return new Intl.NumberFormat('pt-BR', { 
    minimumFractionDigits: 1,
    maximumFractionDigits: 1 
  }).format(num);
};

const safeFormatValue = (value) => {
  const safeValue = safeNumber(value);
  const millions = safeValue / 1000000;
  
  return millions >= 1 
    ? `${safeNumber(millions).toFixed(2)} milhões` 
    : new Intl.NumberFormat('pt-BR').format(safeNumber(safeValue).toFixed(1));
};

const formatPercentage = (value) => {
  const num = safeNumber(value);
  return `${num.toFixed(2)}%`;
};

const WaterSavingsResults = ({ results = {}, darkMode = false }) => {
  console.log('Rendering WaterSavingsResults with results:', results);
  
  try {
    const theme = useTheme();
    const isXs = useMediaQuery('(max-width:600px)');
    const isSm = useMediaQuery('(max-width:960px)');
    
    // Ensure safe access to results with defaults
    const safeResults = {
      comparison: {
        yearlyDifference: 0,
        yearlyDifferencePercentage: 0,
        ...(results.comparison || {})
      },
      drycooler: {
        consumption: {
          hourly: 0,
          daily: 0,
          monthly: 0,
          yearly: 0,
          ...(results.drycooler?.consumption || {})
        },
        ...(results.drycooler || {})
      },
      tower: {
        consumption: {
          hourly: 0,
          daily: 0,
          monthly: 0,
          yearly: 0,
          ...(results.tower?.consumption || {})
        },
        ...(results.tower || {})
      },
      ...results
    };

    const { 
      yearlyDifference = 0, 
      yearlyDifferencePercentage = 0 
    } = safeResults.comparison;

    // Calculate equivalents
    const calculateEquivalents = (liters) => {
      const safeLiters = safeNumber(liters);
      return {
        showers: Math.round(safeLiters / 45), // 45L per shower
        pools: (safeLiters / 45000).toFixed(1), // 45,000L per pool
        bottles: Math.round(safeLiters / 1.5) // 1.5L per bottle
      };
    };

    const equivalents = calculateEquivalents(yearlyDifference);

    // Prepare chart data
    const getChartData = () => {
      const { drycooler, tower } = safeResults;
      return [
        {
          name: 'Por hora',
          Drycooler: safeNumber(drycooler.consumption.hourly),
          Torre: safeNumber(tower.consumption.hourly)
        },
        {
          name: 'Por dia',
          Drycooler: safeNumber(drycooler.consumption.daily),
          Torre: safeNumber(tower.consumption.daily)
        },
        {
          name: 'Por mês',
          Drycooler: safeNumber(drycooler.consumption.monthly),
          Torre: safeNumber(tower.consumption.monthly)
        },
        {
          name: 'Por ano',
          Drycooler: safeNumber(drycooler.consumption.yearly),
          Torre: safeNumber(tower.consumption.yearly)
        }
      ];
    };

    const chartData = getChartData();

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
      if (!active || !payload || !payload.length) return null;
      
      return (
        <Box sx={{
          bgcolor: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)',
          p: 2,
          border: '1px solid',
          borderColor: darkMode ? 'grey.800' : 'grey.300',
          borderRadius: 1,
          boxShadow: 3
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {`${entry.name}: ${safeFormatNumber(entry.value)} litros`}
            </Typography>
          ))}
        </Box>
      );
    };

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
              {safeFormatValue(yearlyDifference)}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: yearlyDifference >= 0 ? 'success.main' : 'error.main',
                fontWeight: 'medium'
              }}
            >
              {yearlyDifference >= 0 ? 'Redução de ' : 'Aumento de '}
              {formatPercentage(Math.abs(yearlyDifferencePercentage))}
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
                  {safeFormatNumber(equivalents.showers)} banhos de 5 minutos
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  {safeFormatNumber(equivalents.pools)} piscinas olímpicas
                </Typography>
              </li>
              <li>
                <Typography variant="body1">
                  {safeFormatNumber(equivalents.bottles)} garrafas de água
                </Typography>
              </li>
            </ul>
          </Box>
        </Box>

        {/* Gráfico de Consumo */}
        <Box sx={{ mt: 4, height: isXs ? 300 : 400 }}>
          <Typography variant="h6" gutterBottom>
            Comparativo de Consumo
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => safeFormatNumber(value)}
                width={isXs ? 60 : 80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="Drycooler" 
                fill="#00337A"
                name="Drycooler"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="Torre" 
                fill="#2E7D32"
                name="Torre de Resfriamento"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
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
