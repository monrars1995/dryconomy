import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartSimulation = () => {
    navigate('/simulador');
  };

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <WaterDropIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          Simulador de Economia de Água
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Calcule a economia de água que sua empresa pode ter com nossa solução
        </Typography>
        
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            mt: 4, 
            width: '100%',
            maxWidth: 800,
            textAlign: 'left'
          }}
        >
          <Typography variant="h5" gutterBottom>
            Como Funciona?
          </Typography>
          <Typography paragraph>
            Nosso simulador ajuda você a entender o potencial de economia de água na sua empresa.
            Basta preencher algumas informações básicas e nós faremos o resto!
          </Typography>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartSimulation}
              startIcon={<WaterDropIcon />}
              sx={{ py: 1.5, px: 4 }}
            >
              Iniciar Simulação
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;
