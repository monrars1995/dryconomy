import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Carregando...', 
  size = 40, 
  fullScreen = false,
  overlay = false 
}) => {
  const containerSx = fullScreen 
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
        zIndex: 9999,
        backdropFilter: overlay ? 'blur(2px)' : 'none'
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        p: 3
      };

  return (
    <Fade in timeout={300}>
      <Box sx={containerSx}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            backgroundColor: 'background.paper',
            borderRadius: 2,
            padding: 3,
            boxShadow: 3
          }}
        >
          <CircularProgress 
            size={size} 
            thickness={4}
            sx={{
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          {message && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontWeight: 500,
                textAlign: 'center',
                maxWidth: 200
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default LoadingSpinner;