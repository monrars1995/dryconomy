import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
  TablePagination
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getWebhookLogs } from '../../services/webhookService';

// Formata a data para exibição
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Formata a duração em milissegundos para um formato legível
const formatDuration = (ms) => {
  if (!ms && ms !== 0) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

// Componente para exibir o status do log
const LogStatus = ({ status }) => {
  const statusMap = {
    success: {
      label: 'Sucesso',
      icon: <CheckCircleIcon fontSize="small" />,
      color: 'success'
    },
    error: {
      label: 'Erro',
      icon: <ErrorIcon fontSize="small" />,
      color: 'error'
    },
    pending: {
      label: 'Pendente',
      icon: <HourglassEmptyIcon fontSize="small" />,
      color: 'warning'
    },
    failed: {
      label: 'Falha',
      icon: <ErrorIcon fontSize="small" />,
      color: 'error'
    }
  };

  const statusInfo = statusMap[status] || {
    label: status || 'Desconhecido',
    icon: null,
    color: 'default'
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {statusInfo.icon}
      <Chip
        label={statusInfo.label}
        size="small"
        color={statusInfo.color}
        variant="outlined"
      />
    </Box>
  );
};

// Componente para exibir os detalhes de um log
const LogDetails = ({ log }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!log) return null;

  const toggleExpand = () => setExpanded(!expanded);

  // Tenta fazer o parse dos dados JSON, retorna o original se falhar
  const safeJsonParse = (str, fallback = {}) => {
    if (!str) return fallback;
    try {
      return JSON.parse(str);
    } catch (e) {
      return str;
    }
  };

  // Formata os cabeçalhos para exibição
  const formatHeaders = (headers) => {
    if (!headers) return '{}';
    const parsed = safeJsonParse(headers, headers);
    return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed;
  };

  // Formata o corpo da requisição/resposta para exibição
  const formatBody = (body) => {
    if (!body) return '{}';
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return body;
    }
  };

  return (
    <>
      <TableRow 
        hover 
        onClick={toggleExpand}
        sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }}
      >
        <TableCell>
          <IconButton size="small">
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(log.created_at)}</TableCell>
        <TableCell>
          <LogStatus status={log.status} />
        </TableCell>
        <TableCell>{log.response_status || '-'}</TableCell>
        <TableCell>{formatDuration(log.duration_ms)}</TableCell>
        <TableCell>{log.attempt || 1}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Detalhes da Requisição
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  URL
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
                  {log.url || '-'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Cabeçalhos
                </Typography>
                <pre style={{
                  margin: 0,
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {formatHeaders(log.request_headers)}
                </pre>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Corpo da Requisição
                </Typography>
                <pre style={{
                  margin: 0,
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {formatBody(log.request_body)}
                </pre>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Resposta
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Cabeçalhos da Resposta
                </Typography>
                <pre style={{
                  margin: 0,
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {formatHeaders(log.response_headers)}
                </pre>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary" display="block">
                  Corpo da Resposta
                </Typography>
                <pre style={{
                  margin: 0,
                  padding: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
                  {formatBody(log.response_body)}
                </pre>
              </Box>
              
              {log.error_message && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Mensagem de Erro
                  </Typography>
                  <Typography variant="body2" color="error">
                    {log.error_message}
                  </Typography>
                </Box>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Componente principal do diálogo de logs
export const WebhookLogsDialog = ({ open, onClose, webhookId, webhookName }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Carrega os logs quando o diálogo é aberto ou a página muda
  const fetchLogs = async () => {
    if (!webhookId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await getWebhookLogs(webhookId, {
        page: page + 1,
        perPage: rowsPerPage
      });
      
      setLogs(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
      setError('Não foi possível carregar os logs. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && webhookId) {
      fetchLogs();
    }
  }, [open, webhookId, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="webhook-logs-dialog-title"
    >
      <DialogTitle id="webhook-logs-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <span>
            Logs de Webhook
            {webhookName && `: ${webhookName}`}
          </span>
          <Box>
            <Tooltip title="Atualizar">
              <IconButton onClick={handleRefresh} size="small" disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {error ? (
          <Box p={2} textAlign="center">
            <Typography color="error">{error}</Typography>
            <Button 
              onClick={fetchLogs} 
              variant="outlined" 
              color="primary" 
              startIcon={<RefreshIcon />}
              sx={{ mt: 2 }}
            >
              Tentar Novamente
            </Button>
          </Box>
        ) : loading && logs.length === 0 ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : logs.length === 0 ? (
          <Box p={2} textAlign="center">
            <Typography variant="subtitle1" color="textSecondary">
              Nenhum log encontrado para este webhook.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label="logs table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Data/Hora</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Código</TableCell>
                  <TableCell>Duração</TableCell>
                  <TableCell>Tentativa</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <LogDetails key={log.id} log={log} />
                ))}
              </TableBody>
            </Table>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Linhas por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </TableContainer>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WebhookLogsDialog;
