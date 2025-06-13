import React, { forwardRef, useState } from 'react';
import { 
  Box, TextField, Typography, Card, CardContent, Grid,
  InputAdornment, Fade, Alert, FormHelperText
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const UserDataForm = forwardRef(({ userData, onChange, darkMode }, ref) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        return '';
      case 'email':
        if (!value.trim()) return 'E-mail é obrigatório';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'E-mail inválido';
        return '';
      case 'phone':
        if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) return 'Telefone inválido';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Atualizar dados
    const newUserData = {
      ...userData,
      [name]: value
    };
    onChange(newUserData);

    // Validar campo
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const getFieldError = (fieldName) => {
    return touched[fieldName] && errors[fieldName];
  };

  const isFormValid = () => {
    const requiredFields = ['name', 'email'];
    return requiredFields.every(field => 
      userData[field]?.trim() && !errors[field]
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
          Seus Dados
        </Typography>
        
        <Typography variant="body1" sx={{
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
          mb: 4,
          maxWidth: 600,
          mx: 'auto'
        }}>
          Para gerar seu relatório personalizado de economia de água, precisamos de algumas informações básicas.
        </Typography>

        <Card sx={{
          maxWidth: 600,
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
                Dados válidos! Você pode prosseguir para a próxima etapa.
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  required
                  error={!!getFieldError('name')}
                  helperText={getFieldError('name')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color={getFieldError('name') ? 'error' : 'primary'} />
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-mail"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  required
                  error={!!getFieldError('email')}
                  helperText={getFieldError('email') || 'Usaremos para enviar seu relatório'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color={getFieldError('email') ? 'error' : 'primary'} />
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Empresa"
                  name="company"
                  value={userData.company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon color="primary" />
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
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  error={!!getFieldError('phone')}
                  helperText={getFieldError('phone')}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon color={getFieldError('phone') ? 'error' : 'primary'} />
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
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="state"
                  value={userData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="primary" />
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
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                * Campos obrigatórios
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Fade>
  );
});

UserDataForm.displayName = 'UserDataForm';

export default UserDataForm;