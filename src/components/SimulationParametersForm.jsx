import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, TextField,
  InputAdornment, Fade, Alert, Slider, FormControl,
  InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Speed as SpeedIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

const SimulationParametersForm = ({ inputs, onChange, darkMode }) => {
  const [localInputs, setLocalInputs] = useState(inputs);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    const newInputs = {
      ...localInputs,
      [field]: value
    };
    setLocalInputs(newInputs);
    
    // Validar campo
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    // Se não há erro, propagar mudança
    if (!error) {
      onChange(newInputs);
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'capacity':
        if (!value || value <= 0) return 'Capacidade deve ser maior que zero';
        if (value > 10000) return 'Capacidade muito alta (máximo 10.000 kW)';
        return '';
      case 'operatingHours':
        if (!value || value <= 0) return 'Horas de operação devem ser maiores que zero';
        if (value > 24) return 'Máximo 24 horas por dia';
        return '';
      case 'operatingDays':
        if (!value || value <= 0) return 'Dias de operação devem ser maiores que zero';
        if (value > 365) return 'Máximo 365 dias por ano';
        return '';
      default:
        return '';
    }
  };

  const isFormValid = () => {
    const requiredFields = ['capacity', 'operatingHours', 'operatingDays'];
    return requiredFields.every(field => 
      localInputs[field] && localInputs[field] > 0 && !errors[field]
    );
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{
          color: darkMode ? '#fff' : '#00337A',
          mb: 2,
          fontWeight: 700
        }}>
          Parâmetros da Simulação
        </Typography>
        
        <Typography variant="body1" sx={{
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
          mb: 4,
          maxWidth: 600,
          mx: 'auto'
        }}>
          Configure os parâmetros técnicos do seu sistema de resfriamento para obter resultados precisos.
        </Typography>

        <Card sx={{
          maxWidth: 700,
          mx: 'auto',
          p: 3,
          background: darkMode 
            ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3
        }}>
          <CardContent>
            {isFormValid() && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Parâmetros configurados! Você pode prosseguir para a próxima etapa.
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* Capacidade Térmica */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SpeedIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Capacidade Térmica
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="Capacidade do Sistema"
                    type="number"
                    value={localInputs.capacity}
                    onChange={(e) => handleChange('capacity', Number(e.target.value))}
                    error={!!errors.capacity}
                    helperText={errors.capacity || 'Capacidade térmica total do sistema em kW'}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kW</InputAdornment>,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }
                    }}
                  />
                </Box>
              </Grid>

              {/* Horas de Operação */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Horas por Dia
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {localInputs.operatingHours} horas por dia
                  </Typography>
                  <Slider
                    value={localInputs.operatingHours}
                    onChange={(e, value) => handleChange('operatingHours', value)}
                    min={1}
                    max={24}
                    step={1}
                    marks={[
                      { value: 8, label: '8h' },
                      { value: 12, label: '12h' },
                      { value: 16, label: '16h' },
                      { value: 24, label: '24h' }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{
                      '& .MuiSlider-thumb': {
                        backgroundColor: 'primary.main',
                      },
                      '& .MuiSlider-track': {
                        backgroundColor: 'primary.main',
                      }
                    }}
                  />
                  {errors.operatingHours && (
                    <Typography variant="caption" color="error">
                      {errors.operatingHours}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Dias de Operação */}
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Dias por Ano
                    </Typography>
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel>Regime de Operação</InputLabel>
                    <Select
                      value={localInputs.operatingDays}
                      onChange={(e) => handleChange('operatingDays', e.target.value)}
                      label="Regime de Operação"
                      sx={{
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      <MenuItem value={250}>
                        <Box>
                          <Typography>250 dias/ano</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Operação comercial (segunda a sexta)
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={300}>
                        <Box>
                          <Typography>300 dias/ano</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Operação estendida (6 dias/semana)
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={365}>
                        <Box>
                          <Typography>365 dias/ano</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Operação contínua (24/7)
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  {errors.operatingDays && (
                    <Typography variant="caption" color="error">
                      {errors.operatingDays}
                    </Typography>
                  )}
                </Box>
              </Grid>

              {/* Resumo dos Parâmetros */}
              <Grid item xs={12}>
                <Card sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: darkMode ? 'rgba(0, 51, 122, 0.1)' : 'rgba(0, 51, 122, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(0, 51, 122, 0.2)' : 'rgba(0, 51, 122, 0.1)'}`
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Resumo da Configuração
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Capacidade Total
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {localInputs.capacity} kW
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Operação Diária
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {localInputs.operatingHours}h/dia
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="text.secondary">
                        Operação Anual
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {localInputs.operatingDays} dias/ano
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Total de horas anuais: {(localInputs.operatingHours * localInputs.operatingDays).toLocaleString()} horas
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default SimulationParametersForm;