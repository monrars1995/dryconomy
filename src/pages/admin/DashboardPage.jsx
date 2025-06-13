import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent,
  CircularProgress,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  WaterDrop as WaterDropIcon,
  Eco as EcoIcon,
  Business as BusinessIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../services/authService';

// Componente de cartão de métrica melhorado
const MetricCard = ({ title, value, icon, color, loading = false, subtitle, trend }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        borderLeft: `4px solid ${theme.palette[color].main}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              color="textSecondary"
              gutterBottom
              sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box height={48} display="flex" alignItems="center">
                <CircularProgress size={24} color={color} />
              </Box>
            ) : (
              <>
                <Typography 
                  variant="h3" 
                  component="div"
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette[color].main,
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                    lineHeight: 1.2,
                    mb: 1
                  }}
                >
                  {value}
                </Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
                {trend && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUpIcon 
                      fontSize="small" 
                      sx={{ 
                        color: trend > 0 ? 'success.main' : 'error.main',
                        mr: 0.5 
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: trend > 0 ? 'success.main' : 'error.main',
                        fontWeight: 600 
                      }}
                    >
                      {trend > 0 ? '+' : ''}{trend}% este mês
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${theme.palette[color].main}15`,
              borderRadius: '50%',
              width: isMobile ? 48 : 64,
              height: isMobile ? 48 : 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette[color].main,
              ml: 2
            }}
          >
            {React.cloneElement(icon, {
              fontSize: isMobile ? 'medium' : 'large'
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Componente de atividade recente
const RecentActivity = ({ activities, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" color="textSecondary">
          Nenhuma atividade recente encontrada.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {activities.map((activity, index) => (
        <Box 
          key={index}
          sx={{ 
            p: 2, 
            borderRadius: 2,
            '&:hover': { bgcolor: 'action.hover' },
            border: '1px solid',
            borderColor: 'divider',
            mb: 1,
            transition: 'all 0.3s ease'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {activity.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activity.description}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Chip 
                label={activity.type} 
                size="small" 
                color={activity.type === 'lead' ? 'primary' : 'secondary'}
                variant="outlined"
              />
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                {activity.time}
              </Typography>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalSimulations: 0,
    waterSaved: 0,
    loading: true
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar métricas do dashboard
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsError) throw leadsError;
      
      // Buscar simulações
      const { data: simulations, error: simulationsError } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (simulationsError) throw simulationsError;
      
      // Calcular métricas
      const totalLeads = leads?.length || 0;
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const newLeads = leads?.filter(lead => 
        new Date(lead.created_at) > lastWeek
      ).length || 0;
      
      const totalSimulations = simulations?.length || 0;
      
      // Calcular água economizada total (estimativa)
      const waterSaved = totalSimulations * 74044.8; // Média de economia por simulação
      
      setMetrics({
        totalLeads,
        newLeads,
        totalSimulations,
        waterSaved,
        loading: false
      });
      
      // Criar atividades recentes
      const activities = [];
      
      // Adicionar leads recentes
      leads?.slice(0, 3).forEach(lead => {
        activities.push({
          title: `Novo lead: ${lead.name}`,
          description: `${lead.email} - ${lead.company || 'Empresa não informada'}`,
          type: 'lead',
          time: new Date(lead.created_at).toLocaleDateString('pt-BR')
        });
      });
      
      // Adicionar simulações recentes
      simulations?.slice(0, 2).forEach(simulation => {
        activities.push({
          title: 'Nova simulação realizada',
          description: `Simulação de ${simulation.input_data?.capacity || 'N/A'} kW`,
          type: 'simulation',
          time: new Date(simulation.created_at).toLocaleDateString('pt-BR')
        });
      });
      
      // Ordenar por data
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 5));
      
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError('Erro ao carregar dados do dashboard. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Tentar Novamente
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={4}
        flexWrap="wrap"
        rowGap={2}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ 
            fontWeight: 700,
            color: 'primary.main',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
          }}>
            Dashboard Administrativo
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Bem-vindo(a) de volta! Aqui está um resumo das atividades do sistema.
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Métricas principais */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total de Leads" 
            value={metrics.loading ? '...' : metrics.totalLeads.toLocaleString('pt-BR')}
            icon={<PeopleIcon />}
            color="primary"
            loading={metrics.loading}
            subtitle="Leads capturados"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Novos (7 dias)" 
            value={metrics.loading ? '...' : metrics.newLeads}
            icon={<TrendingUpIcon />}
            color="success"
            loading={metrics.loading}
            subtitle="Leads recentes"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Simulações" 
            value={metrics.loading ? '...' : metrics.totalSimulations.toLocaleString('pt-BR')}
            icon={<AssessmentIcon />}
            color="info"
            loading={metrics.loading}
            subtitle="Total realizadas"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Água Economizada" 
            value={metrics.loading ? '...' : `${(metrics.waterSaved / 1000000).toFixed(1)}M L`}
            icon={<WaterDropIcon />}
            color="warning"
            loading={metrics.loading}
            subtitle="Potencial total"
            trend={25}
          />
        </Grid>
      </Grid>

      {/* Gráficos e dados detalhados */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Atividade recente */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" component="h3" sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}>
                <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                Atividade Recente
              </Typography>
              <Button 
                size="small" 
                color="primary"
                onClick={() => window.location.href = '/admin/leads'}
              >
                Ver Todos
              </Button>
            </Box>
            
            <RecentActivity activities={recentActivities} loading={loading} />
          </Paper>
        </Grid>

        {/* Estatísticas rápidas */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              height: '100%',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            <Typography variant="h6" component="h3" gutterBottom sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              mb: 3
            }}>
              <EcoIcon sx={{ mr: 1, color: 'success.main' }} />
              Impacto Ambiental
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Água economizada total
              </Typography>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: 'success.main',
                mb: 1
              }}>
                {(metrics.waterSaved / 1000000).toFixed(1)}M L
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={75} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'success.light',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main'
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary">
                75% da meta anual
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                CO₂ evitado (estimativa)
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: 'info.main'
              }}>
                {(metrics.waterSaved * 0.00058 / 1000).toFixed(1)} ton
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Economia financeira
              </Typography>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                color: 'warning.main'
              }}>
                R$ {(metrics.waterSaved * 0.0105).toLocaleString('pt-BR', { 
                  minimumFractionDigits: 0, 
                  maximumFractionDigits: 0 
                })}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Links rápidos */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
        }}
      >
        <Typography variant="h6" component="h3" gutterBottom sx={{ 
          fontWeight: 600,
          mb: 3
        }}>
          Acesso Rápido
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => window.location.href = '/admin/leads'}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                justifyContent: 'flex-start'
              }}
            >
              Gerenciar Leads
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<AssessmentIcon />}
              onClick={() => window.location.href = '/admin/variaveis'}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                justifyContent: 'flex-start'
              }}
            >
              Variáveis de Cálculo
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<BusinessIcon />}
              onClick={() => window.location.href = '/admin/cidades'}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                justifyContent: 'flex-start'
              }}
            >
              Gerenciar Cidades
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<TrendingUpIcon />}
              onClick={() => window.location.href = '/admin/webhooks'}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                justifyContent: 'flex-start'
              }}
            >
              Configurar Webhooks
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardPage;