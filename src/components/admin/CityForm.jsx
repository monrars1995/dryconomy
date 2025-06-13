import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Typography,
  useTheme,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { addCity, updateCity } from '../../services/cityService';

const CityForm = ({ open, city, onClose, onSave }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    country: 'Brasil',
    water_consumption_year: '',
    water_consumption_year_conventional: '',
    average_temperature: '',
    capacity: '',
    tin: '41',
    tout: '35',
    water_flow: '',
    water_consumption_year_temp: '',
    makeup_water_temp: '',
    water_consumption_year_fan: '',
    makeup_water_fan_logic: '',
    water_consumption_fan_logic: '1.90'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Carregar dados da cidade para edição
  useEffect(() => {
    if (city) {
      setFormData({
        name: city.name || '',
        state: city.state || '',
        country: city.country || 'Brasil',
        water_consumption_year: city.water_consumption_year || '',
        water_consumption_year_conventional: city.water_consumption_year_conventional || '',
        average_temperature: city.average_temperature || '',
        capacity: city.capacity || '',
        tin: city.tin || '41',
        tout: city.tout || '35',
        water_flow: city.water_flow || '',
        water_consumption_year_temp: city.water_consumption_year_temp || '',
        makeup_water_temp: city.makeup_water_temp || '',
        water_consumption_year_fan: city.water_consumption_year_fan || '',
        makeup_water_fan_logic: city.makeup_water_fan_logic || '',
        water_consumption_fan_logic: city.water_consumption_fan_logic || '1.90'
      });
    } else {
      // Reset form quando estiver criando nova cidade
      setFormData({
        name: '',
        state: '',
        country: 'Brasil',
        water_consumption_year: '',
        water_consumption_year_conventional: '',
        average_temperature: '',
        capacity: '',
        tin: '41',
        tout: '35',
        water_flow: '',
        water_consumption_year_temp: '',
        makeup_water_temp: '',
        water_consumption_year_fan: '',
        makeup_water_fan_logic: '',
        water_consumption_fan_logic: '1.90'
      });
    }
    // Limpar erros
    setError(null);
    setValidationErrors({});
  }, [city, open]);

  // Atualizar campo do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro de validação deste campo
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulário
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'O nome da cidade é obrigatório';
    }
    
    if (formData.water_consumption_year && isNaN(Number(formData.water_consumption_year))) {
      errors.water_consumption_year = 'O consumo anual deve ser um número válido';
    }
    
    if (formData.water_consumption_year_conventional && isNaN(Number(formData.water_consumption_year_conventional))) {
      errors.water_consumption_year_conventional = 'O consumo anual convencional deve ser um número válido';
    }
    
    if (formData.average_temperature && isNaN(Number(formData.average_temperature))) {
      errors.average_temperature = 'A temperatura média deve ser um número válido';
    }
    
    if (formData.capacity && isNaN(Number(formData.capacity))) {
      errors.capacity = 'A capacidade deve ser um número válido';
    }
    
    if (formData.tin && isNaN(Number(formData.tin))) {
      errors.tin = 'A temperatura de entrada deve ser um número válido';
    }
    
    if (formData.tout && isNaN(Number(formData.tout))) {
      errors.tout = 'A temperatura de saída deve ser um número válido';
    }
    
    if (formData.water_flow && isNaN(Number(formData.water_flow))) {
      errors.water_flow = 'O fluxo de água deve ser um número válido';
    }
    
    if (formData.water_consumption_year_temp && isNaN(Number(formData.water_consumption_year_temp))) {
      errors.water_consumption_year_temp = 'O consumo anual temp deve ser um número válido';
    }
    
    if (formData.makeup_water_temp && isNaN(Number(formData.makeup_water_temp))) {
      errors.makeup_water_temp = 'O makeup water temp deve ser um número válido';
    }
    
    if (formData.water_consumption_year_fan && isNaN(Number(formData.water_consumption_year_fan))) {
      errors.water_consumption_year_fan = 'O consumo anual fan deve ser um número válido';
    }
    
    if (formData.makeup_water_fan_logic && isNaN(Number(formData.makeup_water_fan_logic))) {
      errors.makeup_water_fan_logic = 'O makeup water fan logic deve ser um número válido';
    }
    
    if (formData.water_consumption_fan_logic && isNaN(Number(formData.water_consumption_fan_logic))) {
      errors.water_consumption_fan_logic = 'O water consumption fan logic deve ser um número válido';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salvar cidade (criar nova ou atualizar existente)
  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Converter campos numéricos
      const dataToSave = {
        ...formData,
        water_consumption_year: formData.water_consumption_year ? Number(formData.water_consumption_year) : null,
        water_consumption_year_conventional: formData.water_consumption_year_conventional ? Number(formData.water_consumption_year_conventional) : null,
        average_temperature: formData.average_temperature ? Number(formData.average_temperature) : null
      };
      
      let response;
      
      if (city) {
        // Atualizar cidade existente
        response = await updateCity(city.id, dataToSave);
      } else {
        // Criar nova cidade
        response = await addCity(dataToSave);
      }
      
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao salvar cidade');
      }
      
      onSave();
    } catch (err) {
      console.error('Erro ao salvar cidade:', err);
      setError(err.message || 'Ocorreu um erro ao salvar a cidade. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={loading ? null : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[10]
        }
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          {city ? 'Editar Cidade' : 'Adicionar Nova Cidade'}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3} sx={{ mt: 0 }}>
          {/* Informações básicas */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Informações Básicas
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="name"
              label="Nome da Cidade *"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.name}
              helperText={validationErrors.name}
              required
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="state"
              label="Estado/Província"
              value={formData.state}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              placeholder="Ex: SP, RJ, MG"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="country"
              label="País"
              value={formData.country}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              placeholder="Ex: Brasil"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="average_temperature"
              label="Temperatura Média (°C)"
              value={formData.average_temperature}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.average_temperature}
              helperText={validationErrors.average_temperature}
              placeholder="Ex: 25"
            />
          </Grid>
          
          {/* Parâmetros de Consumo */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Parâmetros de Consumo de Água
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="water_consumption_year"
              label="Consumo Anual com Drycooler (L/ano)"
              value={formData.water_consumption_year}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.water_consumption_year}
              helperText={validationErrors.water_consumption_year}
              placeholder="Ex: 1000000"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="water_consumption_year_conventional"
              label="Consumo Anual com Torre (L/ano)"
              value={formData.water_consumption_year_conventional}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.water_consumption_year_conventional}
              helperText={validationErrors.water_consumption_year_conventional}
              placeholder="Ex: 2500000"
            />
          </Grid>
          
          {/* Parâmetros Técnicos */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Parâmetros Técnicos
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="capacity"
              label="Capacidade (kW)"
              value={formData.capacity}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.capacity}
              helperText={validationErrors.capacity}
              placeholder="Ex: 150.5"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="water_flow"
              label="Fluxo de Água (L/min)"
              value={formData.water_flow}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.water_flow}
              helperText={validationErrors.water_flow}
              placeholder="Ex: 22.5"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="tin"
              label="Temperatura de Entrada (°C)"
              value={formData.tin}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.tin}
              helperText={validationErrors.tin}
              placeholder="Ex: 41"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="tout"
              label="Temperatura de Saída (°C)"
              value={formData.tout}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.tout}
              helperText={validationErrors.tout}
              placeholder="Ex: 35"
            />
          </Grid>
          
          {/* Parâmetros Avançados */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Parâmetros Avançados
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="water_consumption_year_temp"
              label="Consumo Anual Temp (L/ano)"
              value={formData.water_consumption_year_temp}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.water_consumption_year_temp}
              helperText={validationErrors.water_consumption_year_temp}
              placeholder="Ex: 200"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="makeup_water_temp"
              label="Makeup Water Temp"
              value={formData.makeup_water_temp}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.makeup_water_temp}
              helperText={validationErrors.makeup_water_temp}
              placeholder="Ex: 0.15"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="water_consumption_year_fan"
              label="Consumo Anual Fan (L/ano)"
              value={formData.water_consumption_year_fan}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.water_consumption_year_fan}
              helperText={validationErrors.water_consumption_year_fan}
              placeholder="Ex: 400"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="makeup_water_fan_logic"
              label="Makeup Water Fan Logic"
              value={formData.makeup_water_fan_logic}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.makeup_water_fan_logic}
              helperText={validationErrors.makeup_water_fan_logic}
              placeholder="Ex: 0.25"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="water_consumption_fan_logic"
              label="Water Consumption Fan Logic"
              value={formData.water_consumption_fan_logic}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              disabled={loading}
              error={!!validationErrors.water_consumption_fan_logic}
              helperText={validationErrors.water_consumption_fan_logic}
              placeholder="Ex: 1.90"
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={loading}
          sx={{ borderRadius: 2, minWidth: 120 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : city ? 'Atualizar' : 'Adicionar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CityForm;
