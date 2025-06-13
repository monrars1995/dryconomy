import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();
  
  // Efeito para verificar a autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Aguardar um pouco para garantir que o estado seja atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [loading, isAuthenticated]);
  
  // Se estiver carregando ou verificando autenticação, mostra um indicador de carregamento
  if (loading || isCheckingAuth) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="#f5f5f5"
      >
        <img 
          src="/images/drylogo.png" 
          alt="DryCooler Logo" 
          style={{ height: 60, marginBottom: 24 }} 
        />
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }
  
  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Usuário não autenticado, redirecionando para /login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Se chegou até aqui, renderiza o componente filho
  return <Outlet />;
};

export default ProtectedRoute;