import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Divider,
  Paper,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
  Collapse,
  ListItemButton
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  Dashboard as DashboardIcon,
  Webhook as WebhookIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
  LocationCity as LocationCityIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 260;

const AdminLayout = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user && !userData) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;
          
          setUserData({
            ...user,
            role: profile?.role || 'user',
            fullName: profile?.full_name || 'Usuário'
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user, userData]);
  
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/admin/dashboard',
      active: location.pathname === '/admin/dashboard'
    },
    { 
      text: 'Leads', 
      icon: <PeopleIcon />, 
      path: '/admin/leads',
      active: location.pathname === '/admin/leads'
    },
    { 
      text: 'Cidades', 
      icon: <LocationCityIcon />, 
      path: '/admin/cidades',
      active: location.pathname === '/admin/cidades'
    },
    { 
      text: 'Webhooks', 
      icon: <WebhookIcon />, 
      path: '/admin/webhooks',
      active: location.pathname === '/admin/webhooks'
    },
    { 
      text: 'Configurações', 
      icon: <SettingsIcon />, 
      submenu: [
        { 
          text: 'Variáveis de Cálculo', 
          path: '/admin/variaveis',
          active: location.pathname === '/admin/variaveis'
        }
      ],
      active: location.pathname.includes('/admin/variaveis')
    }
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isXs) {
      setMobileOpen(false);
    }
  };

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/drylogo.png" 
            alt="DryCooler Logo" 
            style={{ height: 40, marginRight: 12 }} 
          />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
            DryCooler
          </Typography>
        </Box>
        {isXs && (
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        )}
      </Box>
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'white',
          mb: 2
        }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white', 
              color: 'primary.main',
              width: 40,
              height: 40
            }}
          >
            {userData?.fullName?.charAt(0) || 'U'}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {userData?.fullName || 'Usuário'}
            </Typography>
            <Typography variant="caption">
              {userData?.role === 'admin' ? 'Administrador' : 'Usuário'}
            </Typography>
          </Box>
        </Box>
      </Box>
      
      <List component="nav" sx={{ px: 2 }}>
        {menuItems.map((item) => (
          item.submenu ? (
            <React.Fragment key={item.text}>
              <ListItem 
                disablePadding
                button
                onClick={handleSettingsClick}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: item.active ? 'primary.main' : 'transparent',
                  '&:hover': {
                    bgcolor: item.active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemButton sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ 
                    color: item.active ? 'white' : 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ 
                      color: item.active ? 'white' : 'text.primary'
                    }}
                  />
                  {settingsOpen ? (
                    <ExpandLessIcon sx={{ color: item.active ? 'white' : 'inherit' }} />
                  ) : (
                    <ExpandMoreIcon sx={{ color: item.active ? 'white' : 'inherit' }} />
                  )}
                </ListItemButton>
              </ListItem>
              <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subitem) => (
                    <ListItem
                      key={subitem.text}
                      disablePadding
                      button
                      onClick={() => handleNavigation(subitem.path)}
                      sx={{
                        pl: 4,
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: subitem.active ? 'primary.light' : 'transparent',
                        '&:hover': {
                          bgcolor: subitem.active ? 'primary.main' : 'action.hover',
                        },
                      }}
                    >
                      <ListItemButton sx={{ borderRadius: 2 }}>
                        <ListItemText 
                          primary={subitem.text} 
                          sx={{ 
                            color: subitem.active ? 'white' : 'text.primary'
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ) : (
            <ListItem
              key={item.text}
              disablePadding
              button
              onClick={() => handleNavigation(item.path)}
              sx={{
                borderRadius: 2,
                mb: 1,
                bgcolor: item.active ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: item.active ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <ListItemButton sx={{ borderRadius: 2 }}>
                <ListItemIcon sx={{ 
                  color: item.active ? 'white' : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    color: item.active ? 'white' : 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <List sx={{ px: 2 }}>
        <ListItem
          disablePadding
          button
          component={Link}
          to="/"
          sx={{
            borderRadius: 2,
            mb: 1,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Ir para o Site" />
          </ListItemButton>
        </ListItem>
        
        <ListItem
          disablePadding
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'white',
            },
          }}
        >
          <ListItemButton sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: '#00337A',
          boxShadow: 3
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Painel Administrativo
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Configurações de conta">
              <IconButton
                onClick={handleProfileMenuOpen}
                color="inherit"
                size="small"
                sx={{ ml: 2 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                  {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                sx: { minWidth: 180 }
              }}
            >
              <MenuItem disabled>
                <Typography variant="body2">{userData?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isXs ? 'temporary' : 'permanent'}
          open={isXs ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.mode === 'dark' ? '#121212' : '#f5f5f5',
        }}
      >
        <Toolbar />
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3 },
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            borderRadius: 3
          }}
        >
          <Outlet />
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminLayout;