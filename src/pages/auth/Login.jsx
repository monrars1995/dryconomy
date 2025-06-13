import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Container, 
  CssBaseline, 
  Avatar, 
  CircularProgress,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  useTheme
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const Login = () => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obter o caminho de redirecionamento da URL, se houver
  const from = location.state?.from || '/admin';
  
  // Efeito para redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('Login.jsx: Usuário autenticado, redirecionando...', { user });
      navigate(from);
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Chamar signIn e lidar com o retorno
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        throw signInError;
      }
      
      // O redirecionamento será tratado pelo useEffect quando isAuthenticated mudar
      console.log('Login.jsx handleSubmit: Login bem-sucedido, aguardando redirecionamento...');
    } catch (err) {
      console.error('Erro no login:', err);
      setError('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Se o usuário já estiver autenticado, não renderize o formulário de login
  if (isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #00337A 0%, #1976d2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
            background: 'white',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <img 
              src="/images/drylogo.png" 
              alt="Dryconomy Logo" 
              style={{ height: '60px', marginBottom: '16px' }} 
            />
            <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700, color: '#00337A' }}>
              Acesso Administrativo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Entre com suas credenciais para acessar o painel administrativo
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 2, 
                mb: 3, 
                py: 1.5, 
                borderRadius: 2,
                background: 'linear-gradient(45deg, #00337A 30%, #1976d2 90%)',
                boxShadow: '0 4px 20px rgba(0, 51, 122, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 25px rgba(0, 51, 122, 0.4)'
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink 
                component={Link} 
                to="/forgot-password" 
                variant="body2"
                sx={{ 
                  textDecoration: 'none',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Esqueceu sua senha?
              </MuiLink>
            </Box>
          </form>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="white">
            {new Date().getFullYear()} Dryconomy. Todos os direitos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;