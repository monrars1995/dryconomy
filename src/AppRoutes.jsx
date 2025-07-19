import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import SimulationsPanel from './pages/admin/SimulationsPanel';
import BudgetRequests from './pages/admin/BudgetRequests';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Componente AdminRoute para força redirecionamento para login
const AdminRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

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

// Componente para logar mudanças de rota
const RouteLogger = () => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Route changed to:', location.pathname);
  }, [location]);
  
  return null;
};

const AppRoutes = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <RouteLogger />
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/simulador" element={<Simulador />} />
            <Route path="/login" element={<Login />} />
            
            {/* Rotas Protegidas - Admin */}
            <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="variaveis" element={<CalculationVariables />} />
              <Route path="cidades" element={<Cities />} />
              <Route path="leads" element={<Leads />} />
              <Route path="simulacoes" element={<SimulationsPanel />} />
              <Route path="orcamentos" element={<BudgetRequests />} />
              <Route path="webhooks" element={<Webhooks />} />
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