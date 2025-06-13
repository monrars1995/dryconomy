import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, TextField,
  InputAdornment, Fade, Alert, List, ListItem, ListItemText,
  ListItemIcon, Chip, Avatar, Autocomplete
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Thermostat as ThermostatIcon,
  Water as WaterIcon,
  Public as PublicIcon
} from '@mui/icons-material';

const CitySelectionForm = ({ cities, selectedCity, onChange, darkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleCitySelect = (city) => {
    onChange(city);
  };

  const filteredCities = cities.filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (city.state && city.state.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCityInfo = (city) => {
    if (!city) return null;
    
    return {
      waterConsumption: city.water_consumption_year || 'N/A',
      waterConsumptionConventional: city.water_consumption_year_conventional || 'N/A',
      averageTemperature: city.average_temperature || 'N/A',
      state: city.state || 'N/A',
      country: city.country || 'Brasil'
    };
  };

  return (
    <Fade in timeout={600}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{
          color: darkMode ? '#fff' : '#00337A',
          mb: 2,
          fontWeight: 700
        }}>
          Selecione sua Localização
        </Typography>
        
        <Typography variant="body1" sx={{
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
          mb: 4,
          maxWidth: 600,
          mx: 'auto'
        }}>
          A localização é importante para calcular com precisão o consumo de água baseado nas condições climáticas locais.
        </Typography>

        <Card sx={{
          maxWidth: 800,
          mx: 'auto',
          p: 3,
          background: darkMode 
            ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: 3
        }}>
          <CardContent>
            {selectedCity && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Cidade selecionada: {selectedCity.name}! Você pode prosseguir para ver os resultados.
              </Alert>
            )}

            {/* Campo de busca */}
            <Box sx={{ mb: 3 }}>
              <Autocomplete
                options={cities}
                getOptionLabel={(option) => `${option.name}${option.state ? `, ${option.state}` : ''}`}
                value={selectedCity}
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleCitySelect(newValue);
                  }
                }}
                onInputChange={(event, newInputValue) => {
                  setSearchTerm(newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar cidade"
                    placeholder="Digite o nome da sua cidade..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="primary" />
                        </InputAdornment>
                      ),
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
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body1">
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.state}, {option.country || 'Brasil'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                noOptionsText="Nenhuma cidade encontrada"
                loadingText="Carregando cidades..."
              />
            </Box>

            {/* Informações da cidade selecionada */}
            {selectedCity && (
              <Card sx={{
                mt: 3,
                p: 3,
                backgroundColor: darkMode ? 'rgba(0, 51, 122, 0.1)' : 'rgba(0, 51, 122, 0.05)',
                border: `1px solid ${darkMode ? 'rgba(0, 51, 122, 0.2)' : 'rgba(0, 51, 122, 0.1)'}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mr: 2,
                    width: 56,
                    height: 56
                  }}>
                    <LocationIcon fontSize="large" />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {selectedCity.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedCity.state}, {selectedCity.country || 'Brasil'}
                    </Typography>
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ThermostatIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Temperatura Média
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {getCityInfo(selectedCity)?.averageTemperature}°C
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <WaterIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Consumo DryCooler
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {getCityInfo(selectedCity)?.waterConsumption !== 'N/A' 
                          ? `${Number(getCityInfo(selectedCity)?.waterConsumption).toLocaleString()} L/ano`
                          : 'N/A'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <WaterIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Consumo Torre
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {getCityInfo(selectedCity)?.waterConsumptionConventional !== 'N/A' 
                          ? `${Number(getCityInfo(selectedCity)?.waterConsumptionConventional).toLocaleString()} L/ano`
                          : 'N/A'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <PublicIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Economia Estimada
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {getCityInfo(selectedCity)?.waterConsumption !== 'N/A' && 
                         getCityInfo(selectedCity)?.waterConsumptionConventional !== 'N/A'
                          ? `${(((Number(getCityInfo(selectedCity)?.waterConsumptionConventional) - 
                                 Number(getCityInfo(selectedCity)?.waterConsumption)) / 
                                 Number(getCityInfo(selectedCity)?.waterConsumptionConventional)) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Chip 
                    label="Dados climáticos locais aplicados"
                    color="primary"
                    variant="outlined"
                    icon={<LocationIcon />}
                  />
                </Box>
              </Card>
            )}

            {/* Lista de cidades populares se nenhuma estiver selecionada */}
            {!selectedCity && filteredCities.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  color: 'primary.main',
                  fontWeight: 600,
                  textAlign: 'left'
                }}>
                  Cidades Disponíveis
                </Typography>
                <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {filteredCities.slice(0, 10).map((city) => (
                    <ListItem
                      key={city.id}
                      button
                      onClick={() => handleCitySelect(city)}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        '&:hover': {
                          backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={city.name}
                        secondary={`${city.state || 'Estado não informado'}, ${city.country || 'Brasil'}`}
                      />
                      {city.average_temperature && (
                        <Chip 
                          label={`${city.average_temperature}°C`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {filteredCities.length === 0 && searchTerm && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Nenhuma cidade encontrada para "{searchTerm}". Tente buscar por uma cidade diferente.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
};

export default CitySelectionForm;