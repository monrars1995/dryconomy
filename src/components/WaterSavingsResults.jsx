import React from 'react';
import { Box, Typography, Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { Opacity } from '@mui/icons-material';

// Componentes SVG personalizados
const WaterDropSVG = ({ sx = {} }) => {
  // Extrair valores primitivos do objeto sx
  const width = sx.fontSize || 48;
  const height = sx.fontSize || 48;
  const color = sx.color || 'currentColor';
  
  // Remover essas propriedades do objeto de estilo para evitar duplicação
  const { fontSize, ...restStyles } = sx;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill={color}
      style={restStyles}
    >
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/>
    </svg>
  );
};

const ParkSVG = ({ sx = {} }) => {
  // Extrair valores primitivos do objeto sx ou usar valores padrão
  const width = sx.fontSize || 24;
  const height = sx.fontSize || 24;
  
  // Remover a propriedade fontSize para não duplicar no style
  const { fontSize, ...restStyles } = sx;
  
  return (
    <img 
      src="/images/swimming-pool_939917.svg" 
      alt="Swimming Pool" 
      style={{ width: width, height: height, ...restStyles }}
    />
  );
};

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Funções auxiliares para tratar valores NaN ou inválidos
const safeNumber = (value) => {
  // Converte para número se for string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verifica se é um número válido e finito
  if (numValue === null || numValue === undefined || isNaN(numValue) || !isFinite(numValue)) {
    return 0;
  }
  
  // Garante que retorna um número positivo
  return Math.max(0, numValue);
};

const safeFormatNumber = (number) => {
  const safeValue = safeNumber(number);
  return new Intl.NumberFormat('pt-BR').format(safeValue.toFixed(1));
};

const safeFormatValue = (value) => {
  const safeValue = safeNumber(value);
  const millions = safeValue / 1000000;
  return millions >= 1 
    ? `${millions.toFixed(2)} milhões` 
    : new Intl.NumberFormat('pt-BR').format(safeValue.toFixed(1));
};

