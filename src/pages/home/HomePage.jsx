import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { 
  WaterDrop as WaterDropIcon,
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Eco as EcoIcon
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartSimulation = () => {
    navigate('/simulador');
  };

  const features = [
    {
      icon: <WaterDropIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Economia de Água',
      description: 'Calcule quanto sua empresa pode economizar em consumo de água'
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Simulação Precisa',
      description: 'Algoritmos avançados para resultados confiáveis'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'ROI Calculado',
      description: 'Veja o retorno sobre investimento em tempo real'
    },
    {
      icon: <EcoIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Sustentabilidade',
      description: 'Contribua para um futuro mais sustentável'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <img 
              src="/images/drylogo.png" 
              alt="Dryconomy Logo" 
              style={{ height: '80px', marginBottom: '24px' }} 
            />
            <Typography variant="h2" component="h1" gutterBottom sx={{ 
              fontWeight: 700,
              color: '#00337A',
              mb: 2
            }}>
              Simulador DryCooler
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 600 }}>
              Descubra o potencial de economia de água da sua empresa com nossa tecnologia inovadora
            </Typography>
          </Box>

          {/* CTA Principal */}
          <Box sx={{ mb: 8 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartSimulation}
              startIcon={<WaterDropIcon />}
              sx={{ 
                py: 2, 
                px: 4,
                fontSize: '1.2rem',
                borderRadius: 3,
                background: 'linear-gradient(45deg, #00337A 30%, #1976d2 90%)',
                boxShadow: '0 4px 20px rgba(0, 51, 122, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0, 51, 122, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Iniciar Simulação Gratuita
            </Button>
          </Box>

          {/* Features Grid */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ 
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Info Section */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              width: '100%',
              maxWidth: 800,
              textAlign: 'left',
              borderRadius: 3
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ 
              color: '#00337A',
              fontWeight: 600,
              textAlign: 'center',
              mb: 3
            }}>
              Como Funciona?
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    1. Dados da Empresa
                  </Typography>
                  <Typography variant="body2">
                    Informe os dados básicos da sua empresa e localização
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    2. Parâmetros Técnicos
                  </Typography>
                  <Typography variant="body2">
                    Configure os parâmetros do seu sistema de resfriamento
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                    3. Resultados
                  </Typography>
                  <Typography variant="body2">
                    Receba um relatório completo com potencial de economia
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={handleStartSimulation}
                sx={{ 
                  borderRadius: 3,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                Começar Agora
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;