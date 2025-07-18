import { createTheme } from '@mui/material/styles';

// Tema personalizado para toda a área administrativa
const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#00337A', // Azul escuro para cor principal
      dark: '#002053',
      light: '#3D5B96',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F39730', // Laranja para cor secundária
      dark: '#D67D18',
      light: '#F6B05E',
      contrastText: '#000000',
    },
    background: {
      default: '#F4F7FC', // Fundo claro para a área administrativa
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333', // Texto escuro para garantir contraste adequado
      secondary: '#555555', // Texto secundário, também escuro para contraste
      disabled: '#999999',
    },
    success: {
      main: '#4CAF50',
      dark: '#3B873E',
      light: '#7BC67E',
    },
    warning: {
      main: '#FFC107',
      dark: '#FFA000',
      light: '#FFD54F',
    },
    error: {
      main: '#E53935',
      dark: '#C62828',
      light: '#EF5350',
    },
    info: {
      main: '#2196F3',
      dark: '#1565C0',
      light: '#64B5F6',
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      color: '#333333',
    },
    h2: {
      fontWeight: 700,
      color: '#333333',
    },
    h3: {
      fontWeight: 600,
      color: '#333333',
    },
    h4: {
      fontWeight: 600,
      color: '#333333',
    },
    h5: {
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontWeight: 600,
      color: '#333333',
    },
    subtitle1: {
      fontWeight: 500,
      color: '#333333',
    },
    subtitle2: {
      fontWeight: 500,
      color: '#333333',
    },
    body1: {
      color: '#333333',
    },
    body2: {
      color: '#555555',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#00337A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(0,0,0,0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: '#00337A',
          '&:hover': {
            backgroundColor: '#002053',
          },
        },
        outlinedPrimary: {
          borderColor: '#00337A',
          color: '#00337A',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F4F7FC',
          '& .MuiTableCell-head': {
            color: '#00337A',
            fontWeight: 600,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#333333', // Garantir que todas as células da tabela tenham texto escuro
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default adminTheme;
