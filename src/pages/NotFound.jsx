import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Box, Typography, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 6, textAlign: 'center', width: '100%', maxWidth: 600, mt: 4 }}>
          <Typography component="h1" variant="h1" color="primary" gutterBottom>
            404
          </Typography>
          <Typography variant="h4" component="h2" gutterBottom>
            Página não encontrada
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            A página que você está procurando pode ter sido removida, ter mudado de endereço ou estar temporariamente indisponível.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ mt: 3, mb: 2 }}
          >
            Voltar para o início
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound;
