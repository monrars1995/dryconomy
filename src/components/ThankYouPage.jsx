import React from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button,
  Fade, Avatar, Divider, useTheme, useMediaQuery
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Download as DownloadIcon,
  Home as HomeIcon,
  Share as ShareIcon,
  WhatsApp as WhatsAppIcon
} from '@mui/icons-material';

const ThankYouPage = ({ userData, simulationResults, budgetRequested, onRestart, darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDownloadReport = () => {
    // Implementar download do relatório em PDF
    
  };

  const handleShareWhatsApp = () => {
    const message = `Acabei de fazer uma simulação no DryCooler e descobri que posso economizar ${simulationResults?.comparison?.yearlyDifference?.toLocaleString('pt-BR')} litros de água por ano! Isso representa uma redução de ${simulationResults?.comparison?.yearlyDifferencePercentage?.toFixed(1)}% no consumo. Confira: ${window.location.origin}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareEmail = () => {
    const subject = 'Resultados da Simulação DryCooler - Economia de Água';
    const body = `Olá!\n\nAcabei de fazer uma simulação no sistema DryCooler e gostaria de compartilhar os resultados:\n\n• Economia anual de água: ${simulationResults?.comparison?.yearlyDifference?.toLocaleString('pt-BR')} litros\n• Redução percentual: ${simulationResults?.comparison?.yearlyDifferencePercentage?.toFixed(1)}%\n• Capacidade simulada: ${simulationResults?.inputs?.capacity} kW\n• Localização: ${simulationResults?.inputs?.location}\n\nEssa economia representa um grande potencial de sustentabilidade e redução de custos!\n\nConheça mais sobre a solução em: ${window.location.origin}\n\nAtenciosamente,\n${userData?.name}`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <Fade in timeout={800}>
      <Box sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Ícone de sucesso principal */}
        <Box sx={{ mb: 4 }}>
          <Avatar sx={{ 
            width: { xs: 80, sm: 100, md: 120 },
            height: { xs: 80, sm: 100, md: 120 },
            bgcolor: 'success.main',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 32px rgba(46, 125, 50, 0.3)',
            animation: 'pulse 2s infinite'
          }}>
            <CheckCircleIcon sx={{ 
              fontSize: { xs: 40, sm: 50, md: 60 },
              color: 'white'
            }} />
          </Avatar>
          
          <Typography variant="h3" gutterBottom sx={{
            color: darkMode ? '#fff' : '#00337A',
            fontWeight: 800,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            mb: 2
          }}>
            Obrigado, {userData?.name?.split(' ')[0]}!
          </Typography>
          
          <Typography variant="h5" sx={{
            color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto',
            lineHeight: 1.4,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
          }}>
            {budgetRequested 
              ? 'Sua solicitação foi enviada com sucesso! Nossa equipe entrará em contato em breve.'
              : 'Sua simulação foi concluída com sucesso! Esperamos que os resultados sejam úteis.'
            }
          </Typography>
        </Box>

        {/* Card principal com resumo */}
        <Card sx={{
          maxWidth: 800,
          mx: 'auto',
          mb: 4,
          background: darkMode 
            ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: darkMode ? '0 12px 40px rgba(0,0,0,0.3)' : '0 12px 40px rgba(0,0,0,0.1)',
          borderRadius: 3,
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
        }}>
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Typography variant="h5" gutterBottom sx={{
              color: 'success.main',
              fontWeight: 700,
              mb: 3
            }}>
              🎉 Resultados da Sua Simulação
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(46, 125, 50, 0.1)' : 'rgba(46, 125, 50, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(46, 125, 50, 0.2)' : 'rgba(46, 125, 50, 0.1)'}`
                }}>
                  <Typography variant="h3" sx={{
                    color: 'success.main',
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', sm: '2.2rem' }
                  }}>
                    {simulationResults?.comparison?.yearlyDifference?.toLocaleString('pt-BR')} L
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Economia anual de água
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'}`
                }}>
                  <Typography variant="h3" sx={{
                    color: 'primary.main',
                    fontWeight: 800,
                    fontSize: { xs: '1.8rem', sm: '2.2rem' }
                  }}>
                    {simulationResults?.comparison?.yearlyDifferencePercentage?.toFixed(1)}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Redução no consumo
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Informações de contato */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{
                color: darkMode ? '#fff' : '#00337A',
                fontWeight: 600,
                mb: 2
              }}>
                {budgetRequested ? 'Próximos Passos' : 'Mantenha Contato'}
              </Typography>
              
              {budgetRequested ? (
                <Box sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: darkMode ? 'rgba(25, 118, 210, 0.1)' : 'rgba(25, 118, 210, 0.05)',
                  border: `1px solid ${darkMode ? 'rgba(25, 118, 210, 0.2)' : 'rgba(25, 118, 210, 0.1)'}`
                }}>
                  <Typography variant="body1" paragraph>
                    <strong>1.</strong> Nossa equipe comercial analisará sua simulação
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>2.</strong> Entraremos em contato em até 24 horas
                  </Typography>
                  <Typography variant="body1" paragraph>
                    <strong>3.</strong> Agendaremos uma reunião para apresentar a proposta personalizada
                  </Typography>
                  <Typography variant="body1">
                    <strong>4.</strong> Elaboraremos um orçamento detalhado baseado nas suas necessidades
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        contato@dryconomy.com
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        (11) 99999-9999
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="body2">
                        www.dryconomy.com
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Box>

            {/* Botões de ação */}
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadReport}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    background: 'linear-gradient(45deg, #00337A 30%, #1976d2 90%)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0, 51, 122, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Baixar Relatório
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="success"
                  startIcon={<WhatsAppIcon />}
                  onClick={handleShareWhatsApp}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(46, 125, 50, 0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Compartilhar
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  startIcon={<EmailIcon />}
                  onClick={handleShareEmail}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(25, 118, 210, 0.2)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Enviar por E-mail
                </Button>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="text"
                  color="inherit"
                  startIcon={<HomeIcon />}
                  onClick={onRestart}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Nova Simulação
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Mensagem final */}
        <Box sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          border: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
          maxWidth: 600,
          mx: 'auto'
        }}>
          <Typography variant="body1" sx={{
            color: darkMode ? 'rgba(255,255,255,0.8)' : 'text.secondary',
            fontStyle: 'italic',
            lineHeight: 1.6
          }}>
            "A sustentabilidade não é apenas uma responsabilidade, é uma oportunidade de inovação e economia. 
            Obrigado por escolher soluções que fazem a diferença para o meio ambiente e para o seu negócio."
          </Typography>
          <Typography variant="body2" sx={{
            color: 'primary.main',
            fontWeight: 600,
            mt: 2
          }}>
            — Equipe Dryconomy
          </Typography>
        </Box>

        {/* Animação CSS */}
        <style jsx>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(46, 125, 50, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 12px 40px rgba(46, 125, 50, 0.4);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(46, 125, 50, 0.3);
            }
          }
        `}</style>
      </Box>
    </Fade>
  );
};

export default ThankYouPage;