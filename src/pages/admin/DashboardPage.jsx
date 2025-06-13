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
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getLeads } from '../../services/leadService';
import { getCalculationVariables } from '../../services/calculationService';

// Componente de cartão de métrica
const MetricCard = ({ title, value, icon, color, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Card 
      elevation={2} 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        borderLeft: `4px solid ${theme.palette[color].main}`
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography 
              variant="subtitle2" 
              color="textSecondary"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            {loading ? (
              <Box height={36} display="flex" alignItems="center">
                <CircularProgress size={24} color={color} />
              </Box>
            ) : (
              <Typography 
                variant="h4" 
                component="div"
                sx={{ 
                  fontWeight: 600,
                  color: theme.palette[color].dark
                }}
              >
                {value}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${theme.palette[color].light}80`,
              borderRadius: '50%',
              width: isMobile ? 40 : 56,
              height: isMobile ? 40 : 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.palette[color].main
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

// Componente de gráfico simples (placeholder)
const SimpleChart = ({ title, description, color }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        height: '100%',
        borderRadius: 2,
        borderTop: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box mb={2}>
        <Typography variant="h6" component="h3" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {description}
        </Typography>
      </Box>
      <Box 
        flexGrow={1} 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        sx={{
          backgroundImage: 'linear-gradient(45deg, #f5f5f5 25%, #ffffff 25%, #ffffff 50%, #f5f5f5 50%, #f5f5f5 75%, #ffffff 75%, #ffffff 100%)',
          backgroundSize: '20px 20px',
          borderRadius: 1,
          mt: 2
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Gráfico de {title.toLowerCase()} será exibido aqui
        </Typography>
      </Box>
    </Paper>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    newLeads: 0,
    conversionRate: 0,
    revenue: 0,
    loading: true
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar métricas iniciais
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Simulando chamadas assíncronas
        const [leadsData, variablesData] = await Promise.all([
          getLeads({ perPage: 100 }), // Ajuste conforme sua API
          getCalculationVariables()
        ]);

        // Processar métricas
        const totalLeads = leadsData.total || 0;
        const newLeads = leadsData.data?.filter(
          lead => new Date(lead.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0;
        
        // Encontrar a taxa de conversão nas variáveis de cálculo (exemplo)
        const conversionRateVar = variablesData.find(v => v.name === 'taxa_conversao');
        const conversionRate = conversionRateVar ? conversionRateVar.value * 100 : 0;
        
        // Calcular receita (exemplo simplificado)
        const revenue = 0; // Implementar lógica de receita
        
        // Atualizar estado
        setMetrics({
          totalLeads,
          newLeads,
          conversionRate,
          revenue,
          loading: false
        });
        
        // Definir leads recentes
        setRecentLeads(leadsData.data?.slice(0, 5) || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    // Implementar lógica de atualização
    window.location.reload();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexWrap="wrap"
        rowGap={2}
      >
        <Box>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
            Painel de Controle
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Bem-vindo(a) de volta, {user?.user_metadata?.full_name || 'Administrador'}! Aqui está um resumo das atividades.
          </Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Métricas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Total de Leads" 
            value={metrics.loading ? '...' : metrics.totalLeads.toLocaleString('pt-BR')}
            icon={<PeopleIcon />}
            color="primary"
            loading={metrics.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Novos (7 dias)" 
            value={metrics.loading ? '...' : metrics.newLeads}
            icon={<TrendingUpIcon />}
            color="success"
            loading={metrics.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Taxa de Conversão" 
            value={metrics.loading ? '...' : `${metrics.conversionRate.toFixed(1)}%`}
            icon={<AssessmentIcon />}
            color="info"
            loading={metrics.loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard 
            title="Receita (Mensal)" 
            value={metrics.loading ? '...' : `R$ ${metrics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<MoneyIcon />}
            color="warning"
            loading={metrics.loading}
          />
        </Grid>
      </Grid>

      {/* Gráficos e Dados */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <SimpleChart 
            title="Atividade de Leads"
            description="Evolução de novos leads nos últimos 30 dias"
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <SimpleChart 
            title="Status de Conversão"
            description="Distribuição dos leads por status"
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      {/* Leads Recentes */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          borderRadius: 2,
          borderTop: '4px solid #9c27b0'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h3">
            Leads Recentes
          </Typography>
          <Button 
            size="small" 
            color="primary"
            href="/admin/leads"
          >
            Ver Todos
          </Button>
        </Box>
        
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : recentLeads.length > 0 ? (
          <Box>
            <Box 
              display="grid" 
              gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }}
              gap={2}
              sx={{ 
                p: 2, 
                bgcolor: 'action.hover',
                borderRadius: 1,
                mb: 1,
                display: { xs: 'none', sm: 'grid' } 
              }}
            >
              <Typography variant="subtitle2">Nome</Typography>
              <Typography variant="subtitle2">E-mail</Typography>
              <Typography variant="subtitle2">Empresa</Typography>
              <Typography variant="subtitle2" sx={{ display: { xs: 'none', md: 'block' } }}>Data</Typography>
              <Typography variant="subtitle2" align="right">Status</Typography>
            </Box>
            
            {recentLeads.map((lead) => (
              <Box 
                key={lead.id}
                sx={{ 
                  p: 2, 
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 1
                }}
              >
                <Box 
                  display="grid"
                  gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }}
                  gap={2}
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ display: { sm: 'none' }, color: 'text.secondary' }}>Nome</Typography>
                    <Typography>{lead.name || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ display: { sm: 'none' }, color: 'text.secondary' }}>E-mail</Typography>
                    <Typography variant="body2">{lead.email || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ display: { sm: 'none' }, color: 'text.secondary' }}>Empresa</Typography>
                    <Typography variant="body2">{lead.company || '-'}</Typography>
                  </Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2">
                      {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    <Typography 
                      variant="body2"
                      sx={{
                        display: 'inline-block',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 
                          lead.status === 'novo' ? 'primary.light' :
                          lead.status === 'em_atendimento' ? 'warning.light' :
                          lead.status === 'convertido' ? 'success.light' :
                          'error.light',
                        color: 
                          lead.status === 'novo' ? 'primary.dark' :
                          lead.status === 'em_atendimento' ? 'warning.dark' :
                          lead.status === 'convertido' ? 'success.dark' :
                          'error.dark',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}
                    >
                      {lead.status.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary">
              Nenhum lead encontrado.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
