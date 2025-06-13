import React, { useEffect } from 'react';
import { Box, Button, Typography, Fade, useTheme } from '@mui/material';
import { 
  Accessibility as AccessibilityIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  Contrast as ContrastIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';

const AccessibilityHelper = () => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const [fontSize, setFontSize] = React.useState(1);
  const [highContrast, setHighContrast] = React.useState(false);

  // Aplicar mudanças de acessibilidade
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}rem`;
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(prev + 0.1, 1.5));
  };

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(prev - 0.1, 0.8));
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      {/* Botão de acessibilidade fixo */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          minWidth: 48,
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          boxShadow: theme.shadows[4]
        }}
        aria-label="Opções de acessibilidade"
      >
        <AccessibilityIcon />
      </Button>

      {/* Painel de acessibilidade */}
      <Fade in={isOpen}>
        <Box
          sx={{
            position: 'fixed',
            top: 80,
            right: 20,
            zIndex: 999,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            boxShadow: theme.shadows[8],
            p: 2,
            minWidth: 250,
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="h6" gutterBottom>
            Acessibilidade
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Controle de fonte */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={decreaseFontSize}
                disabled={fontSize <= 0.8}
                aria-label="Diminuir tamanho da fonte"
              >
                <TextDecreaseIcon />
              </Button>
              <Typography variant="body2" sx={{ minWidth: 80, textAlign: 'center' }}>
                Fonte: {Math.round(fontSize * 100)}%
              </Typography>
              <Button
                size="small"
                onClick={increaseFontSize}
                disabled={fontSize >= 1.5}
                aria-label="Aumentar tamanho da fonte"
              >
                <TextIncreaseIcon />
              </Button>
            </Box>

            {/* Alto contraste */}
            <Button
              variant={highContrast ? 'contained' : 'outlined'}
              onClick={toggleHighContrast}
              startIcon={<ContrastIcon />}
              fullWidth
              size="small"
            >
              Alto Contraste
            </Button>

            {/* Leitura de tela */}
            <Button
              variant="outlined"
              onClick={() => speakText('Bem-vindo ao simulador Dryconomy. Use as teclas Tab para navegar e Enter para selecionar.')}
              startIcon={<VolumeUpIcon />}
              fullWidth
              size="small"
            >
              Ler Página
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Use Tab para navegar e Enter para selecionar
          </Typography>
        </Box>
      </Fade>

      {/* Estilos CSS para alto contraste */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%) brightness(120%);
        }
        .high-contrast * {
          text-shadow: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  );
};

export default AccessibilityHelper;