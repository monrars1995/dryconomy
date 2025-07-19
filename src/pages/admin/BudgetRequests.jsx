import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, Chip, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { supabase } from '../../services/authService';
import { useSnackbar } from 'notistack';
import DeleteConfirmDialog from '../../components/admin/DeleteConfirmDialog';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para visualizar detalhes do orçamento
const BudgetDetailsDialog = ({ open, onClose, budgetRequest }) => {
  if (!budgetRequest) return null;
  
  const { name, email, phone, company, additional_info, created_at, status, simulation_data } = budgetRequest;
  
  // Formatar dados da simulação para melhor visualização
  const formatSimulationData = () => {
    if (!simulation_data) return 'Dados não disponíveis';
    
    // Extrair inputs e results com validação
    const inputs = simulation_data.inputs || {};
    const results = simulation_data.results || {};
    
    return (
      <>
        <Typography variant="subtitle2" gutterBottom>Parâmetros da Simulação</Typography>
        <Box sx={{ ml: 2, mb: 2 }}>
          <Typography variant="body2">Localização: {typeof inputs.location === 'object' ? inputs.location?.name : inputs.location || 'N/A'}</Typography>
          <Typography variant="body2">Capacidade: {inputs.capacity || 'N/A'} litros/hora</Typography>
          <Typography variant="body2">Horas de operação: {inputs.hours || 'N/A'} horas/dia</Typography>
          <Typography variant="body2">Dias de operação: {inputs.days || 'N/A'} dias/mês</Typography>
        </Box>
        
        <Typography variant="subtitle2" gutterBottom>Resultados</Typography>
        <Box sx={{ ml: 2 }}>
          <Typography variant="body2">Economia anual: {results?.yearly_difference || 'N/A'} litros</Typography>
          <Typography variant="body2">Economia percentual: {results?.yearly_difference_percentage || 'N/A'}%</Typography>
          <Typography variant="body2">Economia financeira: R$ {results?.yearly_cost_savings || 'N/A'}</Typography>
        </Box>
      </>
    );
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes do Orçamento</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Informações do Cliente</Typography>
            <Box sx={{ ml: 2, mb: 3 }}>
              <Typography variant="body2"><strong>Nome:</strong> {name || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Email:</strong> {email || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Telefone:</strong> {phone || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Empresa:</strong> {company || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Data:</strong> {created_at ? format(new Date(created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'N/A'}</Typography>
              <Typography variant="body2"><strong>Status:</strong> {status || 'N/A'}</Typography>
            </Box>
            
            <Typography variant="subtitle1" gutterBottom>Informações Adicionais</Typography>
            <Box sx={{ ml: 2, mb: 3, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="body2">{additional_info || 'Nenhuma informação adicional fornecida.'}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>Dados da Simulação</Typography>
            <Box sx={{ ml: 2, p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              {formatSimulationData()}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => window.open(`mailto:${email}`)} startIcon={<EmailIcon />} variant="outlined" color="primary">
          Enviar Email
        </Button>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente para atualizar o status do orçamento
const UpdateStatusDialog = ({ open, onClose, budgetRequest, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (budgetRequest) {
      setStatus(budgetRequest.status || 'pending');
      // Limpar erro ao abrir diálogo
      setError(null);
    }
  }, [budgetRequest]);
  
  const handleUpdate = async () => {
    if (!budgetRequest?.id) {
      setError('ID do orçamento inválido');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error: supabaseError } = await supabase
        .from('budget_requests')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', budgetRequest.id);
        
      if (supabaseError) throw supabaseError;
      
      enqueueSnackbar('Status atualizado com sucesso!', { variant: 'success' });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError(err.message || 'Erro ao atualizar status do orçamento');
      enqueueSnackbar('Erro ao atualizar status', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={loading ? null : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Atualizar Status do Orçamento</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label="Status"
            disabled={loading}
          >
            <MenuItem value="pending">Pendente</MenuItem>
            <MenuItem value="contacted">Contatado</MenuItem>
            <MenuItem value="proposal_sent">Proposta Enviada</MenuItem>
            <MenuItem value="negotiating">Em Negociação</MenuItem>
            <MenuItem value="closed_won">Fechado (Ganho)</MenuItem>
            <MenuItem value="closed_lost">Fechado (Perdido)</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button 
          onClick={handleUpdate} 
          color="primary" 
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Componente principal para gerenciar solicitações de orçamento
const BudgetRequests = () => {
  const [budgetRequests, setBudgetRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  // Função para carregar orçamentos do Supabase
  const loadBudgetRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('budget_requests')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setBudgetRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar solicitações de orçamento:', error);
      enqueueSnackbar('Erro ao carregar solicitações de orçamento', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadBudgetRequests();
  }, []);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Função para excluir um orçamento
  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;
    
    try {
      const { error } = await supabase
        .from('budget_requests')
        .delete()
        .eq('id', selectedBudget.id);
        
      if (error) throw error;
      
      enqueueSnackbar('Orçamento excluído com sucesso!', { variant: 'success' });
      loadBudgetRequests();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      enqueueSnackbar('Erro ao excluir orçamento', { variant: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  // Renderizar chip de status com cores diferentes
  const renderStatusChip = (status) => {
    // Configuração padrão caso status seja undefined ou null
    if (!status) {
      return <Chip color="default" size="small" label="Pendente" />;
    }
    
    // Mapeamento de status para configurações visuais
    const statusConfig = {
      'pending': { color: 'warning', label: 'Pendente', tooltip: 'Orçamento aguardando análise' },
      'contacted': { color: 'info', label: 'Contatado', tooltip: 'Cliente já foi contatado' },
      'proposal_sent': { color: 'primary', label: 'Proposta Enviada', tooltip: 'Proposta enviada ao cliente' },
      'negotiating': { color: 'secondary', label: 'Em Negociação', tooltip: 'Negociação em andamento' },
      'closed_won': { color: 'success', label: 'Fechado (Ganho)', tooltip: 'Negócio fechado com sucesso' },
      'closed_lost': { color: 'error', label: 'Fechado (Perdido)', tooltip: 'Oportunidade perdida' }
    };
    
    // Obter configuração para o status atual ou usar configuração padrão
    const config = statusConfig[status] || {
      color: 'default',
      label: status || 'Desconhecido',
      tooltip: 'Status não reconhecido pelo sistema'
    };
    
    // Retornar chip com tooltip
    return (
      <Tooltip title={config.tooltip}>
        <Chip 
          color={config.color} 
          size="small" 
          label={config.label}
          sx={{ fontWeight: 500 }}
        />
      </Tooltip>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Solicitações de Orçamento
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden', mt: 3 }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Carregando...</TableCell>
                </TableRow>
              ) : budgetRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Nenhuma solicitação de orçamento encontrada</TableCell>
                </TableRow>
              ) : (
                budgetRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((budget) => (
                    <TableRow key={budget.id} hover>
                      <TableCell>
                        {budget.created_at ? format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </TableCell>
                      <TableCell>{budget.name || 'N/A'}</TableCell>
                      <TableCell>{budget.email || 'N/A'}</TableCell>
                      <TableCell>{budget.phone || 'N/A'}</TableCell>
                      <TableCell>{budget.company || 'N/A'}</TableCell>
                      <TableCell>{renderStatusChip(budget.status)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Tooltip title="Ver Detalhes">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedBudget(budget);
                                setDetailsOpen(true);
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Atualizar Status">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedBudget(budget);
                                setUpdateStatusOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          <Tooltip title="Excluir">
                            <IconButton 
                              size="small"
                              onClick={() => {
                                setSelectedBudget(budget);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={budgetRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
        />
      </Paper>
      
      {/* Diálogo de detalhes */}
      <BudgetDetailsDialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)} 
        budgetRequest={selectedBudget}
      />
      
      {/* Diálogo de atualização de status */}
      <UpdateStatusDialog
        open={updateStatusOpen}
        onClose={() => setUpdateStatusOpen(false)}
        budgetRequest={selectedBudget}
        onUpdate={loadBudgetRequests}
      />
      
      {/* Diálogo de confirmação de exclusão */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteBudget}
        title="Excluir Solicitação de Orçamento"
        content="Tem certeza que deseja excluir esta solicitação de orçamento? Esta ação não poderá ser desfeita."
      />
    </Box>
  );
};

export default BudgetRequests;
