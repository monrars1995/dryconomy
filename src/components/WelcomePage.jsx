import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  useMediaQuery, 
  useTheme,
  Card,
  CardActionArea,
  alpha
} from '@mui/material';
import { 
  Speed as SpeedIcon,
  EmojiNature as EcoIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Opacity as OpacityIcon
} from '@mui/icons-material';

// Importar o componente WaterDropSVG do arquivo WaterSavingsResults
import { WaterDropSVG } from './WaterSavingsResults';

const FeatureCard = ({ icon: Icon, title, description, darkMode }) => (
  <Card 
    sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
      },
      bgcolor: darkMode ? 'rgba(33, 43, 54, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
    }}
  >
    <CardActionArea sx={{ p: 3, height: '100%' }}>
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 60,
          height: 60,
          borderRadius: '50%',
          bgcolor: darkMode ? 'primary.dark' : 'primary.light',
          mb: 3,
          mx: 'auto'
        }}
      >
        {Icon === WaterDropSVG ? 
          <Icon sx={{ color: darkMode ? '#fff' : 'primary.contrastText', fontSize: 32 }} /> :
          <Icon sx={{ color: darkMode ? '#fff' : 'primary.contrastText', fontSize: 32 }} />
        }
      </Box>
      <Typography 
        variant="h6" 
        component="h3" 
        sx={{ 
          mb: 1.5, 
          fontWeight: 700,
          textAlign: 'center',
          color: darkMode ? '#fff' : 'text.primary'
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
          textAlign: 'center',
          lineHeight: 1.6
        }}
      >
        {description}
      </Typography>
    </CardActionArea>
  </Card>
);

const WelcomePage = ({ onStartSimulation, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const features = [
    {
      icon: OpacityIcon,
      title: 'Economia de Água',
      description: 'Reduza em até 60% o consumo de água na sua indústria com nossa tecnologia inovadora.'
    },
    {
      icon: SpeedIcon,
      title: 'Alta Eficiência',
      description: 'Sistemas otimizados que mantêm a eficiência mesmo nas condições mais desafiadoras.'
    },
    {
      icon: EcoIcon,
      title: 'Sustentabilidade',
      description: 'Soluções ecológicas que reduzem o impacto ambiental da sua operação industrial.'
    },
    {
      icon: MoneyIcon,
      title: 'Redução de Custos',
      description: 'Economize significativamente nos custos operacionais com manutenção reduzida.'
    }
  ];

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: darkMode 
        ? 'linear-gradient(135deg, #0a1929 0%, #1a2027 100%)' 
        : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      '&::before': {
        content: '""',
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage: darkMode 
          ? 'radial-gradient(circle at 10% 20%, rgba(25, 118, 210, 0.1) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(25, 118, 210, 0.1) 0%, transparent 20%)'
          : 'radial-gradient(circle at 10% 20%, rgba(25, 118, 210, 0.05) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(25, 118, 210, 0.05) 0%, transparent 20%)',
        zIndex: 0
      }
    }}>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 12 },
        overflow: 'hidden',
        zIndex: 1
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6} sx={{ position: 'relative', zIndex: 2 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  fontWeight: 800,
                  lineHeight: 1.2,
                  mb: 3,
                  color: darkMode ? '#fff' : 'text.primary',
                  '& span': {
                    color: theme.palette.primary.main,
                    display: 'inline-block'
                  }
                }}
              >
                Economize Água, <span>Economize Dinheiro</span>
              </Typography>
              
              <Typography
                variant="h6"
                sx={{
                  color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                  fontWeight: 400,
                  mb: 4,
                  fontSize: '1.25rem',
                  lineHeight: 1.6,
                  maxWidth: '90%'
                }}
              >
                Descubra como o sistema DryCooler pode revolucionar a eficiência hídrica da sua indústria, reduzindo custos e preservando recursos naturais.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onStartSimulation}
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Simular Agora
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    borderRadius: '50px',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    color: darkMode ? '#fff' : 'text.primary',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Saiba Mais
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ position: 'relative' }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  height: { xs: '300px', md: '400px' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  backgroundImage: 'url("/images/bg-aparelho.png")',
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.2))',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: '5%',
                    left: '5%',
                    right: '5%',
                    bottom: '5%',
                    border: `4px solid ${theme.palette.primary.main}`,
                    borderRadius: 4,
                    opacity: 0.6,
                    pointerEvents: 'none',
                    background: 'linear-gradient(45deg, transparent 20%, rgba(0, 51, 122, 0.1) 50%, transparent 80%)',
                    boxShadow: 'inset 0 0 20px rgba(0, 51, 122, 0.2)'
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: darkMode ? '#fff' : 'text.primary'
              }}
            >
              Por que escolher nossa solução?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                maxWidth: '700px',
                mx: 'auto',
                fontWeight: 400
              }}
            >
              Tecnologia avançada para otimizar o uso de água na sua indústria
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <FeatureCard 
                  icon={feature.icon} 
                  title={feature.title} 
                  description={feature.description}
                  darkMode={darkMode}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box sx={{ 
        py: 12, 
        background: darkMode 
          ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)' 
          : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700, 
              mb: 3,
              color: darkMode ? '#fff' : 'text.primary'
            }}
          >
            Pronto para economizar água e reduzir custos?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
              mb: 4,
              fontWeight: 400
            }}
          >
            Faça uma simulação gratuita e descubra o quanto sua indústria pode economizar
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={onStartSimulation}
            endIcon={<ArrowForwardIcon />}
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(25, 118, 210, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(25, 118, 210, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Iniciar Simulação Agora
          </Button>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box sx={{ 
        py: 4, 
        borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        mt: 'auto'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                © {new Date().getFullYear()} DryCooler. Todos os direitos reservados.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: { xs: 'center', md: 'flex-end' },
                gap: 3
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      cursor: 'pointer'
                    },
                    transition: 'color 0.3s ease'
                  }}
                >
                  Termos de Uso
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      cursor: 'pointer'
                    },
                    transition: 'color 0.3s ease'
                  }}
                >
                  Política de Privacidade
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      cursor: 'pointer'
                    },
                    transition: 'color 0.3s ease'
                  }}
                >
                  Contato
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default WelcomePage;