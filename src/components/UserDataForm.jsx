import React, { forwardRef } from 'react';
import { Box, TextField, Typography, Card, CardContent } from '@mui/material';

const UserDataForm = forwardRef(({ userData, onUserDataChange, darkMode }, ref) => {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onUserDataChange({
      ...userData,
      [name]: value
    });
  };

  return (
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom sx={{
        color: '#00337A',
        mb: 4,
        fontWeight: 700
      }}>
        Seus Dados
      </Typography>
      <Card sx={{
        maxWidth: 500,
        mx: 'auto',
        p: 3,
        background: darkMode 
          ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      }}>
        <CardContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              fullWidth
              label="Nome"
              name="name"
              value={userData.name}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Empresa"
              name="company"
              value={userData.company}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Telefone"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Estado"
              name="state"
              value={userData.state}
              onChange={handleChange}
              variant="outlined"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});

UserDataForm.displayName = 'UserDataForm';

export default UserDataForm;