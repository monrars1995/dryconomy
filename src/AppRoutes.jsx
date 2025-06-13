import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './hooks/useAuth';

// Layouts
import AdminLayout from './pages/admin/AdminLayout';

// Pages
import HomePage from './pages/home/HomePage';
import Simulador from './App';
import Login from './pages/auth/Login';
import DashboardPage from './pages/admin/DashboardPage';
import CalculationVariables from './pages/admin/CalculationVariables';
import Cities from './pages/admin/Cities';
import Leads from './pages/admin/Leads';
import Webhooks from './pages/admin/Webhooks';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#00337A',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
    h4: {
      fontWeight: 500,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const AppRoutes = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas Protegidas - Admin */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/variaveis" element={<CalculationVariables />} />
                <Route path="/admin/cidades" element={<Cities />} />
                <Route path="/admin/leads" element={<Leads />} />
                <Route path="/admin/webhooks" element={<Webhooks />} />
              </Route>
            </Route>
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default AppRoutes;