const WaterSavingsResults = ({ results, darkMode }) => {
  const theme = useTheme();
  const isXs = useMediaQuery('(max-width:600px)');
  const isSm = useMediaQuery('(max-width:960px)');
  const isMd = useMediaQuery('(max-width:1280px)');
  
  // Usar as funções seguras definidas acima
  const formatNumber = safeFormatNumber;
  const formatValue = safeFormatValue;
  
  // Formata um valor percentual para exibição, lidando com valores NaN, infinito ou null
  const formatPercentage = (value) => {
    if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
      return "--";
    }
    return `${value.toFixed(2)}%`;
  };

  // Calcular equivalências para contextualizar a economia
  const calculateEquivalents = (liters) => {
    // Valores aproximados para equivalências
    const showerLiters = 45; // Litros por banho de 5 minutos
    const poolLiters = 45000; // Litros em uma piscina média
    const bottleLiters = 1.5; // Litros em uma garrafa de água
    
    return {
      showers: Math.round(liters / showerLiters),
      pools: (liters / poolLiters).toFixed(1),
      bottles: Math.round(liters / bottleLiters)
    };
  };

  const equivalents = calculateEquivalents(results.comparison.yearlyDifference);

  // Função para formatar números com casas decimais
  const formatNumberWithDecimals = (value) => {
    // Converte para milhões e formata com 2 casas decimais
    const millions = value / 1000000;
    if (millions >= 1) {
      return `${millions.toFixed(2)}M`;
    }
    // Para valores menores que 1 milhão, mostra em milhares com 1 casa decimal
    const thousands = value / 1000;
    if (thousands >= 1) {
      return `${thousands.toFixed(1)}K`;
    }
    // Para valores menores que 1000, mostra com 1 casa decimal
    return value.toFixed(1);
  };

  // Customização do tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {`${entry.name}: ${formatNumberWithDecimals(entry.value)} litros`}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const getConsumptionChartData = () => {
    // Verificar se os dados existem e são válidos
    if (!results || !results.drycooler || !results.tower || 
        !results.drycooler.consumption || !results.tower.consumption) {
      return [];
    }

    const chartData = [
      {
        id: 'hourly',
        name: 'Por hora',
        Drycooler: safeNumber(results.drycooler.consumption.hourly),
        Torre: safeNumber(results.tower.consumption.hourly)
      },
      {
        id: 'daily',
        name: 'Por dia',
        Drycooler: safeNumber(results.drycooler.consumption.daily),
        Torre: safeNumber(results.tower.consumption.daily)
      },
      {
        id: 'monthly',
        name: 'Por mês',
        Drycooler: safeNumber(results.drycooler.consumption.monthly),
        Torre: safeNumber(results.tower.consumption.monthly)
      },
      {
        id: 'yearly',
        name: 'Por ano',
        Drycooler: safeNumber(results.drycooler.consumption.yearly),
        Torre: safeNumber(results.tower.consumption.yearly)
      }
    ];

    // Validar que todos os valores são números válidos
    return chartData.filter(item => 
      !isNaN(item.Drycooler) && !isNaN(item.Torre) && 
      isFinite(item.Drycooler) && isFinite(item.Torre)
    );
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom sx={{
        color: darkMode ? '#f8f9fa' : '#00337A',
        mb: { xs: 3, md: 4 },
        fontWeight: 800,
        textAlign: 'center',
        fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
        textShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
      }}>
        Resultados da Simulação
      </Typography>

      {/* Economia anual destacada - Card principal */}
      <Card sx={{
        mb: { xs: 3, md: 5 },
        background: darkMode 
          ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(145deg, #f8f9fa 0%, #e4e8eb 100%)',
        boxShadow: '0 8px 32px rgba(0, 51, 122, 0.15)',
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '8px',
          background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
        }} />
        <CardContent sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          py: { xs: 4, md: 5 },
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative'
        }}>
          {/* Background decorativo */}
          <Box sx={{
            position: 'absolute',
            top: 20,
            right: { xs: -100, md: 20 },
            width: { xs: 200, md: 300 },
            height: { xs: 200, md: 300 },
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25,118,210,0.05) 0%, rgba(25,118,210,0) 70%)',
            display: { xs: 'none', sm: 'block' },
            zIndex: 0
          }} />
          
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' },
            mb: { xs: 5, md: 0 },
            width: { xs: '100%', md: '45%' },
            zIndex: 1,
            position: 'relative'
          }}>
            <Box sx={{
              bgcolor: darkMode ? 'rgba(25,118,210,0.15)' : 'rgba(25,118,210,0.07)',
              py: 1,
              px: 2,
              borderRadius: 5,
              mb: 2,
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              <WaterDropSVG sx={{ 
                mr: 1, 
                fontSize: 24, 
                color: darkMode ? '#90caf9' : '#1976d2' 
              }} /> 
              <Typography sx={{ 
                color: darkMode ? '#90caf9' : '#1976d2', 
                fontWeight: 600,
                fontSize: '0.95rem'
              }}>
                ECONOMIA ANUAL DE ÁGUA
              </Typography>
            </Box>
            
            <Typography variant="h2" sx={{ 
              color: darkMode ? '#fff' : '#00337A',
              fontWeight: 800,
              my: 2,
              fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
              lineHeight: 1.1,
              textShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.3)' : 'none'
            }}>
              {formatNumber(results.comparison.yearlyDifference)} L
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: '450px',
              lineHeight: 1.6,
              fontSize: { xs: '0.95rem', md: '1.05rem' }
            }}>
              Ao escolher o sistema <strong>Aludry DryCooler</strong> você economiza esta expressiva quantidade de água por ano comparado a uma torre de resfriamento convencional, contribuindo para a sustentabilidade e redução de custos operacionais.
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'row' },
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            gap: { xs: 2, sm: 3, md: 4 },
            alignItems: 'center',
            justifyContent: { xs: 'center', md: 'flex-end' },
            width: { xs: '100%', md: '50%' }
          }}>
            <Box sx={{ 
              textAlign: 'center',
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(25,118,210,0.04)',
              p: 2,
              borderRadius: 2,
              minWidth: { xs: '90px', sm: '110px' }
            }}>
              <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom>
                Equivalente a
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: darkMode ? '#90caf9' : 'primary.main',
                fontSize: { xs: '1.5rem', sm: '1.8rem' }
              }}>
                {equivalents.showers.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                banhos
              </Typography>
            </Box>

            <Box sx={{ 
              textAlign: 'center',
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(25,118,210,0.04)',
              p: 2,
              borderRadius: 2,
              minWidth: { xs: '90px', sm: '110px' }
            }}>
              <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom>
                Equivalente a
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: darkMode ? '#90caf9' : 'primary.main',
                fontSize: { xs: '1.5rem', sm: '1.8rem' }
              }}>
                {equivalents.pools}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                piscinas
              </Typography>
            </Box>

            <Box sx={{ 
              textAlign: 'center',
              bgcolor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(25,118,210,0.04)',
              p: 2,
              borderRadius: 2,
              minWidth: { xs: '90px', sm: '110px' }
            }}>
              <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom>
                Equivalente a
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 700,
                color: darkMode ? '#90caf9' : 'primary.main',
                fontSize: { xs: '1.5rem', sm: '1.8rem' }
              }}>
                {equivalents.bottles.toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                garrafas
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Grid de equivalências para contextualizar a economia */}
      <Typography variant="h5" gutterBottom textAlign="center" sx={{
        color: darkMode ? '#f8f9fa' : '#00337A',
        mt: { xs: 3, sm: 4, md: 5 },
        mb: { xs: 2, sm: 2.5, md: 3 },
        fontWeight: 600,
        fontSize: { xs: '1.3rem', sm: '1.5rem', md: '1.75rem' }
      }}>
        O que significa essa economia?
      </Typography>
      
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{
            height: '100%',
            background: darkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0, 51, 122, 0.1)',
            transition: 'transform 0.3s ease',
            borderRadius: { xs: 2, md: 2.5 },
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0, 51, 122, 0.15)',
            }
          }}>
            <CardContent sx={{ 
              textAlign: 'center',
              p: { xs: 2, sm: 2.5, md: 3 }
            }}>
              <WaterDropSVG sx={{ 
                fontSize: { xs: 40, sm: 44, md: 48 }, 
                color: darkMode ? '#90caf9' : '#00337A', 
                mb: { xs: 1, md: 1.5 }
              }} />
              <Typography variant="h6" gutterBottom sx={{
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                fontWeight: 600,
                color: darkMode ? '#fff' : 'inherit'
              }}>
                {formatNumber(equivalents.showers)} banhos
              </Typography>
              <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                lineHeight: 1.4
              }}>
                Equivalente a {formatNumber(equivalents.showers)} banhos de 5 minutos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{
            height: '100%',
            background: darkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0, 51, 122, 0.1)',
            transition: 'transform 0.3s ease',
            borderRadius: { xs: 2, md: 2.5 },
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0, 51, 122, 0.15)',
            }
          }}>
            <CardContent sx={{ 
              textAlign: 'center',
              p: { xs: 2, sm: 2.5, md: 3 }
            }}>
              <ParkSVG sx={{ 
                fontSize: { xs: 40, sm: 44, md: 48 }, 
                color: darkMode ? '#90caf9' : '#00337A', 
                mb: { xs: 1, md: 1.5 }
              }} />
              <Typography variant="h6" gutterBottom sx={{
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                fontWeight: 600,
                color: darkMode ? '#fff' : 'inherit'
              }}>
                {equivalents.pools} piscinas
              </Typography>
              <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                lineHeight: 1.4
              }}>
                Equivalente a {equivalents.pools} piscinas de tamanho médio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card sx={{
            height: '100%',
            background: darkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0, 51, 122, 0.1)',
            transition: 'transform 0.3s ease',
            borderRadius: { xs: 2, md: 2.5 },
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0, 51, 122, 0.15)',
            }
          }}>
            <CardContent sx={{ 
              textAlign: 'center',
              p: { xs: 2, sm: 2.5, md: 3 }
            }}>
              <WaterDropSVG sx={{ 
                fontSize: { xs: 40, sm: 44, md: 48 }, 
                color: darkMode ? '#90caf9' : '#00337A', 
                mb: { xs: 1, md: 1.5 }
              }} />
              <Typography variant="h6" gutterBottom sx={{
                fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem' },
                fontWeight: 600,
                color: darkMode ? '#fff' : 'inherit'
              }}>
                {formatNumber(equivalents.bottles)} garrafas
              </Typography>
              <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'} sx={{
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                lineHeight: 1.4
              }}>
                Equivalente a {formatNumber(equivalents.bottles)} garrafas de água de 1,5L
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Comparação detalhada entre DryCooler e Torre */}
      <Typography variant="h5" gutterBottom sx={{
        color: darkMode ? '#f8f9fa' : '#00337A',
        mt: { xs: 5, md: 7 },
        mb: { xs: 3, md: 4 },
        fontWeight: 700,
        textAlign: 'center',
        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
      }}>
        Comparação Detalhada de Consumo
      </Typography>
      
      <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{
            height: '100%',
            background: darkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 24px rgba(0, 51, 122, 0.12)',
            borderRadius: { xs: 2, md: 3 },
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Barra superior colorida */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)'
            }} />
            
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 2, sm: 2.5, md: 3 }
              }}>
                <Box sx={{
                  width: { xs: 40, sm: 42, md: 45 },
                  height: { xs: 40, sm: 42, md: 45 },
                  borderRadius: '50%',
                  bgcolor: darkMode ? 'rgba(25,118,210,0.1)' : 'rgba(25,118,210,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: { xs: 1.5, sm: 2 }
                }}>
                  <WaterDropSVG sx={{ fontSize: { xs: 22, sm: 24, md: 26 }, color: darkMode ? '#90caf9' : '#1976d2' }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: darkMode ? '#e0e0e0' : '#00337A',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }
                }}>
                  Aludry DryCooler
                </Typography>
              </Box>
              
              <Box sx={{ 
                mt: { xs: 1.5, sm: 2 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, md: 2 },
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={6} sm={6}>
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Consumo por hora
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: darkMode ? '#fff' : 'inherit'
                      }}>
                        {formatNumber(results.drycooler.consumption.hourly)} L
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom>
                        Consumo diário
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatNumber(results.drycooler.consumption.daily)} L
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={6}>
                    <Box>
                      <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom>
                        Consumo mensal
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {formatNumber(results.drycooler.consumption.monthly)} L
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={6}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: darkMode ? 'rgba(25,118,210,0.1)' : 'rgba(25,118,210,0.05)',
                    }}>
                      <Typography variant="body2" color={darkMode ? '#90caf9' : '#1976d2'} gutterBottom>
                        Consumo anual
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: darkMode ? '#90caf9' : '#1976d2'
                      }}>
                        {formatNumber(results.drycooler.consumption.yearly)} L
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{
            height: '100%',
            background: darkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 8px 24px rgba(0, 51, 122, 0.12)',
            borderRadius: { xs: 2, md: 3 },
            border: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Barra superior colorida */}
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #f50057 0%, #ff4081 100%)'
            }} />
            
            <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: { xs: 2, sm: 2.5, md: 3 }
              }}>
                <Box sx={{
                  width: 45,
                  height: 45,
                  borderRadius: '50%',
                  bgcolor: darkMode ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Opacity sx={{ fontSize: 26, color: darkMode ? '#ff8a80' : '#f44336' }} />
                </Box>
                <Typography variant="h6" sx={{ 
                  color: darkMode ? '#e0e0e0' : '#00337A',
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' }
                }}>
                  Torre de Resfriamento
                </Typography>
              </Box>
              
              <Box sx={{ 
                mt: { xs: 1.5, sm: 2 },
                p: { xs: 1.5, sm: 2 },
                borderRadius: { xs: 1.5, md: 2 },
                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={6} sm={6}>
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Consumo por hora
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: darkMode ? '#fff' : 'inherit'
                      }}>
                        {formatNumber(results.tower.consumption.hourly)} L
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={6}>
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Consumo diário
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: darkMode ? '#fff' : 'inherit'
                      }}>
                        {formatNumber(results.tower.consumption.daily)} L
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={6}>
                    <Box>
                      <Typography variant="body2" color={darkMode ? 'rgba(255,255,255,0.6)' : 'text.secondary'} gutterBottom sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Consumo mensal
                      </Typography>
                      <Typography variant="body1" fontWeight={500} sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: darkMode ? '#fff' : 'inherit'
                      }}>
                        {formatNumber(results.tower.consumption.monthly)} L
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={6}>
                    <Box sx={{
                      p: { xs: 1.2, sm: 1.5 },
                      borderRadius: { xs: 1.2, md: 1.5 },
                      bgcolor: darkMode ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)',
                    }}>
                      <Typography variant="body2" color={darkMode ? '#ff8a80' : '#f44336'} gutterBottom sx={{
                        fontSize: { xs: '0.8rem', sm: '0.875rem' }
                      }}>
                        Consumo anual
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 700,
                        color: darkMode ? '#ff8a80' : '#f44336',
                        fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                      }}>
                        {formatNumber(results.tower.consumption.yearly)} L
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráfico de comparação de consumo */}
      <Typography variant="h5" gutterBottom sx={{
        color: darkMode ? '#f8f9fa' : '#00337A',
        mt: { xs: 5, md: 7 },
        mb: { xs: 3, md: 4 },
        fontWeight: 700,
        textAlign: 'center',
        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' }
      }}>
        Gráfico Comparativo de Consumo
      </Typography>
      
      <Card sx={{
        borderRadius: { xs: 2, md: 3 },
        boxShadow: '0 8px 24px rgba(0, 51, 122, 0.12)',
        p: { xs: 2, sm: 3, md: 4 },
        background: darkMode 
          ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'}`,
      }}>
        <Box sx={{ 
          height: { xs: 350, sm: 420, md: 500, lg: 550 }, 
          width: '100%'
        }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getConsumptionChartData()}
              layout="vertical" 
              margin={{ 
                top: 20, 
                right: 30, 
                left: 20, 
                bottom: 10 
              }}
            >
              <defs>
                <linearGradient id="colorDrycooler" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#42a5f5" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="colorTorre" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#f50057" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#ff4081" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                type="number" 
                tickFormatter={(value) => formatNumberWithDecimals(value)}
                axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                tick={{ 
                  fill: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  fontSize: isXs ? 10 : isSm ? 11 : 12
                }}
              />
              
              <YAxis 
                type="category" 
                dataKey="name" 
                width={isXs ? 90 : isSm ? 110 : 120}
                axisLine={{ stroke: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }}
                tick={{ 
                  fill: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  fontSize: isXs ? 10 : isSm ? 11 : 12
                }}
              />
              
              <Tooltip 
                formatter={(value) => [`${formatNumber(value)} L`, "Consumo de água"]}
                contentStyle={{
                  backgroundColor: darkMode ? '#333' : '#fff',
                  border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 8,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  color: darkMode ? '#fff' : 'inherit',
                  fontSize: isXs ? '12px' : '14px'
                }}
              />
              
              <Legend 
                verticalAlign="top" 
                height={isXs ? 40 : 50} 
                wrapperStyle={{
                  paddingBottom: isXs ? 15 : 20,
                  color: darkMode ? '#fff' : 'inherit',
                  fontSize: isXs ? '12px' : '14px'
                }}
              />
              
              <Bar
                dataKey="Drycooler"
                fill="url(#colorDrycooler)"
                name="DryCooler"
                radius={[0, isXs ? 4 : 8, isXs ? 4 : 8, 0]}
                barSize={isXs ? 20 : isSm ? 25 : 30}
              />
              
              <Bar
                dataKey="Torre"
                fill="url(#colorTorre)"
                name="Torre Convencional"
                radius={[0, isXs ? 4 : 8, isXs ? 4 : 8, 0]}
                barSize={isXs ? 20 : isSm ? 25 : 30}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card>
    </Box>
  );
};

export default WaterSavingsResults;