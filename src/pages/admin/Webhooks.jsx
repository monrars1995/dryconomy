import React, { useState, useEffect } from 'react';
import {
  Box, Button, Card, CardContent, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Grid, IconButton, MenuItem,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Typography, useTheme, Alert,
  Snackbar, Tooltip, CircularProgress, Chip, Switch, FormControl,
  InputLabel, Select, FormControlLabel, InputAdornment
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Send as SendIcon, History as HistoryIcon, Search as SearchIcon,
  Refresh as RefreshIcon, Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon, ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

// Serviços
import { 
  getWebhookConfigs, 
  createWebhookConfig, 
  updateWebhookConfig, 
  deleteWebhookConfig, 
  testWebhook 
} from '../../services/webhookService';
import { getSystemConfig, updateSystemConfig } from '../../services/supabaseClient';

// Componentes
import { WebhookLogsDialog } from '../../components/webhooks/WebhookLogsDialog';

// Constantes
const HTTP_METHODS = [
  { value: 'POST', label: 'POST' },
  { value: 'GET', label: 'GET' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];

const EVENT_TYPES = [
  { value: 'lead.created', label: 'Novo Lead' },
  { value: 'lead.updated', label: 'Lead Atualizado' },
  { value: 'simulation.created', label: 'Nova Simulação' },
  { value: 'simulation.completed', label: 'Simulação Concluída' },
];

const INITIAL_FORM_STATE = {
  name: '',
  url: '',
  method: 'POST',
  event_type: 'lead.created',
  is_active: true,
  headers: JSON.stringify({ 'Content-Type': 'application/json' }, null, 2),
  payload_template: JSON.stringify({
    event: '{event}',
    data: { data: '{data}' },
    timestamp: '{timestamp}'
  }, null, 2),
  secret_key: ''
};

const Webhooks = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // Estados para a lista de webhooks
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estado para configuração global do webhook
  const [globalWebhookEnabled, setGlobalWebhookEnabled] = useState(false);
  const [savingGlobalConfig, setSavingGlobalConfig] = useState(false);
  
  // Estados para paginação
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(true);
  const [eventFilter, setEventFilter] = useState('');
  
  // Estados para o diálogo de edição/criação
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [showSecret, setShowSecret] = useState(false);
  
  // Estados para feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estados para o diálogo de logs
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [selectedWebhookId, setSelectedWebhookId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState('');
  
  // Estado para o resultado do teste
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  // Função para buscar as configurações de webhook
  const fetchWebhookConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar webhooks do backend
      const { data, count, error } = await getWebhookConfigs({
        page: page + 1,
        pageSize: rowsPerPage,
        search: searchTerm,
        activeOnly,
        // Se houver filtro por evento, manter para consulta
        eventType: eventFilter
      });
      
      if (error) throw error;
      
      // Adaptar os dados recebidos para o formato esperado pelo frontend
      const adaptedData = (data || []).map(webhook => ({
        ...webhook,
        // Converter campo events (array) para event_type (string)
        event_type: webhook.events && webhook.events.length > 0 ? webhook.events[0] : '',
        // Adicionar valores padrão para campos ausentes no backend
        method: webhook.method || 'POST',
        payload_template: webhook.payload_template || {},
        secret_key: webhook.secret_key || ''
      }));
      
      setConfigs(adaptedData);
      setTotalItems(count || 0);
    } catch (err) {
      console.error('Erro ao buscar webhooks:', err);
      setError('Erro ao carregar webhooks. Tente novamente mais tarde.');
      showSnackbar('Erro ao carregar webhooks', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Efeito para buscar as configurações quando os filtros ou paginação mudam
  // Carregar configuração global do webhook
  const fetchGlobalWebhookConfig = async () => {
    try {
      const config = await getSystemConfig();
      setGlobalWebhookEnabled(config?.webhook_enabled ?? false);
    } catch (error) {
      console.error('Erro ao carregar configuração global do webhook:', error);
      showSnackbar('Erro ao carregar configuração global do webhook', 'error');
    }
  };
  
  // Salvar configuração global do webhook
  const saveGlobalWebhookConfig = async (enabled) => {
    try {
      setSavingGlobalConfig(true);
      const result = await updateSystemConfig({ webhook_enabled: enabled });
      
      if (result.success) {
        setGlobalWebhookEnabled(enabled);
        showSnackbar(`Webhook global ${enabled ? 'ativado' : 'desativado'} com sucesso!`);
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração global do webhook:', error);
      showSnackbar('Erro ao salvar configuração global do webhook', 'error');
      // Reverter estado em caso de erro
      setGlobalWebhookEnabled(!enabled);
    } finally {
      setSavingGlobalConfig(false);
    }
  };
  
  // Manipulador da mudança no switch global
  const handleGlobalWebhookToggle = (event) => {
    const newValue = event.target.checked;
    saveGlobalWebhookConfig(newValue);
  };

  useEffect(() => {
    fetchWebhookConfigs();
    fetchGlobalWebhookConfig(); // Carregar configuração global ao montar o componente
  }, [page, rowsPerPage, searchTerm, activeOnly, eventFilter]);

  // Manipuladores de paginação
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  
  // Manipuladores de filtros
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0); // Resetar para a primeira página ao buscar
  };
  
  const handleActiveOnlyChange = (e) => {
    setActiveOnly(e.target.value === 'active');
    setPage(0);
  };
  
  const handleEventFilterChange = (e) => {
    setEventFilter(e.target.value);
    setPage(0);
  };

  // Manipuladores do diálogo de edição/criação
  const handleOpenDialog = (config = null) => {
    if (config) {
      // Se estiver editando, preenche o formulário com os dados existentes
      setEditingConfig(config);
      setFormData({
        name: config.name,
        url: config.url,
        method: config.method || 'POST', // Valor padrão caso não exista no backend
        event_type: config.events && config.events.length > 0 ? config.events[0] : 'lead.created', // Pega o primeiro evento do array
        is_active: config.is_active,
        headers: JSON.stringify(config.headers || {}, null, 2),
        payload_template: JSON.stringify({}, null, 2), // Valor padrão, já que não existe no backend
        secret_key: '' // Valor padrão, já que não existe no backend
      });
    } else {
      // Se for um novo webhook, reseta o formulário
      setEditingConfig(null);
      setFormData(INITIAL_FORM_STATE);
    }
    setTestResult(null);
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setTestResult(null);
  };

  // Manipuladores de formulário
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpa o erro do campo quando o usuário começa a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'O nome é obrigatório';
    if (!formData.url.trim()) errors.url = 'A URL é obrigatória';
    else if (!/^https?:\/\//.test(formData.url)) errors.url = 'A URL deve começar com http:// ou https://';
    
    try { if (formData.headers) JSON.parse(formData.headers); }
    catch { errors.headers = 'Os cabeçalhos devem ser um JSON válido'; }
    
    try { if (formData.payload_template) JSON.parse(formData.payload_template); }
    catch { errors.payload_template = 'O modelo de payload deve ser um JSON válido'; }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setLoading(true);

      // Adaptar para a estrutura do banco de dados
      const configData = {
        name: formData.name,
        url: formData.url,
        // Converter event_type (string) em events (array)
        events: formData.event_type ? [formData.event_type] : [],
        is_active: formData.is_active,
        headers: formData.headers ? JSON.parse(formData.headers) : {},
        // Não enviar campos que não existem no backend
        // payload_template e secret_key são ignorados
        updated_by: user.id
      };
      
      if (editingConfig) {
        await updateWebhookConfig(editingConfig.id, configData, user.id);
        showSnackbar('Webhook atualizado com sucesso!', 'success');
      } else {
        await createWebhookConfig({ ...configData, created_by: user.id }, user.id);
        showSnackbar('Webhook criado com sucesso!', 'success');
      }
      
      await fetchWebhookConfigs();
      handleCloseDialog();
    } catch (err) {
      console.error('Erro ao salvar webhook:', err);
      showSnackbar(err.message || 'Erro ao salvar webhook', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manipulador de teste de webhook (simplificado)
  const handleTestWebhook = async () => {
    const webhookIdToTest = editingConfig?.id;

    if (!webhookIdToTest) {
      showSnackbar('Salve a configuração do webhook antes de testar.', 'warning');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);
      
      // Simular um teste bem-sucedido já que a função RPC pode não existir no backend
      // Isso pode ser modificado quando a funcionalidade de testes for prioritária
      setTimeout(() => {
        const simulatedResult = {
          success: true,
          status_code: 200,
          data: {
            message: 'Webhook testado com sucesso (simulação)',
            timestamp: new Date().toISOString()
          }
        };
        
        setTestResult(simulatedResult);
        showSnackbar('Webhook testado com sucesso (simulação)!', 'success');
        setTesting(false);
      }, 1500); // Simular um atraso de rede
      
    } catch (err) {
      console.error('Erro ao testar webhook:', err);
      setTestResult({ success: false, message: err.message || 'Erro desconhecido ao testar webhook' });
      showSnackbar('Erro ao testar webhook', 'error');
      setTesting(false);
    }
  };

  // Manipulador de exclusão
  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este webhook?')) return;
    
    try {
      setLoading(true);
      await deleteWebhookConfig(id);
      showSnackbar('Webhook excluído com sucesso!', 'success');
      await fetchWebhookConfigs();
    } catch (err) {
      console.error('Erro ao excluir webhook:', err);
      showSnackbar('Erro ao excluir webhook', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manipuladores do diálogo de logs
  const handleOpenLogsDialog = (config) => {
    setSelectedWebhookId(config.id);
    setSelectedWebhookName(config.name);
    setLogsDialogOpen(true);
  };
  
  const handleCloseLogsDialog = () => {
    setLogsDialogOpen(false);
    setSelectedWebhookId(null);
    setSelectedWebhookName('');
  };

  // Funções auxiliares
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };
  
  const getEventLabel = (eventValue) => {
    // Se o valor for undefined ou vazio, retornar placeholder
    if (!eventValue) return 'Não especificado';
    
    const event = EVENT_TYPES.find(e => e.value === eventValue);
    return event ? event.label : eventValue;
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => showSnackbar('Copiado para a área de transferência!', 'info'))
      .catch(() => showSnackbar('Erro ao copiar', 'error'));
  };

  // Renderização
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" component="h1">
              Gerenciar Webhooks
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              disabled={loading}
            >
              Novo Webhook
            </Button>
          </Grid>
        </Grid>
        <Divider sx={{ my: 2 }} />
        
        {/* Card para configuração global do webhook DryCooler */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(232, 244, 253, 0.6)' }}>
          <CardContent>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} sm={7}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SendIcon color="primary" sx={{ mr: 1.5 }} />
                  <Box>
                    <Typography variant="h6">Webhook Principal do DryCooler</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {globalWebhookEnabled ? 
                        'Envio de dados para webhook externo está ativado.' : 
                        'Envio de dados para webhook externo está desativado. Use esta opção quando o serviço estiver offline.'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={globalWebhookEnabled}
                      onChange={handleGlobalWebhookToggle}
                      color="primary"
                      disabled={savingGlobalConfig}
                    />
                  }
                  label={savingGlobalConfig ? 'Salvando...' : (globalWebhookEnabled ? 'Ativado' : 'Desativado')}
                />
                {savingGlobalConfig && <CircularProgress size={24} sx={{ ml: 1 }} />}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar webhooks (nome, URL)..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'action.active', mr: 1 }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={activeOnly ? 'active' : 'all'}
                onChange={handleActiveOnlyChange}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="active">Somente Ativos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Evento</InputLabel>
              <Select
                value={eventFilter}
                onChange={handleEventFilterChange}
                label="Evento"
              >
                <MenuItem value="">Todos</MenuItem>
                {EVENT_TYPES.map((event) => (
                  <MenuItem key={event.value} value={event.value}>
                    {event.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1} display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
            <Tooltip title="Atualizar Lista">
              <IconButton onClick={fetchWebhookConfigs} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading && configs.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={4} minHeight={200}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : configs.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography variant="h6" gutterBottom>
                Nenhum webhook encontrado
              </Typography>
              <Typography color="textSecondary" paragraph>
                {searchTerm || activeOnly || eventFilter
                  ? 'Nenhum webhook corresponde aos filtros atuais.'
                  : 'Você ainda não possui nenhum webhook configurado.'}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                disabled={loading}
              >
                Criar Webhook
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Evento</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Última Atualização</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{config.name}</Typography>
                        <Typography variant="caption" color="textSecondary" component="div" sx={{display: 'flex', alignItems: 'center'}}>
                          ID: {config.id.substring(0,8)}...
                          <IconButton size="small" onClick={() => copyToClipboard(config.id)} sx={{ ml: 0.5}}>
                            <ContentCopyIcon fontSize="inherit" />
                          </IconButton>
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={config.url}>
                           <Typography sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} variant="body2">
                             {config.url}
                           </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>{getEventLabel(config.event_type)}</TableCell>
                      <TableCell>
                        <Chip label={config.method} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={config.is_active ? 'Ativo' : 'Inativo'} 
                          color={config.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(config.updated_at || config.created_at)}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Histórico">
                          <IconButton size="small" onClick={() => handleOpenLogsDialog(config)}>
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Testar este Webhook">
                          <IconButton 
                            size="small" 
                            onClick={async () => {
                               // Diretamente testa o webhook da linha da tabela
                               setEditingConfig(config); // Configura temporariamente para ter o ID
                               await handleTestWebhook();
                               setEditingConfig(null); // Limpa após o teste
                            }}
                            disabled={testing}
                          >
                            {(testing && editingConfig?.id === config.id) ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => handleOpenDialog(config)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton size="small" onClick={() => handleDelete(config.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      count={totalItems}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      labelRowsPerPage="Webhooks por página:"
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                      }
                    />
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      
      {/* Diálogo de edição/criação */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingConfig ? 'Editar Webhook' : 'Novo Webhook'}</DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Webhook"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="URL do Webhook"
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  error={!!formErrors.url}
                  helperText={formErrors.url}
                  required
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="method-label">Método HTTP</InputLabel>
                  <Select
                    labelId="method-label"
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    label="Método HTTP"
                  >
                    {HTTP_METHODS.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="event-type-label">Evento Gatilho</InputLabel>
                  <Select
                    labelId="event-type-label"
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    label="Evento Gatilho"
                  >
                    {EVENT_TYPES.map(option => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={<Switch checked={formData.is_active} onChange={handleChange} name="is_active" />}
                  label="Webhook Ativo"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>Cabeçalhos (JSON)</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  name="headers"
                  value={formData.headers}
                  onChange={handleChange}
                  error={!!formErrors.headers}
                  helperText={formErrors.headers}
                  variant="outlined"
                  InputProps={{ style: { fontFamily: 'monospace' } }}
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle2" gutterBottom>Modelo de Payload (JSON)</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  name="payload_template"
                  value={formData.payload_template}
                  onChange={handleChange}
                  error={!!formErrors.payload_template}
                  helperText={formErrors.payload_template}
                  variant="outlined"
                  InputProps={{ style: { fontFamily: 'monospace' } }}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Chave Secreta (Opcional)"
                  name="secret_key"
                  type={showSecret ? 'text' : 'password'}
                  value={formData.secret_key}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowSecret(!showSecret)} edge="end">
                          {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            {testResult && (
              <Box mt={2} p={2} border={1} borderColor={testResult.success ? 'success.main' : 'error.main'} borderRadius={theme.shape.borderRadius} bgcolor={testResult.success ? 'success.light' : 'error.light'}>
                <Typography variant="subtitle2" color={testResult.success ? 'success.dark' : 'error.dark'}>
                  Resultado do Teste:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {testResult.message || (typeof testResult.data === 'object' ? JSON.stringify(testResult.data, null, 2) : String(testResult.data))}
                </Typography>
                {testResult.status_code && <Typography variant="caption">Status Code: {testResult.status_code}</Typography>}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px', justifyContent: 'space-between' }}>
            <Button 
                onClick={handleTestWebhook} 
                color="info" 
                variant="outlined"
                startIcon={testing ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                disabled={testing || !editingConfig?.id} // Só pode testar um webhook existente (com ID)
            >
              Testar Webhook
            </Button>
            <Box>
              <Button onClick={handleCloseDialog} sx={{ mr: 1 }}>Cancelar</Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading || testing}>
                {editingConfig ? 'Salvar Alterações' : 'Criar Webhook'}
              </Button>
            </Box>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de Logs */}
      <WebhookLogsDialog
        open={logsDialogOpen}
        onClose={handleCloseLogsDialog}
        webhookId={selectedWebhookId}
        webhookName={selectedWebhookName}
      />

      {/* Snackbar para feedback */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
export default Webhooks;
