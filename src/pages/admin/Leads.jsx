import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Typography, Paper, CircularProgress, TablePagination,
  Alert, TextField, InputAdornment, Grid, IconButton, Tooltip, Divider,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Avatar, useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { supabase } from '../../services/authService';

const Leads = () => {
  const theme = useTheme();
  
  // Estados para gerenciar os dados e paginação
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    newThisWeek: 0,
    converted: 0,
    conversionRate: 0
  });

  // Buscar leads do banco de dados
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;

      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' });

      // Aplicar filtro de busca
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      // Aplicar filtro de status
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      // Aplicar filtro de data
      if (dateFilter) {
        const now = new Date();
        let startDate;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = null;
        }
        
        if (startDate) {
          query = query.gte('created_at', startDate.toISOString());
        }
      }

      // Ordenar por data mais recente primeiro
      query = query.order('created_at', { ascending: false });

      // Aplicar paginação
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      setLeads(data || []);
      setTotalItems(count || 0);

      // Calcular estatísticas
      await calculateStats();

    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      setError('Erro ao carregar leads. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const calculateStats = async () => {
    try {
      // Total de leads
      const { count: total } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      // Leads da última semana
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { count: newThisWeek } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', lastWeek.toISOString());

      // Leads convertidos (assumindo que temos um status 'convertido')
      const { count: converted } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'convertido');

      const conversionRate = total > 0 ? (converted / total) * 100 : 0;

      setStats({
        total: total || 0,
        newThisWeek: newThisWeek || 0,
        converted: converted || 0,
        conversionRate: conversionRate
      });
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
    }
  };

  // Carregar leads ao iniciar o componente ou quando a paginação/busca mudar
  useEffect(() => {
    fetchLeads();
  }, [page, rowsPerPage, searchTerm, statusFilter, dateFilter]);

  // Manipuladores de paginação
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Manipulador de busca
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Copiar para a área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Copiado para a área de transferência');
      })
      .catch(err => {
        console.error('Erro ao copiar para a área de transferência:', err);
      });
  };

  // Abrir detalhes do lead
  const handleViewDetails = (lead) => {
    setSelectedLead(lead);
    setDetailsOpen(true);
  };

  // Fechar detalhes
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLead(null);
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    switch (status) {
      case 'novo': return 'primary';
      case 'em_atendimento': return 'warning';
      case 'convertido': return 'success';
      case 'perdido': return 'error';
      default: return 'default';
    }
  };

  // Obter label do status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'novo': return 'Novo';
      case 'em_atendimento': return 'Em Atendimento';
      case 'convertido': return 'Convertido';
      case 'perdido': return 'Perdido';
      default: return status || 'Novo';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="h1" sx={{ 
              fontWeight: 700,
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center'
            }}>
              <PersonIcon sx={{ mr: 1 }} />
              Gerenciar Leads
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Visualize e gerencie todos os leads capturados pelo simulador
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                sx={{ borderRadius: 2 }}
              >
                Exportar
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={fetchLeads}
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                Atualizar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total de Leads
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {stats.newThisWeek}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Novos (7 dias)
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                    {stats.converted}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Convertidos
                  </Typography>
                </Box>
                <BusinessIcon sx={{ fontSize: 40, color: 'warning.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {stats.conversionRate.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Taxa de Conversão
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar leads (nome, email, empresa)..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="novo">Novo</MenuItem>
                <MenuItem value="em_atendimento">Em Atendimento</MenuItem>
                <MenuItem value="convertido">Convertido</MenuItem>
                <MenuItem value="perdido">Perdido</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Período</InputLabel>
              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                label="Período"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="today">Hoje</MenuItem>
                <MenuItem value="week">Última semana</MenuItem>
                <MenuItem value="month">Este mês</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setDateFilter('');
              }}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              Limpar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabela */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {loading && leads.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : leads.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography variant="h6" gutterBottom>
                Nenhum lead encontrado
              </Typography>
              <Typography color="textSecondary" paragraph>
                {searchTerm || statusFilter || dateFilter
                  ? 'Nenhum lead corresponde aos critérios de busca.'
                  : 'Não há leads cadastrados no sistema.'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'primary.light' + '10' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Lead</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Contato</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Empresa</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ 
                            mr: 2, 
                            bgcolor: 'primary.main',
                            width: 40,
                            height: 40
                          }}>
                            {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {lead.name || '-'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {lead.state || 'Estado não informado'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Box display="flex" alignItems="center" mb={0.5}>
                            <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">{lead.email || '-'}</Typography>
                            {lead.email && (
                              <IconButton
                                size="small"
                                onClick={() => copyToClipboard(lead.email)}
                                sx={{ ml: 0.5 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          {lead.phone && (
                            <Box display="flex" alignItems="center">
                              <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">{lead.phone}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => copyToClipboard(lead.phone)}
                                sx={{ ml: 0.5 }}
                              >
                                <ContentCopyIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {lead.company || 'Não informado'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(lead.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(lead.status)}
                          color={getStatusColor(lead.status)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ver Detalhes">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewDetails(lead)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Enviar Email">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`mailto:${lead.email}`)}
                            disabled={!lead.email}
                            color="info"
                          >
                            <EmailIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ligar">
                          <IconButton
                            size="small"
                            onClick={() => window.open(`tel:${lead.phone}`)}
                            disabled={!lead.phone}
                            color="success"
                          >
                            <PhoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalItems}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Leads por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
              />
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog 
        open={detailsOpen} 
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        {selectedLead && (
          <>
            <DialogTitle sx={{ 
              borderBottom: `1px solid ${theme.palette.divider}`,
              pb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ 
                  mr: 2, 
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48
                }}>
                  {selectedLead.name?.charAt(0)?.toUpperCase() || 'L'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedLead.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Lead ID: {selectedLead.id}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informações de Contato
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Email
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedLead.email}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => copyToClipboard(selectedLead.email)}
                          sx={{ ml: 1 }}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Telefone
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {selectedLead.phone || 'Não informado'}
                        </Typography>
                        {selectedLead.phone && (
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(selectedLead.phone)}
                            sx={{ ml: 1 }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Empresa
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedLead.company || 'Não informado'}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Informações Adicionais
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Estado
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selectedLead.state || 'Não informado'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Data de Cadastro
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(selectedLead.created_at)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Status
                      </Typography>
                      <Chip
                        label={getStatusLabel(selectedLead.status)}
                        color={getStatusColor(selectedLead.status)}
                        size="small"
                      />
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Simulações
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                      Funcionalidade em desenvolvimento
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                onClick={handleCloseDetails} 
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                Fechar
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<EmailIcon />}
                onClick={() => window.open(`mailto:${selectedLead.email}`)}
                sx={{ borderRadius: 2 }}
              >
                Contatar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Leads;

export { Leads }